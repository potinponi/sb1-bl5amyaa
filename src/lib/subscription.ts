import { useState, useEffect } from 'react';
import { useAuth } from './auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export type SubscriptionStatus = 'trial' | 'expired' | 'pro';

interface UseSubscriptionReturn {
  daysRemaining: number;
  status: SubscriptionStatus;
  canAccessFeature: (feature: 'builder' | 'leads' | 'analytics' | 'code') => boolean;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>('expired');
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!user) {
        setStatus('expired');
        setDaysRemaining(0);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          // If no user doc exists, set as expired
          setDaysRemaining(0);
          setStatus('expired');
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        if (!userData.trial_end) {
          setDaysRemaining(0);
          setStatus('expired');
          setLoading(false);
          return;
        }

        const trialEnd = new Date(userData.trial_end);
        const now = new Date();
        
        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        const remaining = (trialEnd.getTime() - now.getTime()) / millisecondsPerDay;
        
        const daysLeft = Math.max(0, Math.floor(remaining));
        setDaysRemaining(daysLeft);
        
        // Set status based on trial days remaining
        if (daysLeft > 0) {
          setStatus('trial');
        } else {
          setStatus('expired');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching subscription status:', error);
        setStatus('expired');
        setDaysRemaining(0);
      }
    };

    fetchSubscriptionStatus();
  }, [user]);

  const canAccessFeature = (feature: 'builder' | 'leads' | 'analytics' | 'code'): boolean => {
    // During trial period, all features are accessible
    if (status === 'trial') return true;

    // After trial, only basic features are accessible
    if (status === 'expired') {
      return false;
    }

    // Pro users have access to all features
    return true;
  };

  return {
    daysRemaining,
    status,
    loading,
    canAccessFeature
  };
}