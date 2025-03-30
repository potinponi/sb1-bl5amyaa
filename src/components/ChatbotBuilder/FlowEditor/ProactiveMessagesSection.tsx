import React, { useState } from 'react';
import { BellRing, PlusCircle, Trash2, ChevronDown } from 'lucide-react';

export interface ProactiveMessages {
  enabled: boolean;
  messages: string[];
  delay: number;
  interval: number;
  maxMessages: number;
}

interface ProactiveMessagesSectionProps {
  proactiveMessages: ProactiveMessages;
  setProactiveMessages: (messages: ProactiveMessages) => void;
}

export function ProactiveMessagesSection({
  proactiveMessages,
  setProactiveMessages
}: ProactiveMessagesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Validate proactiveMessages to ensure it has default values
  const validatedMessages = {
    enabled: proactiveMessages?.enabled ?? false,
    messages: proactiveMessages?.messages ?? [],
    delay: proactiveMessages?.delay ?? 30,
    interval: proactiveMessages?.interval ?? 60,
    maxMessages: proactiveMessages?.maxMessages ?? 3
  };

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)}
      className="group bg-dark-700/50 hover:bg-dark-700/80 transition-colors rounded-lg border border-gray-400/10"
    >
      <div className="p-4 flex items-center justify-between cursor-move drag-handle">
        <div className="flex items-center space-x-3">
          <BellRing className="w-5 h-5 text-brand" />
          <div>
            <h2 className="text-base font-medium text-gray-100">Time-based Proactive Messages</h2>
            <p className="text-sm text-gray-400">Show messages after specific time intervals</p>
          </div>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-400/10 mt-2 pt-4">
          <div className="space-y-4 pl-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Messages
              </label>
              {validatedMessages.messages.map((message, index) => (
                <div key={index} className="flex items-start space-x-2 mb-2">
                  <textarea
                    value={message}
                    onChange={(e) => {
                      const newMessages = [...validatedMessages.messages];
                      newMessages[index] = e.target.value;
                      setProactiveMessages({
                        ...validatedMessages,
                        messages: newMessages
                      });
                    }}
                    className="flex-1 px-3 py-2 bg-dark-900 border border-gray-700 rounded-md 
                      text-gray-100 text-sm min-h-[60px]"
                    rows={2}
                    placeholder="Enter a proactive message..."
                  />
                  <button
                    onClick={() => {
                      const newMessages = validatedMessages.messages.filter((_, i) => i !== index);
                      setProactiveMessages({
                        ...validatedMessages,
                        messages: newMessages
                      });
                    }}
                    className="p-2 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setProactiveMessages({
                  ...validatedMessages,
                  messages: [...validatedMessages.messages, "👋 Need help? I'm here to assist!"]
                })}
                className="flex items-center space-x-2 text-brand hover:text-brand/80 text-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Message</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Delay (sec)
                </label>
                <input
                  type="number"
                  min="0"
                  value={validatedMessages.delay}
                  onChange={(e) => setProactiveMessages({
                    ...validatedMessages,
                    delay: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 bg-dark-900 border border-gray-700 rounded-md 
                    text-gray-100 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Interval (sec)
                </label>
                <input
                  type="number"
                  min="0"
                  value={validatedMessages.interval}
                  onChange={(e) => setProactiveMessages({
                    ...validatedMessages,
                    interval: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 bg-dark-900 border border-gray-700 rounded-md 
                    text-gray-100 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Messages
                </label>
                <input
                  type="number"
                  min="1"
                  value={validatedMessages.maxMessages}
                  onChange={(e) => setProactiveMessages({
                    ...validatedMessages,
                    maxMessages: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 bg-dark-900 border border-gray-700 rounded-md 
                    text-gray-100 text-sm"
                />
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-400/10">
              <div className="flex items-center justify-between">
                <span className="text-gray-100">Enable time-based messages</span>
                <div 
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer
                    ${validatedMessages.enabled ? 'bg-brand' : 'bg-dark-700'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setProactiveMessages({
                      ...validatedMessages,
                      enabled: !validatedMessages.enabled
                    });
                  }}
                >
                  <div 
                    className={`absolute w-5 h-5 rounded-full bg-white top-0.5 transition-transform
                      ${validatedMessages.enabled ? 'translate-x-6' : 'translate-x-0.5'}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}