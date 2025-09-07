import React from 'react';
import { TrendingUp, Target, Users, Zap } from 'lucide-react';

const StatsOverview = () => {
  const stats = [
    {
      icon: TrendingUp,
      label: 'Win Rate',
      value: '73%',
      change: '+5.2%',
      color: 'text-green-400'
    },
    {
      icon: Target,
      label: 'Value Bets Found',
      value: '24',
      change: '+12',
      color: 'text-purple-primary'
    },
    {
      icon: Users,
      label: 'Community Predictions',
      value: '1.2k',
      change: '+240',
      color: 'text-blue-400'
    },
    {
      icon: Zap,
      label: 'AI Confidence',
      value: '89%',
      change: '+3.1%',
      color: 'text-yellow-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="card text-center space-y-2">
            <div className="flex justify-center">
              <Icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-dark-text">{stat.value}</div>
            <div className="text-sm text-dark-textSecondary">{stat.label}</div>
            <div className={`text-xs ${stat.color}`}>{stat.change}</div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsOverview;