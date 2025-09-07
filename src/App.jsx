import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import MatchDetails from './components/MatchDetails';
import { mockMatches } from './data/mockData';

function App() {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [paidInsights, setPaidInsights] = useState(new Set());

  const handleMatchSelect = (match) => {
    setSelectedMatch(match);
  };

  const handleBackToDashboard = () => {
    setSelectedMatch(null);
  };

  const handleInsightPurchased = (matchId) => {
    setPaidInsights(prev => new Set([...prev, matchId]));
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {selectedMatch ? (
          <MatchDetails 
            match={selectedMatch}
            onBack={handleBackToDashboard}
            hasPaidInsight={paidInsights.has(selectedMatch.match_id)}
            onInsightPurchased={handleInsightPurchased}
          />
        ) : (
          <Dashboard 
            matches={mockMatches}
            onMatchSelect={handleMatchSelect}
            paidInsights={paidInsights}
          />
        )}
      </main>
    </div>
  );
}

export default App;