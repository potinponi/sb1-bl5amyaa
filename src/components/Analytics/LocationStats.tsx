import React from 'react';

interface LocationStatsProps {
  cities: { name: string; count: number }[];
  countries: { name: string; count: number }[];
}

export function LocationStats({ cities, countries }: LocationStatsProps) {
  return (
    <div className="bg-dark-800 rounded-lg shadow-lg border border-gray-400/10 p-6">
      <h2 className="text-lg font-medium text-gray-100 mb-4">Top Locations</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Top Cities</h3>
          <div className="space-y-2">
            {cities.map(({ name, count }) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-gray-300">{name}</span>
                <span className="text-brand font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Top Countries</h3>
          <div className="space-y-2">
            {countries.map(({ name, count }) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-gray-300">{name}</span>
                <span className="text-brand font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}