import React from 'react';
import MatchCard from './MatchCard';
import StatsOverview from './StatsOverview';
import { Calendar, TrendingUp, Target } from 'lucide-react';

const Dashboard = ({ matches, onMatchSelect, paidInsights }) => {
  const todayMatches = matches.filter(match => {
    const today = new Date().toDateString();
    const matchDate = new Date(match.match_datetime).toDateString();
    return today === matchDate;
  });

  const upcomingMatches = matches.filter(match => {
    const today = new Date();
    const matchDate = new Date(match.match_datetime);
    return matchDate > today;
  });

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-dark-text">
          AI-Powered Football Insights
        </h2>
        <p className="text-lg text-dark-textSecondary max-w-2xl mx-auto">
          Get data-driven predictions and value bet identification to make smarter betting decisions
        </p>
      </div>

      <StatsOverview />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card space-y-4">
            <h3 className="text-xl font-semibold text-dark-text flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Today's Features</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-dark-surface rounded-lg">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-purple-primary" />
                  <span className="text-dark-text">AI Match Insights</span>
                </div>
                <span className="text-accent font-semibold">$0.50</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-surface rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-purple-primary" />
                  <span className="text-dark-text">Streak Analysis</span>
                </div>
                <span className="text-accent font-semibold">$1.00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="space-y-6">
            {todayMatches.length > 0 && (
              <section>
                <h3 className="text-2xl font-semibold text-dark-text mb-4">Today's Matches</h3>
                <div className="grid grid-cols-1 gap-4">
                  {todayMatches.map(match => (
                    <MatchCard 
                      key={match.match_id}
                      match={match}
                      onClick={() => onMatchSelect(match)}
                      hasPaidInsight={paidInsights.has(match.match_id)}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="text-2xl font-semibold text-dark-text mb-4">Upcoming Matches</h3>
              <div className="grid grid-cols-1 gap-4">
                {upcomingMatches.map(match => (
                  <MatchCard 
                    key={match.match_id}
                    match={match}
                    onClick={() => onMatchSelect(match)}
                    hasPaidInsight={paidInsights.has(match.match_id)}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;