import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../lib/auth';
import type { Lead, Feedback, ChatInteraction } from '../types';
import { StatsCards } from '../components/Analytics/StatsCards';
import { ChatInteractions } from '../components/Analytics/ChatInteractions';
import { LocationStats } from '../components/Analytics/LocationStats';
import { LeadAcquisition } from '../components/Analytics/LeadAcquisition';
import { UserSatisfaction } from '../components/Analytics/UserSatisfaction';
import { FlowDistribution } from '../components/Analytics/FlowDistribution';
import { DateFilter } from '../components/Analytics/DateFilter';

type DateFilter = 'today' | '7days' | '14days' | '30days' | 'all';

// Constant for estimated views (used across the application)
const ESTIMATED_TOTAL_VIEWS = 50;

interface DailyStats {
  date: string;
  count: number;
  conversionRate: number;
}

interface FlowStats {
  option: string;
  count: number;
  percentage: number;
  color: string;
}

export function Analytics() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [interactions, setInteractions] = useState<ChatInteraction[]>([]);
  const { user } = useAuth();
  const [dateFilter, setDateFilter] = useState<DateFilter>('30days');
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [flowStats, setFlowStats] = useState<FlowStats[]>([]);
  const [locationStats, setLocationStats] = useState<{
    cities: { name: string; count: number }[];
    countries: { name: string; count: number }[];
  }>({ cities: [], countries: [] });

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
    fetchFeedback();
    fetchInteractions();
  }, [dateFilter]);

  const fetchInteractions = async () => {
    try {
      if (!user?.id) return;

      let q = query(
        collection(db, 'chat_interactions'),
        where('chatbot_id', '==', user.id),
        orderBy('created_at', 'desc')
      );

      const dateRange = getDateRange(dateFilter);
      if (dateRange) {
        q = query(
          collection(db, 'chat_interactions'),
          where('chatbot_id', '==', user.id),
          where('created_at', '>=', dateRange),
          orderBy('created_at', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const interactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInteractions(interactions as ChatInteraction[]);
    } catch (error) {
      console.error('Error fetching interactions:', error);
    }
  };

  const fetchFeedback = async () => {
    try {
      if (!user?.id) return;

      let q = query(
        collection(db, 'feedback'),
        where('chatbot_id', '==', user.id),
        orderBy('created_at', 'desc')
      );

      const dateRange = getDateRange(dateFilter);
      if (dateRange) {
        q = query(
          collection(db, 'feedback'),
          where('chatbot_id', '==', user.id),
          where('created_at', '>=', dateRange),
          orderBy('created_at', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const feedback = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeedback(feedback as Feedback[]);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

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
      calculateDailyStats(leads as Lead[]);
      calculateFlowStats(leads as Lead[]);
      calculateLocationStats(leads as Lead[]);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLocationStats = (leads: Lead[]) => {
    const cities = new Map<string, number>();
    const countries = new Map<string, number>();

    leads.forEach(lead => {
      if (lead.location?.city) {
        cities.set(lead.location.city, (cities.get(lead.location.city) || 0) + 1);
      }
      if (lead.location?.country) {
        countries.set(lead.location.country, (countries.get(lead.location.country) || 0) + 1);
      }
    });

    setLocationStats({
      cities: Array.from(cities.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      countries: Array.from(countries.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    });
  };

  const calculateDailyStats = (leads: Lead[]) => {
    const stats = new Map<string, { count: number; conversionRate: number }>();
    
    // Calculate daily conversion rate based on total views
    const dailyViews = ESTIMATED_TOTAL_VIEWS;
    
    // Initialize dates
    const endDate = new Date();
    const startDate = new Date(getDateRange(dateFilter) || endDate);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      stats.set(dateStr, { count: 0, conversionRate: 0 });
    }

    // Count leads per day
    leads.forEach(lead => {
      const dateStr = new Date(lead.created_at).toISOString().split('T')[0];
      const current = stats.get(dateStr) || { count: 0, conversionRate: 0 };
      const newCount = current.count + 1;
      const conversionRate = Math.round((newCount / dailyViews) * 100);
      stats.set(dateStr, { count: newCount, conversionRate });
    });

    // Convert to array
    const dailyStatsArray = Array.from(stats.entries()).map(([date, data]) => ({
      date,
      count: data.count,
      conversionRate: data.conversionRate
    }));

    setDailyStats(dailyStatsArray);
  };

  const calculateFlowStats = (leads: Lead[]) => {
    const optionCounts = leads.reduce((acc, lead) => {
      // Get the first answer which should be the flow choice
      const [, flowChoice] = Object.entries(lead.answers)[0] || ['', 'Unknown Path'];
      // Clean up the flow choice text
      const option = flowChoice.charAt(0).toUpperCase() + flowChoice.slice(1);
      acc[option] = (acc[option] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(optionCounts).reduce((sum, count) => sum + count, 0);
    
    const colors = ['#a7e154', '#54e1a7', '#5454e1', '#e154a7'];
    
    const stats = Object.entries(optionCounts).map(([option, count], index) => ({
      option,
      count,
      percentage: Math.round((count / total) * 100),
      color: colors[index % colors.length]
    }));

    setFlowStats(stats);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  const totalLeads = leads.length;
  const conversionRate = Math.round((totalLeads / ESTIMATED_TOTAL_VIEWS) * 100);
  
  // Calculate interaction stats
  const totalOpens = interactions.filter(i => i.type === 'open').length;
  const uniqueSessions = new Set(interactions.map(i => i.session_id)).size;
  const conversionsFromChat = interactions.filter(i => i.converted).length;
  const chatConversionRate = totalOpens > 0 ? Math.round((conversionsFromChat / totalOpens) * 100) : 0;
  
  const uniqueEmails = new Set(leads.map(lead => lead.email)).size;
  const uniquePhones = new Set(leads.map(lead => lead.phone).filter(Boolean)).size;

  // Calculate feedback stats
  const totalFeedback = feedback.length;
  const satisfiedCount = feedback.filter(f => f.satisfied).length;
  const satisfactionRate = totalFeedback > 0 
    ? Math.round((satisfiedCount / totalFeedback) * 100) 
    : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Analytics</h1>
        <DateFilter dateFilter={dateFilter} setDateFilter={setDateFilter} />
      </div>

      <StatsCards
        totalLeads={totalLeads}
        uniqueEmails={uniqueEmails}
        uniquePhones={uniquePhones}
        conversionRate={conversionRate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <ChatInteractions
          interactions={interactions}
          totalOpens={totalOpens}
        />
        <LocationStats
          cities={locationStats.cities}
          countries={locationStats.countries}
        />
        <LeadAcquisition dailyStats={dailyStats} />
        <UserSatisfaction
          feedback={feedback}
          totalFeedback={totalFeedback}
          satisfiedCount={satisfiedCount}
          satisfactionRate={satisfactionRate}
        />
        <FlowDistribution flowStats={flowStats} />
      </div>
    </div>
  );
}