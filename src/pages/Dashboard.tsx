import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquarePlus, Users, BarChart3, Loader2, PhoneCall, Mail, Bell } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../lib/auth';
import { useSubscription } from '../lib/subscription';
import { TrialBanner } from '../components/TrialBanner';
import type { Lead } from '../types';

// Constant for estimated views (used across the application)
const ESTIMATED_TOTAL_VIEWS = 50;

interface Stats {
  totalLeads: number;
  uniqueEmails: number;
  uniquePhones: number;
  conversionRate: number;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { status } = useSubscription();
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    uniqueEmails: 0,
    uniquePhones: 0,
    conversionRate: 0
  });
  
  const { daysRemaining } = useSubscription();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchNewLeadsCount = async () => {
    try {
      if (!user?.uid) return;

      const q = query(
        collection(db, 'leads'),
        where('chatbot_id', '==', user.uid),
        where('created_at', '>=', user.metadata.lastSignInTime)
      );

      const snapshot = await getDocs(q);
      
      setNewLeadsCount(snapshot.docs.length);
    } catch (error) {
      console.error('Error fetching new leads count:', error);
    }
  };

  const fetchStats = async () => {
    try {
      if (!user?.uid) return;

      const q = query(
        collection(db, 'leads'),
        where('chatbot_id', '==', user.uid)
      );

      const snapshot = await getDocs(q);
      const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const uniqueEmails = new Set(leads?.map(lead => lead.email)).size;
      const uniquePhones = new Set(
        leads?.map(lead => 
          Object.entries(lead.answers).find(([q]) => q.toLowerCase().includes('phone'))?.[1]
        ).filter(Boolean)
      ).size;

      const conversionRate = Math.round((leads.length || 0) / ESTIMATED_TOTAL_VIEWS * 100);

      setStats({
        totalLeads: leads?.length || 0,
        uniqueEmails,
        uniquePhones,
        conversionRate
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Leads', value: stats.totalLeads, icon: Users },
    { label: 'Unique Emails', value: stats.uniqueEmails, icon: Mail },
    { label: 'Unique Phone Numbers', value: stats.uniquePhones, icon: PhoneCall },
    { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: BarChart3 },
  ];

  return (
    <div>
      <TrialBanner />
      <div className="mt-10">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Dashboard</h1>
      
      {status === 'expired' && (
        <div className="mb-8 p-6 bg-red-500/10 border border-gray-400/10 rounded-lg">
          <h2 className="text-lg font-medium text-red-400 mb-2">Trial Period Expired</h2>
          <p className="text-gray-400 mb-4">
            Your trial period has ended. Upgrade to Pro to continue using all features and keep your chatbot active.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2 bg-brand text-black rounded-md hover:bg-brand/90 transition-colors"
          >
            Upgrade Now
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-dark-800 rounded-lg shadow-lg border border-gray-400/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{label}</p>
                <p className="text-2xl font-semibold text-gray-100">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
              </div>
              <Icon className="w-8 h-8 text-brand" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-dark-800 rounded-lg shadow-lg border border-gray-400/10">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-100 mb-4">
            <div className="flex items-center justify-between">
              <span>Quick Actions</span>
              {newLeadsCount > 0 && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-brand/10 text-brand rounded-full text-sm">
                  <Bell className="w-4 h-4" />
                  <span>{newLeadsCount} new {newLeadsCount === 1 ? 'lead' : 'leads'}</span>
                </div>
              )}
            </div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/builder"
              className="flex items-center space-x-3 p-4 rounded-lg bg-dark-700 border border-gray-400/10 hover:border-brand hover:text-brand transition-colors"
            >
              <MessageSquarePlus className="w-6 h-6" />
              <div>
                <p className="font-medium">Create Chatbot</p>
                <p className="text-sm text-gray-400">
                  Design your lead generation flow
                </p>
              </div>
            </Link>
            <Link
              to="/leads"
              className="flex items-center space-x-3 p-4 rounded-lg bg-dark-700 border border-gray-400/10 hover:border-brand hover:text-brand transition-colors"
            >
              <Users className="w-6 h-6" />
              <div>
                <p className="font-medium">View Leads</p>
                <p className="text-sm text-gray-400">
                  View and export your leads
                </p>
              </div>
            </Link>
            <Link
              to="/analytics"
              className="flex items-center space-x-3 p-4 rounded-lg bg-dark-700 border border-gray-400/10 hover:border-brand hover:text-brand transition-colors"
            >
              <BarChart3 className="w-6 h-6" />
              <div>
                <p className="font-medium">Analytics</p>
                <p className="text-sm text-gray-400">
                  Monitor conversion metrics
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}