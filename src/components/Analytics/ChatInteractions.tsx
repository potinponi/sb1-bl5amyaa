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
import type { ChatInteraction } from '../../types';

interface ChatInteractionsProps {
  interactions: ChatInteraction[];
  totalOpens: number;
}

export function ChatInteractions({ interactions, totalOpens }: ChatInteractionsProps) {
  const chartData = interactions.reduce((acc, interaction) => {
    const date = new Date(interaction.created_at).toISOString().split('T')[0];
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing[interaction.type] = (existing[interaction.type] || 0) + 1;
    } else {
      acc.push({
        date,
        open: interaction.type === 'open' ? 1 : 0,
        start_flow: interaction.type === 'start_flow' ? 1 : 0,
        close: interaction.type === 'close' ? 1 : 0
      });
    }
    return acc.sort((a, b) => a.date.localeCompare(b.date));
  }, [] as any[]);

  const calculateAverageSessionDuration = () => {
    if (interactions.length === 0) return '-';
    
    const sessions = new Map();
    interactions.forEach(interaction => {
      if (!sessions.has(interaction.session_id)) {
        sessions.set(interaction.session_id, {
          start: new Date(interaction.created_at),
          end: new Date(interaction.created_at)
        });
      } else {
        const session = sessions.get(interaction.session_id);
        if (new Date(interaction.created_at) > session.end) {
          session.end = new Date(interaction.created_at);
        }
      }
    });
    
    const durations = Array.from(sessions.values())
      .map(session => (session.end - session.start) / 1000);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    return `${Math.round(avgDuration)}s`;
  };

  const flowStartRate = totalOpens > 0
    ? Math.round((interactions.filter(i => i.type === 'start_flow').length / totalOpens) * 100)
    : 0;

  const bounceRate = totalOpens > 0
    ? Math.round((1 - interactions.filter(i => i.type === 'start_flow').length / totalOpens) * 100)
    : 0;

  return (
    <div className="lg:col-span-2 bg-dark-800 rounded-lg shadow-lg border border-gray-400/10 p-6">
      <h2 className="text-lg font-medium text-gray-100 mb-4">Chat Interactions</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorOpen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a7e154" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#a7e154" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorStart" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#54e1a7" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#54e1a7" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e154a7" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#e154a7" stopOpacity={0}/>
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
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Area
              type="monotone"
              dataKey="open"
              name="Chat Opens"
              stroke="#a7e154"
              fillOpacity={1}
              fill="url(#colorOpen)"
              stackId="1"
            />
            <Area
              type="monotone"
              dataKey="start_flow"
              name="Started Flow"
              stroke="#54e1a7"
              fillOpacity={1}
              fill="url(#colorStart)"
              stackId="1"
            />
            <Area
              type="monotone"
              dataKey="close"
              name="Chat Closes"
              stroke="#e154a7"
              fillOpacity={1}
              fill="url(#colorClose)"
              stackId="1"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="p-4 bg-dark-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Average Session Duration</h3>
          <p className="text-2xl font-bold text-gray-100">{calculateAverageSessionDuration()}</p>
        </div>
        <div className="p-4 bg-dark-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Flow Start Rate</h3>
          <p className="text-2xl font-bold text-gray-100">{flowStartRate}%</p>
        </div>
        <div className="p-4 bg-dark-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Bounce Rate</h3>
          <p className="text-2xl font-bold text-gray-100">{bounceRate}%</p>
        </div>
      </div>
    </div>
  );
}