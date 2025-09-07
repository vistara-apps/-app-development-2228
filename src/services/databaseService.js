// Database service for Supabase integration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

class DatabaseService {
  constructor() {
    if (supabaseUrl && supabaseAnonKey) {
      this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    } else {
      console.warn('Supabase credentials not configured, using mock data');
      this.supabase = null;
    }
  }

  // User operations
  async createUser(userData) {
    if (!this.supabase) return this.mockResponse({ user_id: userData.user_id });

    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert([userData])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUser(userId) {
    if (!this.supabase) return this.mockResponse({ user_id: userId });

    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async updateUser(userId, updates) {
    if (!this.supabase) return this.mockResponse({ user_id: userId, ...updates });

    try {
      const { data, error } = await this.supabase
        .from('users')
        .update(updates)
        .eq('user_id', userId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Match operations
  async getMatches(limit = 10) {
    if (!this.supabase) return this.mockMatches();

    try {
      const { data, error } = await this.supabase
        .from('matches')
        .select('*')
        .gte('match_datetime', new Date().toISOString())
        .order('match_datetime', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching matches:', error);
      return this.mockMatches();
    }
  }

  async getMatch(matchId) {
    if (!this.supabase) return this.mockMatch(matchId);

    try {
      const { data, error } = await this.supabase
        .from('matches')
        .select('*')
        .eq('match_id', matchId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching match:', error);
      return this.mockMatch(matchId);
    }
  }

  async updateMatch(matchId, updates) {
    if (!this.supabase) return this.mockResponse({ match_id: matchId, ...updates });

    try {
      const { data, error } = await this.supabase
        .from('matches')
        .update(updates)
        .eq('match_id', matchId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating match:', error);
      throw error;
    }
  }

  // Transaction operations
  async createTransaction(transactionData) {
    if (!this.supabase) return this.mockResponse({ 
      transaction_id: 'mock_' + Date.now(),
      ...transactionData 
    });

    try {
      const { data, error } = await this.supabase
        .from('transactions')
        .insert([transactionData])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async getUserTransactions(userId) {
    if (!this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('transactions')
        .select(`
          *,
          matches (
            home_team,
            away_team,
            competition
          )
        `)
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      return [];
    }
  }

  // Analytics operations
  async getAnalytics() {
    if (!this.supabase) return this.mockAnalytics();

    try {
      const { data, error } = await this.supabase
        .rpc('get_analytics_data');

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return this.mockAnalytics();
    }
  }

  // Community operations
  async updateCommunityConfidence(matchId, prediction, confidence, userId) {
    if (!this.supabase) return this.mockResponse({ success: true });

    try {
      // Get current community scores
      const match = await this.getMatch(matchId);
      const currentScores = match.community_confidence_scores || [];
      
      // Update or add user's confidence
      const existingIndex = currentScores.findIndex(
        score => score.prediction === prediction
      );
      
      if (existingIndex >= 0) {
        currentScores[existingIndex].confidence = 
          (currentScores[existingIndex].confidence + confidence) / 2;
        currentScores[existingIndex].users += 1;
      } else {
        currentScores.push({
          prediction,
          confidence,
          users: 1
        });
      }

      // Update match with new community scores
      return await this.updateMatch(matchId, {
        community_confidence_scores: currentScores
      });
    } catch (error) {
      console.error('Error updating community confidence:', error);
      throw error;
    }
  }

  // Mock data methods
  mockResponse(data) {
    return new Promise(resolve => {
      setTimeout(() => resolve(data), 100);
    });
  }

  mockMatches() {
    return [
      {
        match_id: '1',
        home_team: 'Manchester City',
        away_team: 'Liverpool',
        match_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        competition: 'Premier League',
        ai_prediction: 'Manchester City to win with over 2.5 goals',
        ai_confidence_score: 85,
        potential_value_bets: 3,
        community_confidence_scores: [
          { prediction: 'Home Win', confidence: 60, users: 150 },
          { prediction: 'Over 2.5', confidence: 75, users: 200 }
        ]
      }
    ];
  }

  mockMatch(matchId) {
    return {
      match_id: matchId,
      home_team: 'Team A',
      away_team: 'Team B',
      match_datetime: new Date().toISOString(),
      competition: 'Mock League',
      ai_prediction: 'Mock prediction',
      ai_confidence_score: 75,
      potential_value_bets: 2,
      community_confidence_scores: []
    };
  }

  mockAnalytics() {
    return {
      total_users: 1250,
      total_matches: 45,
      total_transactions: 3200,
      total_revenue: 1600.00,
      insights_purchased: 2800,
      streak_analyses_purchased: 400
    };
  }
}

export default new DatabaseService();
