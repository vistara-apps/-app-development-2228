import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Activity, Award, AlertCircle } from 'lucide-react';
import PaymentButton from './PaymentButton';
import AIService from '../services/aiService';

const StreakAnalysis = ({ match, userId, onPurchase, hasPurchased }) => {
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (hasPurchased && !streakData) {
      loadStreakAnalysis();
    }
  }, [hasPurchased, match]);

  const loadStreakAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Generate streak analysis for both teams
      const [homeAnalysis, awayAnalysis] = await Promise.all([
        AIService.generateStreakAnalysis(match.home_team, []),
        AIService.generateStreakAnalysis(match.away_team, [])
      ]);

      setStreakData({
        home_team: homeAnalysis,
        away_team: awayAnalysis,
        comparison: generateComparison(homeAnalysis, awayAnalysis)
      });
    } catch (err) {
      setError('Failed to load streak analysis');
      console.error('Streak analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateComparison = (homeAnalysis, awayAnalysis) => {
    return {
      form_advantage: homeAnalysis.form_rating > awayAnalysis.form_rating ? 'home' : 'away',
      momentum_leader: homeAnalysis.momentum === 'Positive' && awayAnalysis.momentum !== 'Positive' ? 'home' : 
                      awayAnalysis.momentum === 'Positive' && homeAnalysis.momentum !== 'Positive' ? 'away' : 'neutral',
      key_matchup: `${match.home_team} form vs ${match.away_team} momentum`,
      prediction_impact: 'High - Recent form suggests competitive match'
    };
  };

  const getFormColor = (rating) => {
    if (rating >= 8) return 'text-green-400';
    if (rating >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMomentumIcon = (momentum) => {
    switch (momentum) {
      case 'Positive': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'Negative': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-yellow-400" />;
    }
  };

  if (!hasPurchased) {
    return (
      <div className="card">
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 bg-purple-primary/20 rounded-full flex items-center justify-center mx-auto">
            <TrendingUp className="w-8 h-8 text-purple-primary" />
          </div>
          <h3 className="text-xl font-semibold text-dark-text">Premium Streak Analysis</h3>
          <p className="text-dark-textSecondary max-w-md mx-auto">
            Get detailed team form analysis, momentum indicators, and performance trends to enhance your betting strategy.
          </p>
          <div className="space-y-2 text-sm text-dark-textSecondary">
            <div className="flex items-center justify-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Recent form analysis for both teams</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Momentum and trend indicators</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Award className="w-4 h-4" />
              <span>Performance comparison insights</span>
            </div>
          </div>
          <PaymentButton
            amount="$1.00"
            description="Streak Analysis"
            onSuccess={() => onPurchase('streak_analysis')}
            loading={loading}
            setLoading={setLoading}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-purple-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-dark-textSecondary">Analyzing team streaks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadStreakAnalysis}
            className="btn-primary"
          >
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  if (!streakData) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-xl font-semibold text-dark-text mb-6 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-purple-primary" />
          <span>Streak Analysis</span>
        </h3>

        {/* Team Comparison Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 bg-dark-surface rounded-lg">
            <div className="text-sm text-dark-textSecondary mb-1">Form Leader</div>
            <div className="text-lg font-semibold text-dark-text">
              {streakData.comparison.form_advantage === 'home' ? match.home_team : match.away_team}
            </div>
          </div>
          <div className="text-center p-4 bg-dark-surface rounded-lg">
            <div className="text-sm text-dark-textSecondary mb-1">Momentum</div>
            <div className="text-lg font-semibold text-dark-text">
              {streakData.comparison.momentum_leader === 'home' ? match.home_team : 
               streakData.comparison.momentum_leader === 'away' ? match.away_team : 'Balanced'}
            </div>
          </div>
          <div className="text-center p-4 bg-dark-surface rounded-lg">
            <div className="text-sm text-dark-textSecondary mb-1">Impact</div>
            <div className="text-lg font-semibold text-accent">High</div>
          </div>
        </div>

        {/* Detailed Team Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Home Team Analysis */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-dark-text border-b border-dark-border pb-2">
              {match.home_team} Analysis
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-dark-textSecondary">Current Form</span>
                <div className="flex items-center space-x-2">
                  <span className={`font-semibold ${getFormColor(streakData.home_team.form_rating)}`}>
                    {streakData.home_team.form_rating}/10
                  </span>
                  <span className="text-sm text-dark-textSecondary">
                    ({streakData.home_team.current_form})
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-dark-textSecondary">Momentum</span>
                <div className="flex items-center space-x-2">
                  {getMomentumIcon(streakData.home_team.momentum)}
                  <span className="text-dark-text">{streakData.home_team.momentum}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-dark-textSecondary">Scoring Trend</span>
                <span className="text-dark-text">{streakData.home_team.scoring_trend}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-dark-textSecondary">Defensive Stability</span>
                <span className="text-dark-text">{streakData.home_team.defensive_stability}</span>
              </div>
            </div>

            <div className="mt-4">
              <h5 className="text-sm font-semibold text-dark-text mb-2">Key Insights</h5>
              <div className="space-y-2">
                {streakData.home_team.key_insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-dark-textSecondary">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Away Team Analysis */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-dark-text border-b border-dark-border pb-2">
              {match.away_team} Analysis
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-dark-textSecondary">Current Form</span>
                <div className="flex items-center space-x-2">
                  <span className={`font-semibold ${getFormColor(streakData.away_team.form_rating)}`}>
                    {streakData.away_team.form_rating}/10
                  </span>
                  <span className="text-sm text-dark-textSecondary">
                    ({streakData.away_team.current_form})
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-dark-textSecondary">Momentum</span>
                <div className="flex items-center space-x-2">
                  {getMomentumIcon(streakData.away_team.momentum)}
                  <span className="text-dark-text">{streakData.away_team.momentum}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-dark-textSecondary">Scoring Trend</span>
                <span className="text-dark-text">{streakData.away_team.scoring_trend}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-dark-textSecondary">Defensive Stability</span>
                <span className="text-dark-text">{streakData.away_team.defensive_stability}</span>
              </div>
            </div>

            <div className="mt-4">
              <h5 className="text-sm font-semibold text-dark-text mb-2">Key Insights</h5>
              <div className="space-y-2">
                {streakData.away_team.key_insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-dark-textSecondary">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Strategic Recommendations */}
        <div className="mt-8 p-4 bg-gradient-purple/10 rounded-lg border border-purple-primary/20">
          <h5 className="text-lg font-semibold text-dark-text mb-3 flex items-center space-x-2">
            <Target className="w-5 h-5 text-purple-primary" />
            <span>Strategic Recommendations</span>
          </h5>
          <div className="space-y-2 text-sm">
            <p className="text-dark-textSecondary">
              <strong>Key Matchup:</strong> {streakData.comparison.key_matchup}
            </p>
            <p className="text-dark-textSecondary">
              <strong>Prediction Impact:</strong> {streakData.comparison.prediction_impact}
            </p>
            <p className="text-dark-textSecondary">
              <strong>Betting Strategy:</strong> Consider form differentials and momentum shifts when evaluating odds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakAnalysis;
