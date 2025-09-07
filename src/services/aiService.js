import { openaiClient, apiCall } from './api.js';

/**
 * AI Service for generating match predictions and insights
 */
export class AIService {
  
  /**
   * Generate AI prediction for a football match
   * @param {Object} matchData - Match information
   * @returns {Promise<Object>} AI prediction with confidence score
   */
  static async generateMatchPrediction(matchData) {
    const { home_team, away_team, competition, match_datetime } = matchData;
    
    const prompt = `
      As an expert football analyst, provide a detailed prediction for the upcoming match:
      
      Match: ${home_team} vs ${away_team}
      Competition: ${competition}
      Date: ${new Date(match_datetime).toLocaleDateString()}
      
      Please provide:
      1. Match outcome prediction (Home Win/Draw/Away Win)
      2. Goals prediction (Over/Under 2.5)
      3. Both teams to score prediction
      4. Confidence score (0-100)
      5. Key reasoning factors
      6. Value bet opportunities
      
      Format your response as JSON with the following structure:
      {
        "prediction": "Main prediction text",
        "confidence_score": 85,
        "outcome_probabilities": {
          "home_win": 45,
          "draw": 25,
          "away_win": 30
        },
        "goals_prediction": {
          "over_2_5": 65,
          "under_2_5": 35
        },
        "btts_probability": 70,
        "key_factors": ["Factor 1", "Factor 2", "Factor 3"],
        "value_bets": [
          {
            "bet_type": "Over 2.5 Goals",
            "expected_value": "+12%",
            "recommended_odds": 1.85
          }
        ]
      }
    `;

    return apiCall(() => 
      openaiClient.post('/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional football analyst with expertise in statistical analysis and betting markets. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    ).then(response => {
      try {
        const content = response.choices[0].message.content;
        return JSON.parse(content);
      } catch (error) {
        console.error('Failed to parse AI response:', error);
        // Fallback response
        return this.generateFallbackPrediction(matchData);
      }
    });
  }

  /**
   * Generate streak analysis for premium users
   * @param {string} teamName - Team name
   * @param {Array} recentMatches - Recent match history
   * @returns {Promise<Object>} Streak analysis
   */
  static async generateStreakAnalysis(teamName, recentMatches) {
    const prompt = `
      Analyze the recent performance streak for ${teamName} based on their last matches:
      
      Recent matches: ${JSON.stringify(recentMatches)}
      
      Provide a comprehensive streak analysis including:
      1. Current form trend
      2. Scoring patterns
      3. Defensive stability
      4. Home vs Away performance
      5. Key player impact
      6. Momentum indicators
      
      Format as JSON with detailed insights.
    `;

    return apiCall(() =>
      openaiClient.post('/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a football performance analyst specializing in team form and momentum analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 800
      })
    ).then(response => {
      try {
        const content = response.choices[0].message.content;
        return JSON.parse(content);
      } catch (error) {
        console.error('Failed to parse streak analysis:', error);
        return this.generateFallbackStreakAnalysis(teamName);
      }
    });
  }

  /**
   * Fallback prediction when AI service fails
   * @param {Object} matchData - Match information
   * @returns {Object} Basic prediction
   */
  static generateFallbackPrediction(matchData) {
    return {
      prediction: `${matchData.home_team} to win with over 2.5 goals`,
      confidence_score: Math.floor(Math.random() * 30) + 60, // 60-90
      outcome_probabilities: {
        home_win: 45,
        draw: 25,
        away_win: 30
      },
      goals_prediction: {
        over_2_5: 65,
        under_2_5: 35
      },
      btts_probability: 70,
      key_factors: [
        `${matchData.home_team} has strong home record`,
        'Both teams have attacking potential',
        'Recent head-to-head suggests goals'
      ],
      value_bets: [
        {
          bet_type: 'Over 2.5 Goals',
          expected_value: '+8%',
          recommended_odds: 1.85
        }
      ]
    };
  }

  /**
   * Fallback streak analysis
   * @param {string} teamName - Team name
   * @returns {Object} Basic streak analysis
   */
  static generateFallbackStreakAnalysis(teamName) {
    return {
      team: teamName,
      current_form: 'Good',
      form_rating: 7.5,
      scoring_trend: 'Consistent',
      defensive_stability: 'Solid',
      momentum: 'Positive',
      key_insights: [
        'Team showing consistent performance',
        'Good balance between attack and defense',
        'Recent results indicate positive momentum'
      ]
    };
  }

  /**
   * Validate match data before processing
   * @param {Object} matchData - Match information
   * @returns {boolean} Is valid
   */
  static validateMatchData(matchData) {
    const required = ['home_team', 'away_team', 'competition', 'match_datetime'];
    return required.every(field => matchData[field]);
  }
}

export default AIService;
