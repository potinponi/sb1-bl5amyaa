import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useSubscription } from '../lib/subscription';

export function TrialBanner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { daysRemaining } = useSubscription();

  return (
    <div className="fixed top-0 left-20 right-0 z-[45] bg-dark-800 border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-10 px-4">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-400">
            Trial Period: {daysRemaining > 0 ? (
              <span className="text-brand">{daysRemaining} days remaining</span>
            ) : (
              <span className="text-red-400">Expired</span>
            )}
          </span>
          {daysRemaining > 0 && (
            <span className="text-xs text-gray-500">
              • All Pro features included
            </span>
          )}
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="text-sm px-3 py-1 bg-brand text-black rounded-md hover:bg-brand/90 transition-colors"
        >
          Upgrade to Pro
        </button>
      </div>
    </div>
  );
}