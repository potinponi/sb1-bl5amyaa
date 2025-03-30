import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, X, Loader2 } from 'lucide-react';
import type { Theme } from '../../types';

interface EndScreenProps {
  endMessage: string;
  theme?: Theme;
  onClose: () => void;
  onFeedback?: (satisfied: boolean) => void;
}

export function EndScreen({ endMessage, theme, onClose, onFeedback }: EndScreenProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showCloseButton, setShowCloseButton] = useState(false);

  const handleFeedbackSubmit = async (satisfied: boolean) => {
    if (saving) return;
    setSaving(true);
    setSelectedFeedback(satisfied);
    
    try {
      await onFeedback?.(satisfied);
      setSubmitted(true);
      setShowCloseButton(true);
      // Don't close automatically, let user close when ready
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-lg overflow-hidden text-black"
      style={{ 
        backgroundColor: theme?.primaryColor || '#a7e154',
        borderRadius: theme?.borderRadius || '0.5rem'
      }}
    >
      <div 
        className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-10"
        style={{ color: theme?.headerTextColor || '#ffffff' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-black/10 transition-colors"
          style={{ color: theme?.headerTextColor || '#ffffff' }}
          aria-label="Close feedback"
        >
          <X className="w-5 h-5" />
        </button>

        <p className="text-xl font-medium">
          {submitted ? 'Thank you for your feedback!' : endMessage}
        </p>
        
        <div className="flex items-center justify-center space-x-12">
          {[true, false].map((satisfied) => (
            <button
              key={satisfied ? 'satisfied' : 'unsatisfied'}
              onClick={() => handleFeedbackSubmit(satisfied)}
              disabled={saving || submitted}
              className={`p-3 rounded-full transition-all duration-200 relative
                ${selectedFeedback === satisfied ? 'scale-110 bg-black/10' : 'hover:-translate-y-1'}
                ${(saving || submitted) ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ 
                color: theme?.headerTextColor || '#ffffff'
              }}
              aria-label={satisfied ? 'Satisfied' : 'Not satisfied'}
            >
              {saving && selectedFeedback === satisfied ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : satisfied ? (
                <ThumbsUp className={`w-8 h-8 ${selectedFeedback === satisfied ? 'animate-bounce' : ''}`} />
              ) : (
                <ThumbsDown className={`w-8 h-8 ${selectedFeedback === satisfied ? 'animate-bounce' : ''}`} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}