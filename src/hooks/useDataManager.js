import { useState, useEffect, useCallback } from 'react';
import { useWalletClient } from 'wagmi';
import AIService from '../services/aiService';
import DatabaseService from '../services/databaseService';
import FootballService from '../services/footballService';
import PaymentService from '../services/paymentService';

/**
 * Comprehensive data management hook for BetWiseAI
 * Integrates all services and manages application state
 */
export function useDataManager() {
  const { data: walletClient } = useWalletClient();
  
  // State management
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [purchasedInsights, setPurchasedInsights] = useState(new Set());

  // Initialize user and load data
  useEffect(() => {
    initializeApp();
  }, [walletClient]);

  /**
   * Initialize the application
   */
  const initializeApp = async () => {
    setLoading(true);
    setError(null);

    try {
      // Initialize user if wallet is connected
      if (walletClient?.account) {
        await initializeUser(walletClient.account.address);
      }

      // Load initial match data
      await loadMatches();
    } catch (err) {
      setError('Failed to initialize application');
      console.error('App initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initialize or get user data
   */
  const initializeUser = async (walletAddress) => {
    try {
      const userId = `user_${walletAddress.slice(-8)}`;
      
      // Try to get existing user
      let userData = await DatabaseService.getUser(userId);
      
      // Create user if doesn't exist
      if (!userData) {
        userData = await DatabaseService.upsertUser({
          user_id: userId,
          wallet_address: walletAddress,
          farcaster_id: null
        });
      }

      setUser(userData);

      // Load user's purchased insights
      const insights = await DatabaseService.getUserPurchasedInsights(userId);
      setPurchasedInsights(new Set(insights));
    } catch (err) {
      console.error('User initialization error:', err);
    }
  };

  /**
   * Load matches from football API and enhance with AI predictions
   */
  const loadMatches = async () => {
    try {
      // Get upcoming matches from football API
      let matchData = await FootballService.getUpcomingMatches(7);
      
      // If no real data, use fallback
      if (matchData.length === 0) {
        matchData = FootballService.getFallbackMatches();
      }

      // Enhance matches with AI predictions (for demo purposes, limit to first 5)
      const enhancedMatches = await Promise.all(
        matchData.slice(0, 5).map(async (match) => {
          try {
            // Check if we already have AI prediction stored
            const storedMatch = await DatabaseService.getMatch(match.match_id);
            
            if (storedMatch?.ai_prediction) {
              return storedMatch;
            }

            // Generate AI prediction
            if (AIService.validateMatchData(match)) {
              const aiPrediction = await AIService.generateMatchPrediction(match);
              
              const enhancedMatch = {
                ...match,
                ai_prediction: aiPrediction.prediction,
                ai_confidence_score: aiPrediction.confidence_score,
                potential_value_bets: aiPrediction.value_bets?.length || 0,
                ai_detailed_analysis: aiPrediction
              };

              // Store enhanced match in database
              await DatabaseService.storeMatch(enhancedMatch);
              
              return enhancedMatch;
            }
            
            return match;
          } catch (err) {
            console.error(`Failed to enhance match ${match.match_id}:`, err);
            return match;
          }
        })
      );

      setMatches(enhancedMatches);
    } catch (err) {
      console.error('Failed to load matches:', err);
      // Use mock data as fallback
      const { mockMatches } = await import('../data/mockData');
      setMatches(mockMatches);
    }
  };

  /**
   * Purchase match insights
   */
  const purchaseMatchInsights = useCallback(async (matchId, paymentMethod = 'crypto') => {
    if (!user) {
      throw new Error('User not initialized');
    }

    try {
      setLoading(true);

      // Process payment
      const paymentResult = await PaymentService.createMatchInsightSession({
        userId: user.user_id,
        matchId,
        paymentMethod,
        walletClient
      });

      if (paymentResult.success) {
        // Record transaction
        await DatabaseService.recordTransaction({
          user_id: user.user_id,
          match_id: matchId,
          amount: '$0.50',
          transaction_type: 'match_insight',
          payment_method: paymentMethod,
          transaction_hash: paymentResult.transactionHash || paymentResult.paymentIntentId
        });

        // Update local state
        setPurchasedInsights(prev => new Set([...prev, matchId]));

        return { success: true };
      }

      throw new Error('Payment failed');
    } catch (err) {
      console.error('Purchase failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, walletClient]);

  /**
   * Purchase streak analysis
   */
  const purchaseStreakAnalysis = useCallback(async (matchId, paymentMethod = 'crypto') => {
    if (!user) {
      throw new Error('User not initialized');
    }

    try {
      setLoading(true);

      // Process payment
      const paymentResult = await PaymentService.createStreakAnalysisSession({
        userId: user.user_id,
        matchId,
        paymentMethod,
        walletClient
      });

      if (paymentResult.success) {
        // Record transaction
        await DatabaseService.recordTransaction({
          user_id: user.user_id,
          match_id: matchId,
          amount: '$1.00',
          transaction_type: 'streak_analysis',
          payment_method: paymentMethod,
          transaction_hash: paymentResult.transactionHash || paymentResult.paymentIntentId
        });

        return { success: true };
      }

      throw new Error('Payment failed');
    } catch (err) {
      console.error('Streak analysis purchase failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, walletClient]);

  /**
   * Get user's purchase history
   */
  const getPurchaseHistory = useCallback(async () => {
    if (!user) return [];

    try {
      return await DatabaseService.getUserPurchaseHistory(user.user_id);
    } catch (err) {
      console.error('Failed to get purchase history:', err);
      return [];
    }
  }, [user]);

  /**
   * Update community confidence for a match
   */
  const updateCommunityConfidence = useCallback(async (matchId, confidenceData) => {
    try {
      await DatabaseService.updateCommunityConfidence(matchId, confidenceData);
      
      // Update local state
      setMatches(prev => prev.map(match => 
        match.match_id === matchId 
          ? { ...match, community_confidence_scores: confidenceData }
          : match
      ));
    } catch (err) {
      console.error('Failed to update community confidence:', err);
    }
  }, []);

  /**
   * Refresh match data
   */
  const refreshMatches = useCallback(async () => {
    await loadMatches();
  }, []);

  /**
   * Get live scores
   */
  const getLiveScores = useCallback(async () => {
    try {
      return await FootballService.getLiveScores();
    } catch (err) {
      console.error('Failed to get live scores:', err);
      return [];
    }
  }, []);

  /**
   * Get supported competitions
   */
  const getSupportedCompetitions = useCallback(() => {
    return FootballService.getSupportedCompetitions();
  }, []);

  /**
   * Get payment methods
   */
  const getPaymentMethods = useCallback(() => {
    return PaymentService.getSupportedPaymentMethods();
  }, []);

  /**
   * Check if user has purchased specific feature
   */
  const hasPurchased = useCallback((matchId, featureType = 'match_insight') => {
    if (featureType === 'match_insight') {
      return purchasedInsights.has(matchId);
    }
    // For other features, you might want to check different state
    return false;
  }, [purchasedInsights]);

  return {
    // State
    matches,
    loading,
    error,
    user,
    purchasedInsights,

    // Actions
    purchaseMatchInsights,
    purchaseStreakAnalysis,
    getPurchaseHistory,
    updateCommunityConfidence,
    refreshMatches,
    getLiveScores,
    getSupportedCompetitions,
    getPaymentMethods,
    hasPurchased,

    // Utils
    initializeUser,
    loadMatches
  };
}

export default useDataManager;
