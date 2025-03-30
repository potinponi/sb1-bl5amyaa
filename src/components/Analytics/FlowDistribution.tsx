import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface FlowStats {
  option: string;
  count: number;
  percentage: number;
  color: string;
}

interface FlowDistributionProps {
  flowStats: FlowStats[];
}

export function FlowDistribution({ flowStats }: FlowDistributionProps) {
  return (
    <div className="bg-dark-800 rounded-lg shadow-lg border border-gray-400/10 p-6">
      <h2 className="text-lg font-medium text-gray-100 mb-4">Flow Distribution</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={flowStats}
              dataKey="count"
              nameKey="option"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={50}
              label={({ percentage }) => `${percentage}%`}
            >
              {flowStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend
              layout="vertical"
              align="center"
              verticalAlign="top"
              wrapperStyle={{
                paddingBottom: '20px'
              }}
              formatter={(value) => (
                <span className="text-sm text-gray-100">{value}</span>
              )}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #374151',
                borderRadius: '0.5rem',
              }}
              formatter={(value, name) => [
                `${value} leads (${flowStats.find(stat => stat.option === name)?.percentage}%)`
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}