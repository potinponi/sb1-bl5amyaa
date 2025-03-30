import React from 'react';
import type { Feedback } from '../../types';

interface UserSatisfactionProps {
  feedback: Feedback[];
  totalFeedback: number;
  satisfiedCount: number;
  satisfactionRate: number;
}

export function UserSatisfaction({
  feedback,
  totalFeedback,
  satisfiedCount,
  satisfactionRate
}: UserSatisfactionProps) {
  return (
    <div className="lg:col-span-3 bg-dark-800 rounded-lg shadow-lg border border-gray-400/10 p-6">
      <h2 className="text-lg font-medium text-gray-100 mb-4">User Satisfaction</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-dark-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Total Feedback</h3>
          <p className="text-3xl font-bold text-gray-100">{totalFeedback}</p>
        </div>
        <div className="p-4 bg-dark-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Satisfied Users</h3>
          <p className="text-3xl font-bold text-brand">{satisfiedCount}</p>
        </div>
        <div className="p-4 bg-dark-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Satisfaction Rate</h3>
          <p className="text-3xl font-bold text-gray-100">{satisfactionRate}%</p>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Recent Feedback</h3>
        <div className="space-y-2">
          {feedback.slice(0, 5).map(item => (
            <div 
              key={item.id}
              className="flex items-center justify-between p-3 bg-dark-700 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <div 
                  className={`w-2 h-2 rounded-full ${
                    item.satisfied ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-gray-300">
                  {item.satisfied ? 'Satisfied' : 'Not Satisfied'}
                </span>
              </div>
              <span className="text-sm text-gray-400">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}