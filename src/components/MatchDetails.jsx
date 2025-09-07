import React, { useState } from 'react';
import { ArrowLeft, Star, TrendingUp, Users, Lock, Zap, Target } from 'lucide-react';
import PaymentButton from './PaymentButton';
import CommunityGraph from './CommunityGraph';

const MatchDetails = ({ match, onBack, hasPaidInsight, onInsightPurchased }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePaymentSuccess = () => {
    onInsightPurchased(match.match_id);
  };

  const formatDateTime = (datetime) => {
    return new Date(datetime).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-dark-textSecondary hover:text-dark-text transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-dark-text mb-2">
              {match.home_team} vs {match.away_team}
            </h1>
            <div className="flex items-center space-x-4 text-dark-textSecondary">
              <span>{formatDateTime(match.match_datetime)}</span>
              <span className="bg-purple-primary/20 text-purple-primary px-2 py-1 rounded text-sm">
                {match.competition}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-4 bg-dark-surface rounded-lg">
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-sm text-dark-textSecondary mb-1">AI Confidence</div>
            <div className={`text-2xl font-bold ${getConfidenceColor(match.ai_confidence_score)}`}>
              {match.ai_confidence_score}%
            </div>
          </div>

          <div className="text-center p-4 bg-dark-surface rounded-lg">
            <TrendingUp className="w-8 h-8 text-purple-primary mx-auto mb-2" />
            <div className="text-sm text-dark-textSecondary mb-1">Value Bets</div>
            <div className="text-2xl font-bold text-accent">
              {match.potential_value_bets}
            </div>
          </div>

          <div className="text-center p-4 bg-dark-surface rounded-lg">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-sm text-dark-textSecondary mb-1">Community</div>
            <div className="text-2xl font-bold text-blue-400">
              {match.community_confidence_scores?.length || 0}
            </div>
          </div>
        </div>

        {!hasPaidInsight ? (
          <div className="text-center py-8 space-y-4">
            <Lock className="w-16 h-16 text-dark-textSecondary mx-auto" />
            <h3 className="text-xl font-semibold text-dark-text">Unlock AI Insights</h3>
            <p className="text-dark-textSecondary max-w-md mx-auto">
              Get detailed AI analysis, prediction reasoning, and value bet recommendations for this match.
            </p>
            <PaymentButton
              amount="$0.50"
              description="AI Match Insights"
              onSuccess={handlePaymentSuccess}
              loading={isLoading}
              setLoading={setIsLoading}
            />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="card">
                  <h3 className="text-xl font-semibold text-dark-text mb-4 flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span>AI Prediction</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-purple/10 rounded-lg border border-purple-primary/20">
                      <div className="text-lg font-semibold text-dark-text mb-2">
                        {match.ai_prediction}
                      </div>
                      <div className="text-sm text-dark-textSecondary">
                        Based on form analysis, head-to-head records, and player statistics
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-dark-textSecondary">Home Win Probability:</span>
                        <div className="font-semibold text-dark-text">42%</div>
                      </div>
                      <div>
                        <span className="text-dark-textSecondary">Away Win Probability:</span>
                        <div className="font-semibold text-dark-text">35%</div>
                      </div>
                      <div>
                        <span className="text-dark-textSecondary">Draw Probability:</span>
                        <div className="font-semibold text-dark-text">23%</div>
                      </div>
                      <div>
                        <span className="text-dark-textSecondary">Over 2.5 Goals:</span>
                        <div className="font-semibold text-dark-text">68%</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-xl font-semibold text-dark-text mb-4 flex items-center space-x-2">
                    <Target className="w-5 h-5 text-accent" />
                    <span>Value Bets</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-dark-surface rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-medium text-dark-text">Over 2.5 Goals</div>
                        <div className="text-sm text-dark-textSecondary">Expected value: +12%</div>
                      </div>
                      <div className="text-accent font-semibold">1.85</div>
                    </div>
                    <div className="p-3 bg-dark-surface rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-medium text-dark-text">{match.home_team} Win</div>
                        <div className="text-sm text-dark-textSecondary">Expected value: +8%</div>
                      </div>
                      <div className="text-accent font-semibold">2.40</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <CommunityGraph 
                  communityData={match.community_confidence_scores || []}
                />

                <div className="card">
                  <h3 className="text-xl font-semibold text-dark-text mb-4">Key Insights</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-dark-textSecondary">
                        {match.home_team} has won 3 of their last 5 home matches
                      </span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-dark-textSecondary">
                        Both teams have scored in 70% of {match.away_team}'s away games
                      </span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-dark-textSecondary">
                        Average goals per game for both teams: 2.8
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchDetails;