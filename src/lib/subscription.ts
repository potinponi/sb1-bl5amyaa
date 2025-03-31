import { useState, useEffect } from 'react';
import { useAuth } from './auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export type SubscriptionStatus = 'trial' | 'expired' | 'pro';

interface UseSubscriptionReturn {
  daysRemaining: number | null;
  status: SubscriptionStatus;
  canAccessFeature: (feature: 'builder' | 'leads' | 'analytics' | 'code') => boolean;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!user) {
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          // If no user doc exists, create one with trial period
          const trialEnd = new Date();
          trialEnd.setDate(trialEnd.getDate() + 14); // 14 days trial
          
          setDaysRemaining(14);
          setStatus('trial');          
          return;
        }

        const userData = userDoc.data();
        const trialEnd = userData.trial_end ? new Date(userData.trial_end) : new Date();
        const now = new Date();
        
        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        const remaining = (trialEnd.getTime() - now.getTime()) / millisecondsPerDay;
        
        const daysLeft = Math.max(0, Math.floor(remaining));
        setDaysRemaining(daysLeft);
        
        // Set status based on trial days remaining
        if (daysLeft > 0) {
          setStatus('trial');          
        }
      } 
      catch (error) {
        console.error('Error fetching subscription status:', error);
        setStatus('expired');
        setDaysRemaining(0);
      }
    };

    fetchSubscriptionStatus();
  }, [user]);

  const canAccessFeature = (feature: 'builder' | 'leads' | 'analytics' | 'code'): boolean => {
    // During trial period, all features are accessible
    if (status === 'trial' || status === 'pro') return true;
    
    // After trial, only basic features are accessible
    if (status === 'expired') {
      return false;
    }

   
    return true;
  };

  return {
    daysRemaining,
    status,
    canAccessFeature
  };
}