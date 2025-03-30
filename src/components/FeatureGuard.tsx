import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../lib/subscription';
import { AlertTriangle } from 'lucide-react';

interface FeatureGuardProps {
  feature: 'builder' | 'leads' | 'analytics' | 'code';
  children: React.ReactNode;
}

export function FeatureGuard({ feature, children }: FeatureGuardProps) {
  const navigate = useNavigate();
  const { canAccessFeature, status } = useSubscription();

  if (!canAccessFeature(feature)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-medium text-gray-100">
              {status === 'expired' ? 'Trial Period Expired' : 'Access Restricted'}
            </h2>
            <p className="text-gray-400 max-w-md">
              This feature is only available to Pro users or during the trial period.
              Please upgrade your plan to continue using this feature.
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="inline-block mt-4 px-4 py-2 bg-brand text-black rounded-md 
                hover:bg-brand/90 transition-colors"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}