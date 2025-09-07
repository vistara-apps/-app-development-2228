import { supabaseClient, apiCall } from './api.js';

/**
 * Database Service for managing users, matches, and transactions
 */
export class DatabaseService {

  /**
   * Create or update user profile
   * @param {Object} userData - User information
   * @returns {Promise<Object>} User data
   */
  static async upsertUser(userData) {
    const { user_id, farcaster_id, wallet_address } = userData;
    
    return apiCall(() =>
      supabaseClient.post('/rest/v1/users', {
        user_id,
        farcaster_id,
        wallet_address,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        headers: {
          'Prefer': 'resolution=merge-duplicates'
        }
      })
    );
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User data
   */
  static async getUser(userId) {
    return apiCall(() =>
      supabaseClient.get(`/rest/v1/users?user_id=eq.${userId}&select=*`)
    ).then(data => data[0] || null);
  }

  /**
   * Get user purchase history
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Transaction history
   */
  static async getUserPurchaseHistory(userId) {
    return apiCall(() =>
      supabaseClient.get(`/rest/v1/transactions?user_id=eq.${userId}&select=*,matches(*)&order=timestamp.desc`)
    );
  }

  /**
   * Store match data
   * @param {Object} matchData - Match information
   * @returns {Promise<Object>} Stored match data
   */
  static async storeMatch(matchData) {
    const {
      match_id,
      home_team,
      away_team,
      match_datetime,
      competition,
      ai_prediction,
      ai_confidence_score,
      potential_value_bets,
      community_confidence_scores
    } = matchData;

    return apiCall(() =>
      supabaseClient.post('/rest/v1/matches', {
        match_id,
        home_team,
        away_team,
        match_datetime,
        competition,
        ai_prediction,
        ai_confidence_score,
        potential_value_bets,
        community_confidence_scores,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        headers: {
          'Prefer': 'resolution=merge-duplicates'
        }
      })
    );
  }

  /**
   * Get matches for a specific date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Matches
   */
  static async getMatches(startDate, endDate) {
    const start = startDate.toISOString();
    const end = endDate.toISOString();
    
    return apiCall(() =>
      supabaseClient.get(`/rest/v1/matches?match_datetime=gte.${start}&match_datetime=lte.${end}&select=*&order=match_datetime.asc`)
    );
  }

  /**
   * Get upcoming matches
   * @param {number} limit - Number of matches to fetch
   * @returns {Promise<Array>} Upcoming matches
   */
  static async getUpcomingMatches(limit = 10) {
    const now = new Date().toISOString();
    
    return apiCall(() =>
      supabaseClient.get(`/rest/v1/matches?match_datetime=gte.${now}&select=*&order=match_datetime.asc&limit=${limit}`)
    );
  }

  /**
   * Record a transaction
   * @param {Object} transactionData - Transaction information
   * @returns {Promise<Object>} Transaction record
   */
  static async recordTransaction(transactionData) {
    const {
      user_id,
      match_id,
      amount,
      transaction_type,
      payment_method,
      transaction_hash
    } = transactionData;

    return apiCall(() =>
      supabaseClient.post('/rest/v1/transactions', {
        user_id,
        match_id,
        amount,
        transaction_type,
        payment_method,
        transaction_hash,
        timestamp: new Date().toISOString(),
        status: 'completed'
      })
    );
  }

  /**
   * Update community confidence for a match
   * @param {string} matchId - Match ID
   * @param {Object} confidenceData - Confidence data
   * @returns {Promise<Object>} Updated match
   */
  static async updateCommunityConfidence(matchId, confidenceData) {
    return apiCall(() =>
      supabaseClient.patch(`/rest/v1/matches?match_id=eq.${matchId}`, {
        community_confidence_scores: confidenceData,
        updated_at: new Date().toISOString()
      })
    );
  }

  /**
   * Get match by ID
   * @param {string} matchId - Match ID
   * @returns {Promise<Object>} Match data
   */
  static async getMatch(matchId) {
    return apiCall(() =>
      supabaseClient.get(`/rest/v1/matches?match_id=eq.${matchId}&select=*`)
    ).then(data => data[0] || null);
  }

  /**
   * Check if user has purchased insights for a match
   * @param {string} userId - User ID
   * @param {string} matchId - Match ID
   * @returns {Promise<boolean>} Has purchased
   */
  static async hasPurchasedInsights(userId, matchId) {
    return apiCall(() =>
      supabaseClient.get(`/rest/v1/transactions?user_id=eq.${userId}&match_id=eq.${matchId}&transaction_type=eq.match_insight&select=transaction_id`)
    ).then(data => data.length > 0);
  }

  /**
   * Get user's purchased insights
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Match IDs with purchased insights
   */
  static async getUserPurchasedInsights(userId) {
    return apiCall(() =>
      supabaseClient.get(`/rest/v1/transactions?user_id=eq.${userId}&transaction_type=eq.match_insight&select=match_id`)
    ).then(data => data.map(t => t.match_id));
  }

  /**
   * Store AI prediction result
   * @param {string} matchId - Match ID
   * @param {Object} predictionData - AI prediction data
   * @returns {Promise<Object>} Updated match
   */
  static async storePrediction(matchId, predictionData) {
    return apiCall(() =>
      supabaseClient.patch(`/rest/v1/matches?match_id=eq.${matchId}`, {
        ai_prediction: predictionData.prediction,
        ai_confidence_score: predictionData.confidence_score,
        ai_detailed_analysis: predictionData,
        updated_at: new Date().toISOString()
      })
    );
  }

  /**
   * Get analytics data for admin dashboard
   * @returns {Promise<Object>} Analytics data
   */
  static async getAnalytics() {
    const [users, transactions, matches] = await Promise.all([
      apiCall(() => supabaseClient.get('/rest/v1/users?select=count')),
      apiCall(() => supabaseClient.get('/rest/v1/transactions?select=count,amount')),
      apiCall(() => supabaseClient.get('/rest/v1/matches?select=count'))
    ]);

    return {
      total_users: users.length,
      total_transactions: transactions.length,
      total_revenue: transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
      total_matches: matches.length
    };
  }
}

export default DatabaseService;
