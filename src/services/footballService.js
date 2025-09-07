import { footballClient, apiCall } from './api.js';

/**
 * Football Service for fetching real match data and statistics
 */
export class FootballService {

  /**
   * Get upcoming matches from major competitions
   * @param {number} days - Number of days ahead to fetch
   * @returns {Promise<Array>} Upcoming matches
   */
  static async getUpcomingMatches(days = 7) {
    const dateFrom = new Date().toISOString().split('T')[0];
    const dateTo = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Major competition IDs (Premier League, La Liga, Bundesliga, Serie A, Ligue 1)
    const competitions = ['PL', 'PD', 'BL1', 'SA', 'FL1'];
    
    try {
      const matchPromises = competitions.map(competition =>
        apiCall(() =>
          footballClient.get(`/competitions/${competition}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`)
        ).catch(error => {
          console.warn(`Failed to fetch matches for ${competition}:`, error.message);
          return { matches: [] };
        })
      );

      const results = await Promise.all(matchPromises);
      const allMatches = results.flatMap(result => result.matches || []);

      return allMatches.map(match => this.transformMatchData(match));
    } catch (error) {
      console.error('Failed to fetch upcoming matches:', error);
      return this.getFallbackMatches();
    }
  }

  /**
   * Get matches for a specific competition
   * @param {string} competitionCode - Competition code (e.g., 'PL', 'PD')
   * @param {number} matchday - Specific matchday (optional)
   * @returns {Promise<Array>} Competition matches
   */
  static async getCompetitionMatches(competitionCode, matchday = null) {
    const params = matchday ? `?matchday=${matchday}` : '';
    
    return apiCall(() =>
      footballClient.get(`/competitions/${competitionCode}/matches${params}`)
    ).then(data => 
      data.matches.map(match => this.transformMatchData(match))
    ).catch(error => {
      console.error(`Failed to fetch ${competitionCode} matches:`, error);
      return [];
    });
  }

  /**
   * Get team information and recent form
   * @param {number} teamId - Team ID
   * @returns {Promise<Object>} Team data with recent matches
   */
  static async getTeamData(teamId) {
    try {
      const [teamInfo, recentMatches] = await Promise.all([
        apiCall(() => footballClient.get(`/teams/${teamId}`)),
        apiCall(() => footballClient.get(`/teams/${teamId}/matches?limit=10`))
      ]);

      return {
        ...teamInfo,
        recentMatches: recentMatches.matches.map(match => this.transformMatchData(match))
      };
    } catch (error) {
      console.error(`Failed to fetch team data for ${teamId}:`, error);
      return null;
    }
  }

  /**
   * Get head-to-head statistics between two teams
   * @param {number} team1Id - First team ID
   * @param {number} team2Id - Second team ID
   * @returns {Promise<Object>} Head-to-head data
   */
  static async getHeadToHead(team1Id, team2Id) {
    try {
      return apiCall(() =>
        footballClient.get(`/teams/${team1Id}/matches?limit=20`)
      ).then(data => {
        const h2hMatches = data.matches.filter(match => 
          (match.homeTeam.id === team1Id && match.awayTeam.id === team2Id) ||
          (match.homeTeam.id === team2Id && match.awayTeam.id === team1Id)
        );

        return {
          matches: h2hMatches.map(match => this.transformMatchData(match)),
          statistics: this.calculateH2HStats(h2hMatches, team1Id, team2Id)
        };
      });
    } catch (error) {
      console.error('Failed to fetch head-to-head data:', error);
      return { matches: [], statistics: {} };
    }
  }

  /**
   * Get live scores for ongoing matches
   * @returns {Promise<Array>} Live matches
   */
  static async getLiveScores() {
    try {
      return apiCall(() =>
        footballClient.get('/matches?status=LIVE')
      ).then(data =>
        data.matches.map(match => this.transformMatchData(match))
      );
    } catch (error) {
      console.error('Failed to fetch live scores:', error);
      return [];
    }
  }

  /**
   * Transform API match data to our internal format
   * @param {Object} apiMatch - Raw API match data
   * @returns {Object} Transformed match data
   */
  static transformMatchData(apiMatch) {
    return {
      match_id: apiMatch.id.toString(),
      home_team: apiMatch.homeTeam.name,
      away_team: apiMatch.awayTeam.name,
      match_datetime: apiMatch.utcDate,
      competition: apiMatch.competition.name,
      status: apiMatch.status,
      home_score: apiMatch.score?.fullTime?.home || null,
      away_score: apiMatch.score?.fullTime?.away || null,
      home_team_id: apiMatch.homeTeam.id,
      away_team_id: apiMatch.awayTeam.id,
      competition_code: apiMatch.competition.code,
      matchday: apiMatch.matchday,
      // Initialize AI fields as null - will be populated by AI service
      ai_prediction: null,
      ai_confidence_score: null,
      potential_value_bets: 0,
      community_confidence_scores: []
    };
  }

  /**
   * Calculate head-to-head statistics
   * @param {Array} matches - H2H matches
   * @param {number} team1Id - First team ID
   * @param {number} team2Id - Second team ID
   * @returns {Object} H2H statistics
   */
  static calculateH2HStats(matches, team1Id, team2Id) {
    const stats = {
      total_matches: matches.length,
      team1_wins: 0,
      team2_wins: 0,
      draws: 0,
      team1_goals: 0,
      team2_goals: 0
    };

    matches.forEach(match => {
      if (match.score?.fullTime) {
        const homeScore = match.score.fullTime.home;
        const awayScore = match.score.fullTime.away;
        
        if (match.homeTeam.id === team1Id) {
          stats.team1_goals += homeScore;
          stats.team2_goals += awayScore;
          if (homeScore > awayScore) stats.team1_wins++;
          else if (awayScore > homeScore) stats.team2_wins++;
          else stats.draws++;
        } else {
          stats.team1_goals += awayScore;
          stats.team2_goals += homeScore;
          if (awayScore > homeScore) stats.team1_wins++;
          else if (homeScore > awayScore) stats.team2_wins++;
          else stats.draws++;
        }
      }
    });

    return stats;
  }

  /**
   * Get competition standings
   * @param {string} competitionCode - Competition code
   * @returns {Promise<Array>} Standings table
   */
  static async getStandings(competitionCode) {
    try {
      return apiCall(() =>
        footballClient.get(`/competitions/${competitionCode}/standings`)
      ).then(data => data.standings[0]?.table || []);
    } catch (error) {
      console.error(`Failed to fetch standings for ${competitionCode}:`, error);
      return [];
    }
  }

  /**
   * Fallback matches when API is unavailable
   * @returns {Array} Mock matches
   */
  static getFallbackMatches() {
    const competitions = ['Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1'];
    const teams = [
      ['Manchester City', 'Liverpool'],
      ['Barcelona', 'Real Madrid'],
      ['Bayern Munich', 'Borussia Dortmund'],
      ['Juventus', 'AC Milan'],
      ['PSG', 'Marseille']
    ];

    return teams.map((teamPair, index) => ({
      match_id: `fallback_${index + 1}`,
      home_team: teamPair[0],
      away_team: teamPair[1],
      match_datetime: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
      competition: competitions[index],
      status: 'SCHEDULED',
      home_score: null,
      away_score: null,
      ai_prediction: null,
      ai_confidence_score: null,
      potential_value_bets: 0,
      community_confidence_scores: []
    }));
  }

  /**
   * Get supported competitions
   * @returns {Array} Competition list
   */
  static getSupportedCompetitions() {
    return [
      { code: 'PL', name: 'Premier League', country: 'England' },
      { code: 'PD', name: 'La Liga', country: 'Spain' },
      { code: 'BL1', name: 'Bundesliga', country: 'Germany' },
      { code: 'SA', name: 'Serie A', country: 'Italy' },
      { code: 'FL1', name: 'Ligue 1', country: 'France' },
      { code: 'CL', name: 'Champions League', country: 'Europe' },
      { code: 'EL', name: 'Europa League', country: 'Europe' }
    ];
  }
}

export default FootballService;
