// Data manager hook for centralized data management
import { useState, useEffect, useCallback } from 'react';
import footballService from '../services/footballService.js';
import aiService from '../services/aiService.js';
import databaseService from '../services/databaseService.js';

export function useDataManager() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Load initial data
  useEffect(() => {
    loadMatches();
  }, []);

  // Load matches from football API
  const loadMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const matchData = await footballService.getUpcomingMatches(7);
      
      // Enhance matches with AI predictions if available
      const enhancedMatches = await Promise.all(
        matchData.map(async (match) => {
          try {
            if (!match.ai_prediction) {
              const aiPrediction = await aiService.generateMatchPrediction(match);
              return {
                ...match,
                ai_prediction: aiPrediction.prediction,
                ai_confidence_score: aiPrediction.confidence_score,
                ai_detailed_analysis: aiPrediction.detailed_analysis,
                potential_value_bets: aiPrediction.detailed_analysis?.value_bets?.length || 0,
              };
            }
            return match;
          } catch (aiError) {
            console.warn('AI prediction failed for match:', match.match_id, aiError);
            return match;
          }
        })
      );
      
      setMatches(enhancedMatches);
    } catch (err) {
      console.error('Failed to load matches:', err);
      setError('Failed to load matches. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load user data
  const loadUser = useCallback(async (userId) => {
    try {
      const userData = await databaseService.getUser(userId);
      setUser(userData);
      
      // Load user transactions
      const userTransactions = await databaseService.getUserTransactions(userId);
      setTransactions(userTransactions);
      
      return userData;
    } catch (err) {
      console.error('Failed to load user:', err);
      return null;
    }
  }, []);

  // Create or update user
  const saveUser = useCallback(async (userData) => {
    try {
      let savedUser;
      
      if (user) {
        savedUser = await databaseService.updateUser(user.user_id, userData);
      } else {
        savedUser = await databaseService.createUser(userData);
      }
      
      setUser(savedUser);
      return savedUser;
    } catch (err) {
      console.error('Failed to save user:', err);
      throw err;
    }
  }, [user]);

  // Record a transaction
  const recordTransaction = useCallback(async (transactionData) => {
    try {
      const transaction = await databaseService.createTransaction({
        ...transactionData,
        user_id: user?.user_id || 'anonymous',
      });
      
      // Update local transactions
      setTransactions(prev => [transaction, ...prev]);
      
      return transaction;
    } catch (err) {
      console.error('Failed to record transaction:', err);
      throw err;
    }
  }, [user]);

  // Get match with purchase status
  const getMatchWithPurchaseStatus = useCallback((matchId) => {
    const match = matches.find(m => m.match_id === matchId);
    if (!match) return null;

    const userTransactions = transactions.filter(t => t.match_id === matchId);
    
    return {
      ...match,
      has_purchased_insight: userTransactions.some(t => 
        t.transaction_type === 'match_insight' && t.status === 'completed'
      ),
      has_purchased_streak: userTransactions.some(t => 
        t.transaction_type === 'streak_analysis' && t.status === 'completed'
      ),
    };
  }, [matches, transactions]);

  // Update community confidence
  const updateCommunityConfidence = useCallback(async (matchId, prediction, confidence) => {
    try {
      await databaseService.updateCommunityConfidence(
        matchId, 
        prediction, 
        confidence, 
        user?.user_id
      );
      
      // Refresh matches to get updated community scores
      await loadMatches();
    } catch (err) {
      console.error('Failed to update community confidence:', err);
      throw err;
    }
  }, [user, loadMatches]);

  // Get analytics data
  const getAnalytics = useCallback(async () => {
    try {
      return await databaseService.getAnalytics();
    } catch (err) {
      console.error('Failed to load analytics:', err);
      return null;
    }
  }, []);

  // Refresh data
  const refresh = useCallback(async () => {
    await loadMatches();
    if (user) {
      await loadUser(user.user_id);
    }
  }, [loadMatches, loadUser, user]);

  // Filter matches by competition
  const getMatchesByCompetition = useCallback((competitionCode) => {
    return matches.filter(match => 
      match.competition_code === competitionCode
    );
  }, [matches]);

  // Get today's matches
  const getTodaysMatches = useCallback(() => {
    const today = new Date().toDateString();
    return matches.filter(match => 
      new Date(match.match_datetime).toDateString() === today
    );
  }, [matches]);

  // Get upcoming matches
  const getUpcomingMatches = useCallback((days = 7) => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return matches.filter(match => {
      const matchDate = new Date(match.match_datetime);
      return matchDate >= now && matchDate <= futureDate;
    });
  }, [matches]);

  // Search matches
  const searchMatches = useCallback((query) => {
    const searchTerm = query.toLowerCase();
    return matches.filter(match => 
      match.home_team.toLowerCase().includes(searchTerm) ||
      match.away_team.toLowerCase().includes(searchTerm) ||
      match.competition.toLowerCase().includes(searchTerm)
    );
  }, [matches]);

  return {
    // Data
    matches,
    user,
    transactions,
    loading,
    error,
    
    // Actions
    loadMatches,
    loadUser,
    saveUser,
    recordTransaction,
    updateCommunityConfidence,
    refresh,
    
    // Getters
    getMatchWithPurchaseStatus,
    getAnalytics,
    getMatchesByCompetition,
    getTodaysMatches,
    getUpcomingMatches,
    searchMatches,
  };
}
