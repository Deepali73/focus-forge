import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: typeof LucideIcon;
  color: 'blue' | 'red' | 'green' | 'yellow';
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-6 transition-all duration-200 hover:shadow-2xl hover:border-indigo-300 group relative overflow-hidden">
      <div className="absolute -top-6 -left-6 w-16 h-16 bg-indigo-200/30 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
      <div className="flex items-center">
        <div className={`p-4 rounded-xl shadow-md bg-gradient-to-br from-white/80 via-${color}-100/80 to-${color}-200/80 group-hover:from-${color}-200/90 group-hover:to-${color}-300/90 animate-glow`}>
          <Icon className="w-7 h-7 text-${color}-700 drop-shadow" />
        </div>
        <div className="ml-5">
          <p className="text-base font-medium text-gray-700 drop-shadow">{title}</p>
          <p className="text-3xl font-bold text-gray-900 drop-shadow-lg">{value}</p>
        </div>
      </div>
    </div>
  );
};