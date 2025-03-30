import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface DailyStats {
  date: string;
  count: number;
  conversionRate: number;
}

interface LeadAcquisitionProps {
  dailyStats: DailyStats[];
}

export function LeadAcquisition({ dailyStats }: LeadAcquisitionProps) {
  return (
    <div className="lg:col-span-2 bg-dark-800 rounded-lg shadow-lg border border-gray-400/10 p-6">
      <h2 className="text-lg font-medium text-gray-100 mb-4">Lead Acquisition</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dailyStats}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a7e154" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#a7e154" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
              tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #374151',
                borderRadius: '0.5rem',
              }}
              labelStyle={{ color: '#9CA3AF' }}
              itemStyle={{ color: '#a7e154' }}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#a7e154"
              fillOpacity={1}
              fill="url(#colorCount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}