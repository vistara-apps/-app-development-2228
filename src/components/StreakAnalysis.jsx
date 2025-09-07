// Streak Analysis component for premium team form analysis
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Target, Star, Lock } from 'lucide-react';
import PaymentButton from './PaymentButton';

const StreakAnalysis = ({ match, hasPurchased, onPurchase }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePaymentSuccess = () => {
    onPurchase(match.match_id, 'streak_analysis');
  };

  // Mock streak data - in real app this would come from AI service
  const getStreakData = () => {
    return {
      home_team: {
        name: match.home_team,
        current_form: 'WWDLW',
        streak_type: 'winning',
        streak_length: 3,
        goals_for_avg: 2.4,
        goals_against_avg: 0.8,
        clean_sheets: 4,
        momentum_score: 85,
        key_stats: [
          'Unbeaten in last 5 home games',
          'Scored in 8 consecutive matches',
          'Best defensive record in league'
        ]
      },
      away_team: {
        name: match.away_team,
        current_form: 'LWWDL',
        streak_type: 'mixed',
        streak_length: 1,
        goals_for_avg: 1.8,
        goals_against_avg: 1.2,
        clean_sheets: 2,
        momentum_score: 62,
        key_stats: [
          'Won 3 of last 5 away games',
          'Struggled against top 6 teams',
          'Strong counter-attacking play'
        ]
      },
      head_to_head: {
        last_5_meetings: 'HWDLW',
        home_advantage: 65,
        avg_goals_per_game: 2.8,
        both_teams_score_pct: 80
      },
      predictions: {
        likely_outcome: `${match.home_team} Win`,
        confidence: 78,
        recommended_bets: [
          'Home Win & Over 1.5 Goals',
          'Both Teams to Score - No',
          'Home Team Clean Sheet'
        ]
      }
    };
  };

  const streakData = getStreakData();

  const getFormIcon = (result) => {
    switch (result) {
      case 'W': return <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white">W</div>;
      case 'D': return <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-white">D</div>;
      case 'L': return <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">L</div>;
      default: return null;
    }
  };

  const getMomentumColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!hasPurchased) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <Lock className="w-12 h-12 text-purple-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold text-dark-text mb-2">Premium Streak Analysis</h3>
          <p className="text-dark-textSecondary mb-6">
            Get detailed team form analysis, momentum scores, and strategic betting insights
          </p>
          
          <div className="bg-dark-surface rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <BarChart3 className="w-6 h-6 text-purple-primary mx-auto mb-2" />
                <p className="text-dark-textSecondary">Team Form Analysis</p>
              </div>
              <div className="text-center">
                <TrendingUp className="w-6 h-6 text-purple-primary mx-auto mb-2" />
                <p className="text-dark-textSecondary">Momentum Tracking</p>
              </div>
              <div className="text-center">
                <Target className="w-6 h-6 text-purple-primary mx-auto mb-2" />
                <p className="text-dark-textSecondary">Strategic Insights</p>
              </div>
              <div className="text-center">
                <Star className="w-6 h-6 text-purple-primary mx-auto mb-2" />
                <p className="text-dark-textSecondary">Value Bet Recommendations</p>
              </div>
            </div>
          </div>

          <PaymentButton
            amount="$1.00"
            description="Streak Analysis"
            onSuccess={handlePaymentSuccess}
            loading={isLoading}
            setLoading={setIsLoading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Form Comparison */}
      <div className="card">
        <h3 className="text-xl font-bold text-dark-text mb-4 flex items-center">
          <BarChart3 className="w-6 h-6 text-purple-primary mr-2" />
          Team Form Analysis
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Home Team */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-dark-text">{streakData.home_team.name}</h4>
              <div className={`text-sm font-medium ${getMomentumColor(streakData.home_team.momentum_score)}`}>
                Momentum: {streakData.home_team.momentum_score}%
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-dark-textSecondary">Last 5:</span>
              <div className="flex space-x-1">
                {streakData.home_team.current_form.split('').map((result, index) => (
                  <div key={index}>{getFormIcon(result)}</div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-dark-textSecondary">Goals For (avg)</p>
                <p className="font-semibold text-dark-text">{streakData.home_team.goals_for_avg}</p>
              </div>
              <div>
                <p className="text-dark-textSecondary">Goals Against (avg)</p>
                <p className="font-semibold text-dark-text">{streakData.home_team.goals_against_avg}</p>
              </div>
              <div>
                <p className="text-dark-textSecondary">Clean Sheets</p>
                <p className="font-semibold text-dark-text">{streakData.home_team.clean_sheets}</p>
              </div>
              <div>
                <p className="text-dark-textSecondary">Current Streak</p>
                <p className="font-semibold text-green-400">{streakData.home_team.streak_length} wins</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-dark-textSecondary mb-2">Key Insights:</p>
              <ul className="space-y-1">
                {streakData.home_team.key_stats.map((stat, index) => (
                  <li key={index} className="text-sm text-dark-text flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    {stat}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Away Team */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-dark-text">{streakData.away_team.name}</h4>
              <div className={`text-sm font-medium ${getMomentumColor(streakData.away_team.momentum_score)}`}>
                Momentum: {streakData.away_team.momentum_score}%
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-dark-textSecondary">Last 5:</span>
              <div className="flex space-x-1">
                {streakData.away_team.current_form.split('').map((result, index) => (
                  <div key={index}>{getFormIcon(result)}</div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-dark-textSecondary">Goals For (avg)</p>
                <p className="font-semibold text-dark-text">{streakData.away_team.goals_for_avg}</p>
              </div>
              <div>
                <p className="text-dark-textSecondary">Goals Against (avg)</p>
                <p className="font-semibold text-dark-text">{streakData.away_team.goals_against_avg}</p>
              </div>
              <div>
                <p className="text-dark-textSecondary">Clean Sheets</p>
                <p className="font-semibold text-dark-text">{streakData.away_team.clean_sheets}</p>
              </div>
              <div>
                <p className="text-dark-textSecondary">Away Form</p>
                <p className="font-semibold text-yellow-400">Mixed</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-dark-textSecondary mb-2">Key Insights:</p>
              <ul className="space-y-1">
                {streakData.away_team.key_stats.map((stat, index) => (
                  <li key={index} className="text-sm text-dark-text flex items-start">
                    <span className="text-yellow-400 mr-2">•</span>
                    {stat}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Head-to-Head Analysis */}
      <div className="card">
        <h3 className="text-xl font-bold text-dark-text mb-4 flex items-center">
          <Target className="w-6 h-6 text-purple-primary mr-2" />
          Head-to-Head Analysis
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-dark-textSecondary mb-2">Last 5 Meetings</p>
            <div className="flex justify-center space-x-1 mb-2">
              {streakData.head_to_head.last_5_meetings.split('').map((result, index) => (
                <div key={index}>{getFormIcon(result)}</div>
              ))}
            </div>
            <p className="text-xs text-dark-textSecondary">From home team perspective</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-dark-textSecondary mb-2">Home Advantage</p>
            <p className="text-2xl font-bold text-green-400">{streakData.head_to_head.home_advantage}%</p>
            <p className="text-xs text-dark-textSecondary">Historical win rate at home</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-dark-textSecondary mb-2">Goals Per Game</p>
            <p className="text-2xl font-bold text-purple-primary">{streakData.head_to_head.avg_goals_per_game}</p>
            <p className="text-xs text-dark-textSecondary">Average in recent meetings</p>
          </div>
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div className="card">
        <h3 className="text-xl font-bold text-dark-text mb-4 flex items-center">
          <Star className="w-6 h-6 text-purple-primary mr-2" />
          Strategic Betting Recommendations
        </h3>
        
        <div className="bg-gradient-purple/10 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-dark-text">Primary Prediction</h4>
            <span className="text-sm bg-purple-primary/20 text-purple-primary px-2 py-1 rounded">
              {streakData.predictions.confidence}% Confidence
            </span>
          </div>
          <p className="text-lg font-bold text-purple-primary">{streakData.predictions.likely_outcome}</p>
        </div>
        
        <div>
          <h5 className="font-semibold text-dark-text mb-3">Recommended Value Bets:</h5>
          <div className="space-y-2">
            {streakData.predictions.recommended_bets.map((bet, index) => (
              <div key={index} className="flex items-center p-3 bg-dark-surface rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-400 mr-3" />
                <span className="text-dark-text">{bet}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-400">
            <strong>Risk Assessment:</strong> Based on current form and historical data, 
            this match presents medium risk with good value potential. Consider stake sizing accordingly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StreakAnalysis;
