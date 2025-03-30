import React from 'react';
import { Users, Mail, PhoneCall, MessageSquare } from 'lucide-react';

interface StatsCardsProps {
  totalLeads: number;
  uniqueEmails: number;
  uniquePhones: number;
  conversionRate: number;
}

export function StatsCards({
  totalLeads,
  uniqueEmails,
  uniquePhones,
  conversionRate
}: StatsCardsProps) {
  const stats = [
    { label: 'Total Leads', value: totalLeads, icon: Users },
    { label: 'Unique Emails', value: uniqueEmails, icon: Mail },
    { label: 'Unique Phone Numbers', value: uniquePhones, icon: PhoneCall },
    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: MessageSquare },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className="bg-dark-800 rounded-lg shadow-lg border border-gray-400/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">{label}</h3>
              <p className="text-3xl font-bold text-gray-100 relative z-10">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            </div>
            <Icon className="w-8 h-8 text-brand relative z-10" />
          </div>
        </div>
      ))}
    </div>
  );
}