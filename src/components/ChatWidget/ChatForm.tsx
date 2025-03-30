import React, { useState } from 'react';
import type { Question } from '../../types';
import { Send } from 'lucide-react';

/**
 * Props for the ChatForm component
 */
interface ChatFormProps {
  /** Question to display and validate */
  question: Question;
  /** Callback when user submits a valid answer */
  onSubmit: (answer: string) => void;
  /** Optional callback for skipping optional questions */
  onSkip?: () => void;
  /** Theme configuration for styling */
  theme?: {
    primaryColor?: string;
    gradient?: {
      from: string;
      to: string;
    };
  };
}

/**
 * Form component for collecting user responses in the chat widget
 * Handles validation and formatting based on question type
 */
export function ChatForm({ question, onSubmit, onSkip, theme }: ChatFormProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  /**
   * Validates and submits the form
   * Performs type-specific validation (email, phone)
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (question.required && !value) {
      setError('This field is required');
      return;
    }

    // Email validation
    if (question.type === 'email' && !value.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    // Phone number validation using regex
    // Phone validation
    if (question.type === 'phone') {
      // Accepts various phone formats including international
      const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
      if (!phoneRegex.test(value)) {
        setError('Please enter a valid phone number (e.g., +1234567890 or 123-456-7890)');
        return;
      }
    }

    onSubmit(value);
    setValue('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <input
            type={question.type}
            value={value}
            pattern={question.type === 'phone' ? '[0-9+()-\s]*' : undefined}
            style={{ backgroundColor: 'var(--input-color)' }}
            onChange={(e) => {
              setValue(e.target.value);
              setError('');
            }}
            className="w-full px-3 py-2 rounded-xl 
              text-gray-100 placeholder-gray-500 
              focus:outline-none focus:ring-1
              disabled:opacity-50
              focus:ring-brand"
            style={{ backgroundColor: 'var(--input-color)' }}
            placeholder={`Type your ${
              question.type === 'email' ? 'email' : 
              question.type === 'phone' ? 'phone number' : 
              'answer'
            }...`}
          />
        </div>
        <button
          type="submit"
          className="p-2 text-black rounded-xl hover:opacity-90 disabled:opacity-50"
          style={{
            background: theme?.gradient 
              ? `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.to})`
              : 'var(--primary-color)'
          }}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
      
      <div className="flex justify-end mt-2">
        {!question.required && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-gray-400 hover:text-gray-300"
          >
            Skip
          </button>
        )}
      </div>
    </form>
  );
}