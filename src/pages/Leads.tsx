import React, { useEffect, useState } from 'react';
import { Download, Search, Loader2, Calendar, ExternalLink, X, Trash2, AlertTriangle } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../lib/auth';
import type { Lead } from '../types';

type DateFilter = 'today' | '7days' | '14days' | '30days' | 'all';

export function Leads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage] = useState(10);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  const dateFilters: { value: DateFilter; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: '7days', label: 'Last 7 days' },
    { value: '14days', label: 'Last 14 days' },
    { value: '30days', label: 'Last 30 days' },
    { value: 'all', label: 'All time' },
  ];

  const getDateRange = (filter: DateFilter) => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    
    switch (filter) {
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.toISOString();
      case '7days':
        const sevenDays = new Date(now);
        sevenDays.setDate(now.getDate() - 7);
        return sevenDays.toISOString();
      case '14days':
        const fourteenDays = new Date(now);
        fourteenDays.setDate(now.getDate() - 14);
        return fourteenDays.toISOString();
      case '30days':
        const thirtyDays = new Date(now);
        thirtyDays.setDate(now.getDate() - 30);
        return thirtyDays.toISOString();
      default:
        return null;
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [dateFilter]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      if (!user?.id) return;

      let q = query(
        collection(db, 'leads'),
        where('chatbot_id', '==', user.id),
        orderBy('created_at', 'desc')
      );

      const dateRange = getDateRange(dateFilter);
      if (dateRange) {
        q = query(
          collection(db, 'leads'),
          where('chatbot_id', '==', user.id),
          where('created_at', '>=', dateRange),
          orderBy('created_at', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setLeads(leads as Lead[]);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    Object.values(lead.answers).some(answer => 
      answer.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Get current leads
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of table
    const tableTop = document.querySelector('.leads-table-container');
    tableTop?.scrollIntoView({ behavior: 'smooth' });
  };

  const exportToCsv = async () => {
    setExportLoading(true);
    try {
      const csvContent = [
        ['Name', 'Email', 'Date', 'Answers'],
        ...filteredLeads.map(lead => [
          lead.name,
          lead.email,
          new Date(lead.created_at).toLocaleDateString(),
          JSON.stringify(lead.answers)
        ])
      ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } finally {
      setExportLoading(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      if (!user?.id) return;

      // Get all leads for the current chatbot
      const q = query(
        collection(db, 'leads'),
        where('chatbot_id', '==', user.id)
      );
      const snapshot = await getDocs(q);

      // Delete each lead document
      await Promise.all(
        snapshot.docs.map(doc => deleteDoc(doc.ref))
      );
      
      // Refresh leads list
      await fetchLeads();
      setShowResetConfirm(false);
    } catch (error) {
      console.error('Error resetting leads. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Leads</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowResetConfirm(true)}
            disabled={leads.length === 0 || resetting}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-md 
              hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {resetting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>Reset Data</span>
          </button>
          <button
            onClick={exportToCsv}
            disabled={exportLoading || leads.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-brand text-black rounded-md 
              hover:bg-brand/90 disabled:opacity-50 transition-colors"
          >
            {exportLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-800 rounded-lg shadow-xl border border-gray-700 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 text-red-400 mb-4">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-medium">Confirm Reset</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete all leads? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 bg-dark-700 text-gray-300 rounded-md 
                    hover:bg-dark-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  disabled={resetting}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white 
                    rounded-md hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {resetting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Reset All Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="bg-dark-800 rounded-lg shadow-lg border border-gray-800">
        <div className="p-4 border-b border-gray-400/10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-gray-700 rounded-md text-gray-100 placeholder-gray-500 focus:border-brand focus:ring-brand"
            />
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto md:overflow-visible">
              <Calendar className="w-5 h-5 text-gray-400" />
              {dateFilters.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setDateFilter(value)}
                  className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors
                    ${dateFilter === value
                      ? 'bg-brand text-black'
                      : 'bg-dark-700 text-gray-400 hover:text-brand hover:bg-dark-600'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto leads-table-container">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Flow Option
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Answers
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    {searchTerm ? 'No leads found matching your search.' : 'No leads captured yet.'}
                  </td>
                </tr>
              ) : (
                currentLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="hover:bg-dark-700 cursor-pointer"
                    onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                      {lead.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {lead.phone ? (
                        <a 
                          href={`tel:${lead.phone}`}
                          className="flex items-center space-x-1 hover:text-brand"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {lead.phone}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {lead.location?.city && (
                        <span title={`${lead.location.region}, ${lead.location.country}`}>
                          {lead.location.city}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                      <a 
                        href={`mailto:${lead.email}`}
                        className="flex items-center space-x-1 hover:text-brand"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {lead.email}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                      {lead.answers?.['Flow Option'] || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400" title={new Date(lead.created_at).toLocaleString()}>
                      {new Date(lead.created_at).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 relative">
                      {selectedLead?.id === lead.id ? (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                          <div className="bg-dark-800 rounded-lg shadow-xl border border-gray-400/10 w-full max-w-2xl max-h-[80vh] overflow-hidden">
                            <div className="p-4 border-b border-gray-400/10 flex justify-between items-center">
                              <h3 className="text-lg font-medium text-gray-100">Lead Details</h3>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLead(null);
                                }}
                                className="p-1 hover:bg-dark-700 rounded-lg transition-colors"
                              >
                                <X className="w-5 h-5 text-gray-400" />
                              </button>
                            </div>
                            <div className="p-6 overflow-y-auto max-h-[calc(80vh-4rem)]">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-400 mb-2">Contact Information</h4>
                                  <div className="space-y-4">
                                    <div>
                                      <p className="text-xs text-gray-400">Name</p>
                                      <p className="text-gray-100">{lead.name}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-400">Phone</p>
                                      {lead.phone ? (
                                        <a 
                                          href={`tel:${lead.phone}`}
                                          className="text-gray-100 hover:text-brand flex items-center space-x-1"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <span>{lead.phone}</span>
                                          <ExternalLink className="w-4 h-4" />
                                        </a>
                                      ) : (
                                        <p className="text-gray-400">-</p>
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-400">Location</p>
                                      <p className="text-gray-100">
                                        {lead.location?.city && (
                                          `${lead.location.city}, ${lead.location.region}, ${lead.location.country}`
                                        )}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-400">Email</p>
                                      <a 
                                        href={`mailto:${lead.email}`}
                                        className="text-gray-100 hover:text-brand flex items-center space-x-1"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <span>{lead.email}</span>
                                        <ExternalLink className="w-4 h-4" />
                                      </a>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-400">Date</p>
                                      <p className="text-gray-100">
                                        {new Date(lead.created_at).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-400 mb-2">Additional Information</h4>
                                  <div className="space-y-4">
                                    {Object.entries(lead.answers)
                                      .filter(([question]) => 
                                        // Filter out system fields and basic contact info
                                        !['Flow Option'].includes(question) &&
                                        !question.toLowerCase().includes('name') &&
                                        !question.toLowerCase().includes('email') &&
                                        !question.toLowerCase().includes('phone')
                                      )
                                      .map(([question, answer]) => (
                                        <div key={question}>
                                          <p className="text-xs text-gray-400">{question}</p>
                                          <p className="text-gray-100 break-words">{answer}</p>
                                        </div>
                                      ))
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-brand hover:text-brand/80">
                          View Details
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* Pagination Controls */}
          {filteredLeads.length > leadsPerPage && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-400/10">
              <div className="text-sm text-gray-400">
                Showing {indexOfFirstLead + 1} to {Math.min(indexOfLastLead, filteredLeads.length)} of {filteredLeads.length} leads
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-dark-700 text-gray-400 rounded-md hover:bg-dark-600 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(pageNum => {
                    // Show first page, last page, current page, and pages around current page
                    const showAround = Math.abs(pageNum - currentPage) <= 1;
                    return pageNum === 1 || pageNum === totalPages || showAround;
                  })
                  .map((pageNum, i, arr) => (
                    <React.Fragment key={pageNum}>
                      <button
                        onClick={() => handlePageChange(pageNum)}
                        className={`min-w-[32px] h-8 flex items-center justify-center rounded-md text-sm
                          transition-colors ${currentPage === pageNum
                            ? 'bg-brand text-black'
                            : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                          }`}
                      >
                        {pageNum}
                      </button>
                      {/* Add ellipsis if there's a gap */}
                      {i < arr.length - 1 && arr[i + 1] - pageNum > 1 && (
                        <span className="px-2 text-gray-600">...</span>
                      )}
                    </React.Fragment>
                  ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-dark-700 text-gray-400 rounded-md hover:bg-dark-600 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}