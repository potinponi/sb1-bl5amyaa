import React from 'react';
import { X } from 'lucide-react';
import type { Option } from '../../../types';
import { CalendarSettings } from './CalendarSettings';

interface QuestionListProps {
  option: Option;
  index: number;
  options: Option[];
  setOptions: (options: Option[]) => void;
}

export function QuestionList({
  option,
  index,
  options,
  setOptions
}: QuestionListProps) {
  return (
    <div className="space-y-2">
      {option.flow.map((question, qIndex) => (
        <div 
          key={question.id}
          className="relative flex items-start space-x-2 p-3 bg-dark-700 rounded-lg border border-gray-700"
        >
          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-dark-600 text-xs text-gray-400">
            {qIndex + 1}
          </span>
          <div className="flex-1 space-y-2 min-w-0">
            <input
              type="text"
              value={question.label}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index].flow[qIndex] = {
                  ...question,
                  label: e.target.value
                };
                setOptions(newOptions);
              }}
              className="w-full bg-transparent border-none text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-brand rounded px-1"
            />
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={question.type}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index].flow[qIndex] = {
                    ...question,
                    type: e.target.value as 'text' | 'email' | 'phone' | 'calendar'
                  };
                  setOptions(newOptions);
                }}
                className="text-xs bg-dark-900 border border-gray-700 rounded px-2 py-1 text-gray-300 focus:border-brand focus:ring-brand"
                style={{
                  backgroundColor: '#121212',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  paddingRight: '2rem'
                }}
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="calendar">Calendar Integration</option>
              </select>
              
              {question.type === 'calendar' && (
                <CalendarSettings
                  question={question}
                  index={index}
                  qIndex={qIndex}
                  options={options}
                  setOptions={setOptions}
                />
              )}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <button
              onClick={() => {
                const newOptions = [...options];
                newOptions[index].flow = option.flow.filter(
                  (_, i) => i !== qIndex
                );
                setOptions(newOptions);
              }}
              className="p-1 hover:bg-dark-600 rounded text-gray-400 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index].flow[qIndex] = {
                    ...question,
                    required: e.target.checked
                  };
                  setOptions(newOptions);
                }}
                className="rounded border-gray-600 bg-dark-600 text-brand focus:ring-brand"
              />
              <span className="text-xs text-gray-400">Required</span>
            </label>
          </div>
        </div>
      ))}
      <button
        onClick={() => {
          const newOptions = [...options];
          newOptions[index].flow.push({
            id: String(Date.now()),
            type: 'text',
            label: 'New Question',
            required: false
          });
          setOptions(newOptions);
        }}
        className="w-full py-2 px-3 bg-dark-700 hover:bg-dark-600 border border-gray-700 
          hover:border-gray-600 rounded-lg text-sm text-gray-400 hover:text-gray-300 
          transition-colors"
      >
        Add Question
      </button>
    </div>
  );
}