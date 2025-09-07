// AI Service for OpenAI integration
import api from './api.js';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

class AIService {
  constructor() {
    this.apiKey = OPENAI_API_KEY;
    this.baseURL = OPENAI_BASE_URL;
  }

  async generateMatchPrediction(matchData) {
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured, using mock prediction');
      return this.getMockPrediction(matchData);
    }

    try {
      const prompt = this.buildPredictionPrompt(matchData);
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a professional football analyst providing betting insights. Provide concise, data-driven predictions with confidence scores.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const prediction = data.choices[0]?.message?.content;

      return {
        prediction,
        confidence_score: this.extractConfidenceScore(prediction),
        detailed_analysis: this.parseDetailedAnalysis(prediction),
      };
    } catch (error) {
      console.error('AI prediction failed:', error);
      return this.getMockPrediction(matchData);
    }
  }

  buildPredictionPrompt(matchData) {
    return `
      Analyze this football match and provide a betting prediction:
      
      Match: ${matchData.home_team} vs ${matchData.away_team}
      Competition: ${matchData.competition}
      Date: ${matchData.match_datetime}
      
      Please provide:
      1. Main prediction (winner, goals, etc.)
      2. Confidence score (1-100)
      3. Key factors influencing the prediction
      4. Value betting opportunities
      
      Format your response clearly with the confidence score clearly stated.
    `;
  }

  extractConfidenceScore(prediction) {
    // Extract confidence score from AI response
    const confidenceMatch = prediction.match(/confidence[:\s]*(\d+)/i);
    if (confidenceMatch) {
      return parseInt(confidenceMatch[1]);
    }
    
    // Default confidence based on prediction strength
    if (prediction.toLowerCase().includes('strong')) return 85;
    if (prediction.toLowerCase().includes('likely')) return 70;
    if (prediction.toLowerCase().includes('possible')) return 55;
    return 60;
  }

  parseDetailedAnalysis(prediction) {
    // Parse the AI response into structured analysis
    return {
      main_prediction: prediction.split('\n')[0] || prediction.substring(0, 100),
      key_factors: this.extractKeyFactors(prediction),
      value_bets: this.extractValueBets(prediction),
      risk_assessment: this.extractRiskAssessment(prediction),
    };
  }

  extractKeyFactors(prediction) {
    // Extract key factors from prediction text
    const factors = [];
    const lines = prediction.split('\n');
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('factor') || 
          line.toLowerCase().includes('because') ||
          line.toLowerCase().includes('due to')) {
        factors.push(line.trim());
      }
    });
    
    return factors.length > 0 ? factors : ['Team form', 'Head-to-head record', 'Home advantage'];
  }

  extractValueBets(prediction) {
    // Extract value betting opportunities
    const valueBets = [];
    const text = prediction.toLowerCase();
    
    if (text.includes('over') || text.includes('goals')) {
      valueBets.push('Over/Under Goals');
    }
    if (text.includes('both teams') || text.includes('btts')) {
      valueBets.push('Both Teams to Score');
    }
    if (text.includes('corner') || text.includes('card')) {
      valueBets.push('Special Markets');
    }
    
    return valueBets.length > 0 ? valueBets : ['Match Result', 'Total Goals'];
  }

  extractRiskAssessment(prediction) {
    const text = prediction.toLowerCase();
    
    if (text.includes('high risk') || text.includes('unpredictable')) {
      return 'High';
    }
    if (text.includes('low risk') || text.includes('safe')) {
      return 'Low';
    }
    return 'Medium';
  }

  getMockPrediction(matchData) {
    // Fallback mock prediction when AI is not available
    const predictions = [
      `${matchData.home_team} to win with over 2.5 goals`,
      `Draw with both teams to score`,
      `${matchData.away_team} to win with under 2.5 goals`,
      `High-scoring match with over 3.5 goals`,
    ];
    
    const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];
    const confidence = Math.floor(Math.random() * 30) + 60; // 60-90
    
    return {
      prediction: randomPrediction,
      confidence_score: confidence,
      detailed_analysis: {
        main_prediction: randomPrediction,
        key_factors: ['Team form analysis', 'Historical performance', 'Current squad strength'],
        value_bets: ['Match Result', 'Total Goals', 'Both Teams to Score'],
        risk_assessment: 'Medium',
      },
    };
  }
}

export default new AIService();
