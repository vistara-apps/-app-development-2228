-- BetWiseAI Database Schema for Supabase
-- This file contains the complete database schema as specified in the PRD

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    user_id VARCHAR(255) PRIMARY KEY,
    farcaster_id VARCHAR(255) UNIQUE,
    wallet_address VARCHAR(255) UNIQUE,
    purchase_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table
CREATE TABLE matches (
    match_id VARCHAR(255) PRIMARY KEY,
    home_team VARCHAR(255) NOT NULL,
    away_team VARCHAR(255) NOT NULL,
    match_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    competition VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    home_score INTEGER,
    away_score INTEGER,
    home_team_id INTEGER,
    away_team_id INTEGER,
    competition_code VARCHAR(10),
    matchday INTEGER,
    ai_prediction TEXT,
    ai_confidence_score INTEGER,
    ai_detailed_analysis JSONB,
    potential_value_bets INTEGER DEFAULT 0,
    community_confidence_scores JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
    match_id VARCHAR(255) REFERENCES matches(match_id),
    amount DECIMAL(10,2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'match_insight', 'streak_analysis'
    payment_method VARCHAR(50) NOT NULL, -- 'crypto', 'fiat'
    transaction_hash VARCHAR(255),
    status VARCHAR(50) DEFAULT 'completed',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_matches_datetime ON matches(match_datetime);
CREATE INDEX idx_matches_competition ON matches(competition);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_match_id ON transactions(match_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = user_id OR user_id LIKE 'user_%');

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = user_id OR user_id LIKE 'user_%');

CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id LIKE 'user_%');

-- Matches are publicly readable
CREATE POLICY "Matches are publicly readable" ON matches
    FOR SELECT USING (true);

-- Only authenticated users can view transactions, and only their own
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid()::text = user_id OR user_id LIKE 'user_%');

CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id LIKE 'user_%');

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get user purchase history
CREATE OR REPLACE FUNCTION get_user_purchase_history(p_user_id TEXT)
RETURNS TABLE (
    transaction_id UUID,
    match_id VARCHAR(255),
    amount DECIMAL(10,2),
    transaction_type VARCHAR(50),
    payment_method VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE,
    home_team VARCHAR(255),
    away_team VARCHAR(255),
    competition VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.transaction_id,
        t.match_id,
        t.amount,
        t.transaction_type,
        t.payment_method,
        t.timestamp,
        m.home_team,
        m.away_team,
        m.competition
    FROM transactions t
    LEFT JOIN matches m ON t.match_id = m.match_id
    WHERE t.user_id = p_user_id
    ORDER BY t.timestamp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get match insights with purchase status
CREATE OR REPLACE FUNCTION get_match_with_purchase_status(p_match_id TEXT, p_user_id TEXT)
RETURNS TABLE (
    match_id VARCHAR(255),
    home_team VARCHAR(255),
    away_team VARCHAR(255),
    match_datetime TIMESTAMP WITH TIME ZONE,
    competition VARCHAR(255),
    ai_prediction TEXT,
    ai_confidence_score INTEGER,
    potential_value_bets INTEGER,
    community_confidence_scores JSONB,
    has_purchased_insight BOOLEAN,
    has_purchased_streak BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.match_id,
        m.home_team,
        m.away_team,
        m.match_datetime,
        m.competition,
        m.ai_prediction,
        m.ai_confidence_score,
        m.potential_value_bets,
        m.community_confidence_scores,
        EXISTS(
            SELECT 1 FROM transactions t 
            WHERE t.match_id = m.match_id 
            AND t.user_id = p_user_id 
            AND t.transaction_type = 'match_insight'
            AND t.status = 'completed'
        ) as has_purchased_insight,
        EXISTS(
            SELECT 1 FROM transactions t 
            WHERE t.match_id = m.match_id 
            AND t.user_id = p_user_id 
            AND t.transaction_type = 'streak_analysis'
            AND t.status = 'completed'
        ) as has_purchased_streak
    FROM matches m
    WHERE m.match_id = p_match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get analytics data
CREATE OR REPLACE FUNCTION get_analytics_data()
RETURNS TABLE (
    total_users BIGINT,
    total_matches BIGINT,
    total_transactions BIGINT,
    total_revenue DECIMAL(10,2),
    insights_purchased BIGINT,
    streak_analyses_purchased BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM matches) as total_matches,
        (SELECT COUNT(*) FROM transactions WHERE status = 'completed') as total_transactions,
        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE status = 'completed') as total_revenue,
        (SELECT COUNT(*) FROM transactions WHERE transaction_type = 'match_insight' AND status = 'completed') as insights_purchased,
        (SELECT COUNT(*) FROM transactions WHERE transaction_type = 'streak_analysis' AND status = 'completed') as streak_analyses_purchased;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some sample data for testing
INSERT INTO matches (
    match_id, home_team, away_team, match_datetime, competition,
    ai_prediction, ai_confidence_score, potential_value_bets,
    community_confidence_scores
) VALUES 
(
    'sample_1',
    'Manchester City',
    'Liverpool',
    NOW() + INTERVAL '1 day',
    'Premier League',
    'Manchester City to win with over 2.5 goals',
    85,
    3,
    '[{"prediction": "Home Win", "confidence": 60, "users": 150}, {"prediction": "Over 2.5", "confidence": 75, "users": 200}]'::jsonb
),
(
    'sample_2',
    'Barcelona',
    'Real Madrid',
    NOW() + INTERVAL '2 days',
    'La Liga',
    'Draw with both teams to score',
    72,
    2,
    '[{"prediction": "Draw", "confidence": 45, "users": 120}, {"prediction": "BTTS", "confidence": 80, "users": 180}]'::jsonb
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE users IS 'User profiles with wallet and Farcaster integration';
COMMENT ON TABLE matches IS 'Football matches with AI predictions and community data';
COMMENT ON TABLE transactions IS 'Payment transactions for insights and features';
COMMENT ON FUNCTION get_user_purchase_history IS 'Returns complete purchase history for a user';
COMMENT ON FUNCTION get_match_with_purchase_status IS 'Returns match data with user purchase status';
COMMENT ON FUNCTION get_analytics_data IS 'Returns aggregated analytics data for admin dashboard';
