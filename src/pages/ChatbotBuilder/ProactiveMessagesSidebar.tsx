import React from 'react';
import { Lightbulb, MessageSquare, Clock, Bot } from 'lucide-react';

export function ProactiveMessagesSidebar() {
  return (
    <div className="w-64 min-h-[calc(100vh-96px)] bg-dark-800/50 border-r border-gray-800 p-6 space-y-8">
      <div>
        <h2 className="text-lg font-medium text-gray-100 mb-4">Getting Started</h2>
        <div className="space-y-4">
          <div className="p-4 bg-dark-900 rounded-lg border border-gray-800">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="w-5 h-5 text-brand" />
              <h3 className="font-medium text-gray-200">What are Proactive Messages?</h3>
            </div>
            <p className="text-sm text-gray-400">
              Messages that automatically engage visitors based on their behavior or time spent on your site.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium text-gray-100 mb-4">Features</h2>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Bot className="w-5 h-5 text-brand mt-1" />
            <div>
              <h3 className="text-sm font-medium text-gray-200">Smart Detection</h3>
              <p className="text-sm text-gray-400">
                Automatically detect products and categories your visitors are viewing
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-brand mt-1" />
            <div>
              <h3 className="text-sm font-medium text-gray-200">Time-based</h3>
              <p className="text-sm text-gray-400">
                Show messages after specific time intervals
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <MessageSquare className="w-5 h-5 text-brand mt-1" />
            <div>
              <h3 className="text-sm font-medium text-gray-200">Custom Messages</h3>
              <p className="text-sm text-gray-400">
                Create personalized messages for different scenarios
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}