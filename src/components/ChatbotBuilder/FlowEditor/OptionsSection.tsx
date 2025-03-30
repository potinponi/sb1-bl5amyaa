import React from 'react';
import { Settings, PlusCircle, Trash2 } from 'lucide-react';
import type { Option } from '../../../types';

interface OptionsSectionProps {
  options: Option[];
  setOptions: (options: Option[]) => void;
}

export function OptionsSection({ options, setOptions }: OptionsSectionProps) {
  return (
    <>
      <div className="p-6 bg-dark-700/40 hover:bg-dark-700/70 transition-colors rounded-lg border border-gray-800">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-brand" />
          <h2 className="text-base font-medium text-gray-100">Initial Options</h2>
        </div>
        
        {options.map((option, optionIndex) => (
          <div
            key={option.id}
            className="mb-6 last:mb-0"
          >
            <div className="flex items-center space-x-4 mb-2">
              <input
                type="text"
                value={option.label}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[optionIndex] = {
                    ...option,
                    label: e.target.value
                  };
                  setOptions(newOptions);
                }}
                className="flex-1 px-3 py-2 bg-dark-900 border border-gray-700 rounded-md text-gray-100"
                placeholder="Enter option label"
              />
              <button
                onClick={() => {
                  const newOptions = options.filter((_, i) => i !== optionIndex);
                  setOptions(newOptions);
                }}
                className="p-2 text-gray-400 hover:text-red-400"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="ml-4 pl-4 border-l border-gray-700 space-y-4">
              {option.flow.map((question, questionIndex) => (
                <div
                  key={question.id}
                  className="flex items-start space-x-4 p-4 border border-gray-700 rounded-lg bg-dark-700"
                >
                  <div className="flex-1 space-y-4">
                    <input
                      type="text"
                      value={question.label}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[optionIndex].flow[questionIndex] = {
                          ...question,
                          label: e.target.value
                        };
                        setOptions(newOptions);
                      }}
                      className="w-full px-3 py-2 bg-dark-900 border border-gray-700 rounded-md text-gray-100 text-sm min-h-[40px]"
                      rows={2}
                      placeholder="Enter question"
                    />
                    <div className="flex items-center space-x-4">
                      <select
                        value={question.type}
                        onChange={(e) => {
                          const newOptions = [...options];
                          newOptions[optionIndex].flow[questionIndex] = {
                            ...question,
                            type: e.target.value as 'text' | 'email' | 'phone'
                          };
                          setOptions(newOptions);
                        }}
                        className="px-3 py-2 bg-dark-900 border border-gray-700 rounded-md text-gray-100 text-sm"
                      >
                        <option value="text">Text</option>
                        <option value="phone">Phone</option>
                        <option value="email">Email</option>
                      </select>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) => {
                            const newOptions = [...options];
                            newOptions[optionIndex].flow[questionIndex] = {
                              ...question,
                              required: e.target.checked
                            };
                            setOptions(newOptions);
                          }}
                          className="rounded border-gray-700 bg-dark-900 text-brand"
                        />
                        <span className="text-sm text-gray-400">Required</span>
                      </label>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newOptions = [...options];
                      newOptions[optionIndex].flow = option.flow.filter(
                        (_, i) => i !== questionIndex
                      );
                      setOptions(newOptions);
                    }}
                    className="p-2 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => {
                  const newOptions = [...options];
                  newOptions[optionIndex].flow.push({
                    id: String(option.flow.length + 1),
                    type: 'text',
                    label: 'New Question',
                    required: false
                  });
                  setOptions(newOptions);
                }}
                className="flex items-center space-x-2 text-brand hover:text-brand/80 text-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-6 bg-dark-700/60 hover:bg-dark-700/90 transition-colors rounded-lg border border-gray-800">
        <button
          onClick={() => {
            setOptions([
              ...options,
              {
                id: String(options.length + 1),
                label: 'New Option',
                flow: [
                  { id: '1', type: 'text', label: 'What is your name?', required: true },
                  { id: '2', type: 'email', label: 'What is your email?', required: true }
                ]
              }
            ]);
          }}
          className="flex items-center space-x-2 text-brand hover:text-brand/80 text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Option</span>
        </button>
      </div>
    </>
  );
}