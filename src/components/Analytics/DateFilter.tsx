import React from 'react';
import { Calendar } from 'lucide-react';

type DateFilter = 'today' | '7days' | '14days' | '30days' | 'all';

interface DateFilterProps {
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
}

export function DateFilter({ dateFilter, setDateFilter }: DateFilterProps) {
  const dateFilters: { value: DateFilter; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: '7days', label: 'Last 7 days' },
    { value: '14days', label: 'Last 14 days' },
    { value: '30days', label: 'Last 30 days' },
    { value: 'all', label: 'All time' },
  ];

  return (
    <div className="flex items-center space-x-2">
      <Calendar className="w-5 h-5 text-gray-400" />
      {dateFilters.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setDateFilter(value)}
          className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors
            ${dateFilter === value
              ? 'bg-brand text-black'
              : 'bg-dark-700 text-gray-400 hover:text-brand hover:bg-dark-600'
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}