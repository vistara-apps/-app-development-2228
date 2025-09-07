export const mockMatches = [
  {
    match_id: '1',
    home_team: 'Manchester City',
    away_team: 'Liverpool',
    match_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    competition: 'Premier League',
    ai_prediction: 'Manchester City to win with over 2.5 goals',
    ai_confidence_score: 85,
    potential_value_bets: 3,
    community_confidence_scores: [
      { prediction: 'Home Win', confidence: 60, users: 150 },
      { prediction: 'Over 2.5', confidence: 75, users: 200 }
    ]
  },
  {
    match_id: '2',
    home_team: 'Barcelona',
    away_team: 'Real Madrid',
    match_datetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
    competition: 'La Liga',
    ai_prediction: 'Draw with both teams to score',
    ai_confidence_score: 72,
    potential_value_bets: 2,
    community_confidence_scores: [
      { prediction: 'Draw', confidence: 45, users: 120 },
      { prediction: 'BTTS', confidence: 80, users: 180 }
    ]
  },
  {
    match_id: '3',
    home_team: 'Chelsea',
    away_team: 'Arsenal',
    match_datetime: new Date().toISOString(), // Today
    competition: 'Premier League',
    ai_prediction: 'Arsenal to win with under 2.5 goals',
    ai_confidence_score: 68,
    potential_value_bets: 1,
    community_confidence_scores: [
      { prediction: 'Away Win', confidence: 55, users: 95 },
      { prediction: 'Under 2.5', confidence: 60, users: 110 }
    ]
  },
  {
    match_id: '4',
    home_team: 'Bayern Munich',
    away_team: 'Borussia Dortmund',
    match_datetime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    competition: 'Bundesliga',
    ai_prediction: 'Bayern Munich to win with over 3.5 goals',
    ai_confidence_score: 91,
    potential_value_bets: 4,
    community_confidence_scores: [
      { prediction: 'Home Win', confidence: 75, users: 220 },
      { prediction: 'Over 3.5', confidence: 65, users: 145 }
    ]
  },
  {
    match_id: '5',
    home_team: 'PSG',
    away_team: 'Marseille',
    match_datetime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    competition: 'Ligue 1',
    ai_prediction: 'PSG to win with BTTS',
    ai_confidence_score: 79,
    potential_value_bets: 2,
    community_confidence_scores: [
      { prediction: 'Home Win', confidence: 70, users: 160 },
      { prediction: 'BTTS', confidence: 85, users: 190 }
    ]
  }
];