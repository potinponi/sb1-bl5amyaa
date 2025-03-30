import React from 'react';
import type { Option, Question } from '../../../types';

interface CalendarSettingsProps {
  question: Question;
  index: number;
  qIndex: number;
  options: Option[];
  setOptions: (options: Option[]) => void;
}

export function CalendarSettings({
  question,
  index,
  qIndex,
  options,
  setOptions
}: CalendarSettingsProps) {
  return (
    <div className="w-full space-y-3 mt-3 p-3 bg-dark-800 rounded-lg border border-gray-700">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Calendar Provider</label>
        <select
          value={question.calendar?.provider || 'google'}
          onChange={(e) => {
            const newOptions = [...options];
            newOptions[index].flow[qIndex] = {
              ...question,
              calendar: {
                ...question.calendar,
                provider: e.target.value as 'google' | 'outlook' | 'calendly'
              }
            };
            setOptions(newOptions);
          }}
          className="w-full text-xs bg-dark-900 border border-gray-700 rounded px-2 py-1 
            text-gray-300 focus:border-brand focus:ring-brand"
        >
          <option value="google">Google Calendar</option>
          <option value="outlook">Outlook Calendar</option>
          <option value="calendly">Calendly</option>
        </select>
      </div>
      
      <div>
        <label className="block text-xs text-gray-400 mb-1">Meeting Duration (minutes)</label>
        <input
          type="number"
          min="15"
          step="15"
          value={question.calendar?.duration || 30}
          onChange={(e) => {
            const newOptions = [...options];
            newOptions[index].flow[qIndex] = {
              ...question,
              calendar: {
                ...question.calendar,
                duration: parseInt(e.target.value)
              }
            };
            setOptions(newOptions);
          }}
          className="w-full text-xs bg-dark-900 border border-gray-700 rounded px-2 py-1 
            text-gray-300 focus:border-brand focus:ring-brand"
        />
      </div>
      
      <div>
        <label className="block text-xs text-gray-400 mb-1">Available Hours</label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="time"
            value={question.calendar?.availableHours?.start || "09:00"}
            onChange={(e) => {
              const newOptions = [...options];
              newOptions[index].flow[qIndex] = {
                ...question,
                calendar: {
                  ...question.calendar,
                  availableHours: {
                    ...question.calendar?.availableHours,
                    start: e.target.value
                  }
                }
              };
              setOptions(newOptions);
            }}
            className="w-28 text-xs bg-dark-900 border border-gray-700 rounded px-2 py-1 
              text-gray-300 focus:border-brand focus:ring-brand"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="time"
            value={question.calendar?.availableHours?.end || "17:00"}
            onChange={(e) => {
              const newOptions = [...options];
              newOptions[index].flow[qIndex] = {
                ...question,
                calendar: {
                  ...question.calendar,
                  availableHours: {
                    ...question.calendar?.availableHours,
                    end: e.target.value
                  }
                }
              };
              setOptions(newOptions);
            }}
            className="w-28 text-xs bg-dark-900 border border-gray-700 rounded px-2 py-1 
              text-gray-300 focus:border-brand focus:ring-brand"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-xs text-gray-400 mb-2">Available Days</label>
        <div className="grid grid-cols-4 gap-2">
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
            <label key={day} className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={question.calendar?.availableDays?.includes(day) ?? false}
                onChange={(e) => {
                  const newOptions = [...options];
                  const currentDays = question.calendar?.availableDays || [];
                  const updatedDays = e.target.checked
                    ? [...currentDays, day]
                    : currentDays.filter(d => d !== day);
                  
                  newOptions[index].flow[qIndex] = {
                    ...question,
                    calendar: {
                      ...question.calendar,
                      availableDays: updatedDays
                    }
                  };
                  setOptions(newOptions);
                }}
                className="rounded border-gray-600 bg-dark-600 text-brand focus:ring-brand"
              />
              <span className="text-xs text-gray-400 capitalize">{day.slice(0,3)}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}