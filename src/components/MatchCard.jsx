import React from 'react';
import { Clock, Star, TrendingUp, Lock, CheckCircle } from 'lucide-react';

const MatchCard = ({ match, onClick, hasPaidInsight }) => {
  const formatTime = (datetime) => {
    return new Date(datetime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (datetime) => {
    return new Date(datetime).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getConfidenceColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div 
      className="match-card p-4 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 text-sm text-dark-textSecondary">
          <Clock className="w-4 h-4" />
          <span>{formatDate(match.match_datetime)} • {formatTime(match.match_datetime)}</span>
        </div>
        <div className="flex items-center space-x-2">
          {hasPaidInsight && (
            <CheckCircle className="w-4 h-4 text-green-400" />
          )}
          <span className="text-xs bg-purple-primary/20 text-purple-primary px-2 py-1 rounded">
            {match.competition}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold text-dark-text">
          {match.home_team} vs {match.away_team}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-dark-textSecondary">AI Confidence</span>
          </div>
          <div className={`font-semibold ${getConfidenceColor(match.ai_confidence_score)}`}>
            {match.ai_confidence_score}%
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-primary" />
            <span className="text-dark-textSecondary">Value Bets</span>
          </div>
          <div className="font-semibold text-accent">
            {match.potential_value_bets}
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            {hasPaidInsight ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <Lock className="w-4 h-4 text-dark-textSecondary" />
            )}
            <span className="text-dark-textSecondary">Insights</span>
          </div>
          <div className={`font-semibold ${hasPaidInsight ? 'text-green-400' : 'text-dark-textSecondary'}`}>
            {hasPaidInsight ? 'Unlocked' : 'Locked'}
          </div>
        </div>
      </div>

      {!hasPaidInsight && (
        <div className="mt-3 pt-3 border-t border-dark-border">
          <div className="text-xs text-dark-textSecondary text-center">
            Click to unlock AI insights for $0.50
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchCard;