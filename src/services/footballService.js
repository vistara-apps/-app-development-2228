// Football Data API service
import api from './api.js';

const FOOTBALL_API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY;
const FOOTBALL_API_URL = import.meta.env.VITE_FOOTBALL_API_URL || 'https://api.football-data.org/v4';

class FootballService {
  constructor() {
    this.apiKey = FOOTBALL_API_KEY;
    this.baseURL = FOOTBALL_API_URL;
    this.headers = {
      'X-Auth-Token': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async getCompetitions() {
    if (!this.apiKey) {
      console.warn('Football API key not configured, using mock data');
      return this.getMockCompetitions();
    }

    try {
      const response = await fetch(`${this.baseURL}/competitions`, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Football API error: ${response.status}`);
      }

      const data = await response.json();
      return data.competitions;
    } catch (error) {
      console.error('Error fetching competitions:', error);
      return this.getMockCompetitions();
    }
  }

  async getMatches(competitionId = null, dateFrom = null, dateTo = null) {
    if (!this.apiKey) {
      console.warn('Football API key not configured, using mock data');
      return this.getMockMatches();
    }

    try {
      let url = `${this.baseURL}/matches`;
      const params = new URLSearchParams();

      if (competitionId) {
        url = `${this.baseURL}/competitions/${competitionId}/matches`;
      }

      if (dateFrom) {
        params.append('dateFrom', dateFrom);
      }

      if (dateTo) {
        params.append('dateTo', dateTo);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Football API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformMatches(data.matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      return this.getMockMatches();
    }
  }

  async getMatch(matchId) {
    if (!this.apiKey) {
      console.warn('Football API key not configured, using mock data');
      return this.getMockMatch(matchId);
    }

    try {
      const response = await fetch(`${this.baseURL}/matches/${matchId}`, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Football API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformMatch(data);
    } catch (error) {
      console.error('Error fetching match:', error);
      return this.getMockMatch(matchId);
    }
  }

  async getTeam(teamId) {
    if (!this.apiKey) {
      console.warn('Football API key not configured, using mock data');
      return this.getMockTeam(teamId);
    }

    try {
      const response = await fetch(`${this.baseURL}/teams/${teamId}`, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Football API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching team:', error);
      return this.getMockTeam(teamId);
    }
  }

  async getTeamMatches(teamId, limit = 10) {
    if (!this.apiKey) {
      console.warn('Football API key not configured, using mock data');
      return this.getMockMatches();
    }

    try {
      const response = await fetch(`${this.baseURL}/teams/${teamId}/matches?limit=${limit}`, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Football API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformMatches(data.matches);
    } catch (error) {
      console.error('Error fetching team matches:', error);
      return this.getMockMatches();
    }
  }

  // Transform API data to our internal format
  transformMatches(matches) {
    return matches.map(match => this.transformMatch(match));
  }

  transformMatch(match) {
    return {
      match_id: match.id.toString(),
      home_team: match.homeTeam.name,
      away_team: match.awayTeam.name,
      home_team_id: match.homeTeam.id,
      away_team_id: match.awayTeam.id,
      match_datetime: match.utcDate,
      competition: match.competition.name,
      competition_code: match.competition.code,
      matchday: match.matchday,
      status: match.status,
      home_score: match.score.fullTime.home,
      away_score: match.score.fullTime.away,
      // Initialize AI fields as null - will be populated by AI service
      ai_prediction: null,
      ai_confidence_score: null,
      ai_detailed_analysis: null,
      potential_value_bets: 0,
      community_confidence_scores: [],
    };
  }

  // Mock data methods for when API is not available
  getMockCompetitions() {
    return [
      {
        id: 'PL',
        name: 'Premier League',
        code: 'PL',
        type: 'LEAGUE',
        emblem: 'https://crests.football-data.org/PL.png'
      },
      {
        id: 'PD',
        name: 'Primera Division',
        code: 'PD',
        type: 'LEAGUE',
        emblem: 'https://crests.football-data.org/PD.png'
      },
      {
        id: 'BL1',
        name: 'Bundesliga',
        code: 'BL1',
        type: 'LEAGUE',
        emblem: 'https://crests.football-data.org/BL1.png'
      },
      {
        id: 'SA',
        name: 'Serie A',
        code: 'SA',
        type: 'LEAGUE',
        emblem: 'https://crests.football-data.org/SA.png'
      },
      {
        id: 'FL1',
        name: 'Ligue 1',
        code: 'FL1',
        type: 'LEAGUE',
        emblem: 'https://crests.football-data.org/FL1.png'
      }
    ];
  }

  getMockMatches() {
    const now = new Date();
    return [
      {
        match_id: '1',
        home_team: 'Manchester City',
        away_team: 'Liverpool',
        home_team_id: 65,
        away_team_id: 64,
        match_datetime: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        competition: 'Premier League',
        competition_code: 'PL',
        matchday: 15,
        status: 'SCHEDULED',
        home_score: null,
        away_score: null,
        ai_prediction: null,
        ai_confidence_score: null,
        ai_detailed_analysis: null,
        potential_value_bets: 0,
        community_confidence_scores: [],
      },
      {
        match_id: '2',
        home_team: 'Barcelona',
        away_team: 'Real Madrid',
        home_team_id: 81,
        away_team_id: 86,
        match_datetime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        competition: 'Primera Division',
        competition_code: 'PD',
        matchday: 12,
        status: 'SCHEDULED',
        home_score: null,
        away_score: null,
        ai_prediction: null,
        ai_confidence_score: null,
        ai_detailed_analysis: null,
        potential_value_bets: 0,
        community_confidence_scores: [],
      },
      {
        match_id: '3',
        home_team: 'Bayern Munich',
        away_team: 'Borussia Dortmund',
        home_team_id: 5,
        away_team_id: 4,
        match_datetime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        competition: 'Bundesliga',
        competition_code: 'BL1',
        matchday: 10,
        status: 'SCHEDULED',
        home_score: null,
        away_score: null,
        ai_prediction: null,
        ai_confidence_score: null,
        ai_detailed_analysis: null,
        potential_value_bets: 0,
        community_confidence_scores: [],
      }
    ];
  }

  getMockMatch(matchId) {
    const matches = this.getMockMatches();
    return matches.find(match => match.match_id === matchId) || matches[0];
  }

  getMockTeam(teamId) {
    return {
      id: teamId,
      name: 'Mock Team',
      shortName: 'MOCK',
      tla: 'MCK',
      crest: 'https://via.placeholder.com/64x64',
      address: 'Mock Address',
      website: 'https://mockteam.com',
      founded: 1900,
      clubColors: 'Blue / White',
      venue: 'Mock Stadium',
      runningCompetitions: [],
      coach: {
        id: 1,
        name: 'Mock Coach',
        dateOfBirth: '1970-01-01',
        nationality: 'Mock Country'
      },
      squad: [],
      staff: [],
      lastUpdated: new Date().toISOString()
    };
  }

  // Utility methods
  getUpcomingMatches(days = 7) {
    const dateFrom = new Date().toISOString().split('T')[0];
    const dateTo = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return this.getMatches(null, dateFrom, dateTo);
  }

  getTodaysMatches() {
    const today = new Date().toISOString().split('T')[0];
    return this.getMatches(null, today, today);
  }

  getMatchesByCompetition(competitionCode, days = 7) {
    const dateFrom = new Date().toISOString().split('T')[0];
    const dateTo = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return this.getMatches(competitionCode, dateFrom, dateTo);
  }
}

export default new FootballService();
