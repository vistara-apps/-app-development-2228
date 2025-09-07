import React from 'react';
import { Users, TrendingUp } from 'lucide-react';

const CommunityGraph = ({ communityData = [] }) => {
  // Mock community confidence data
  const mockData = [
    { prediction: 'Home Win', confidence: 45, users: 120 },
    { prediction: 'Away Win', confidence: 30, users: 80 },
    { prediction: 'Draw', confidence: 25, users: 65 },
    { prediction: 'Over 2.5', confidence: 70, users: 180 },
  ];

  const data = communityData.length > 0 ? communityData : mockData;

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-dark-text mb-4 flex items-center space-x-2">
        <Users className="w-5 h-5 text-blue-400" />
        <span>Community Confidence</span>
      </h3>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-dark-text font-medium">{item.prediction}</span>
              <span className="text-sm text-dark-textSecondary">{item.users} users</span>
            </div>
            <div className="w-full bg-dark-surface rounded-full h-2">
              <div 
                className="bg-gradient-purple h-2 rounded-full transition-all duration-500"
                style={{ width: `${item.confidence}%` }}
              ></div>
            </div>
            <div className="text-sm text-dark-textSecondary">
              {item.confidence}% confidence
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-dark-surface rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-dark-text">Community Insight</span>
        </div>
        <p className="text-sm text-dark-textSecondary">
          The community strongly favors over 2.5 goals, aligning with our AI prediction
        </p>
      </div>
    </div>
  );
};

export default CommunityGraph;