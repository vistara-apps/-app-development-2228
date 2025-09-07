# BetWiseAI - AI-Powered Football Betting Insights

![BetWiseAI](https://via.placeholder.com/800x400/1a1a2e/ffffff?text=BetWiseAI)

**Smarter Football Bets with AI Insights**

BetWiseAI is a Base mini-app that provides AI-driven predictions and value bet identification for football matches, helping users make more informed betting decisions through data-backed insights and community confidence aggregation.

## 🚀 Features

### Core Features
- **🤖 AI Match Insights** - AI-powered predictions with confidence scores ($0.50)
- **💎 Value Bet Identification** - Highlight undervalued betting opportunities
- **👥 Community Confidence** - Aggregated prediction confidence from users
- **📈 Streak Analysis** - Premium team form and momentum analysis ($1.00)

### Technical Features
- **⚡ Base Network Integration** - Native crypto payments with USDC
- **🔗 Farcaster Integration** - Social features and user onboarding
- **💳 Dual Payment Options** - Crypto (Base/USDC) and fiat (Stripe)
- **📱 Responsive Design** - Optimized for mobile and desktop
- **🎨 Dark Theme UI** - Modern, betting-focused interface

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Blockchain**: Base Network, Wagmi, RainbowKit
- **Payments**: x402-axios (crypto), Stripe (fiat)
- **AI**: OpenAI GPT-4 for predictions
- **Database**: Supabase (PostgreSQL)
- **APIs**: Football-Data.org for match data

## 📋 Prerequisites

Before setting up BetWiseAI, ensure you have:

- Node.js 18+ and npm/yarn
- Git
- A Supabase account
- OpenAI API key
- Football-Data.org API key
- Stripe account (for fiat payments)
- Base network wallet for testing

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/vistara-apps/-app-development-2228.git
cd -app-development-2228
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Copy the environment template and configure your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```env
# API Keys
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# Football Data API
VITE_FOOTBALL_API_KEY=your_football_api_key_here
VITE_FOOTBALL_API_URL=https://api.football-data.org/v4

# Payment Configuration
VITE_PAYMENT_API_URL=https://payments.vistara.dev
VITE_USDC_CONTRACT_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# App Configuration
VITE_APP_NAME=BetWiseAI
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
```

### 4. Database Setup

#### Supabase Setup

1. Create a new Supabase project
2. Run the database schema:

```bash
# Copy the schema to Supabase SQL Editor
cat database/schema.sql
```

3. Execute the schema in your Supabase SQL Editor

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:5173` to see the app running.

## 🏗 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.jsx    # Main dashboard
│   ├── MatchDetails.jsx # Match detail view
│   ├── MatchCard.jsx    # Match card component
│   ├── PaymentButton.jsx # Payment handling
│   ├── StreakAnalysis.jsx # Premium feature
│   └── CommunityGraph.jsx # Community insights
├── services/            # API services
│   ├── api.js          # Base API configuration
│   ├── aiService.js    # OpenAI integration
│   ├── databaseService.js # Supabase integration
│   ├── footballService.js # Football data API
│   └── paymentService.js  # Payment processing
├── hooks/              # Custom React hooks
│   ├── useDataManager.js # Main data management
│   └── usePaymentContext.js # Payment context
├── data/               # Mock data and constants
└── styles/             # CSS and styling
```

## 🔧 API Integration Guide

### OpenAI Setup
1. Get API key from [OpenAI Platform](https://platform.openai.com/)
2. Add to environment variables
3. Configure in `src/services/aiService.js`

### Supabase Setup
1. Create project at [Supabase](https://supabase.com/)
2. Run the provided schema (`database/schema.sql`)
3. Configure RLS policies for security
4. Add URL and anon key to environment

### Football Data API
1. Register at [Football-Data.org](https://www.football-data.org/)
2. Get free tier API key
3. Add to environment variables

### Stripe Setup (Optional)
1. Create account at [Stripe](https://stripe.com/)
2. Get publishable key
3. Configure webhook endpoints for payment confirmation

## 💰 Payment Integration

### Crypto Payments (Base Network)
- Uses x402-axios for seamless USDC payments
- Integrated with Base network
- Automatic transaction recording

### Fiat Payments (Stripe)
- Credit/debit card support
- Secure payment processing
- Webhook integration for confirmation

## 🎯 Business Model

### Micro-transactions
- **Match Insights**: $0.50 per prediction
- **Streak Analysis**: $1.00 per analysis
- Low-friction entry for users
- Immediate value delivery

### Alternative Models
- Subscription for unlimited access
- Freemium with limited daily insights
- Volume discounts for power users

## 🚀 Deployment

### Build for Production

```bash
npm run build
# or
yarn build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables

## 🧪 Testing

### Run Tests

```bash
npm test
# or
yarn test
```

### Test Payment Flow

1. Connect wallet (use Base testnet)
2. Select a match
3. Purchase insights with test USDC
4. Verify transaction recording

## 📊 Analytics & Monitoring

### Database Analytics
- User growth tracking
- Revenue monitoring
- Feature usage analytics
- Transaction success rates

### Performance Monitoring
- API response times
- Error tracking
- User engagement metrics

## 🔒 Security

### Best Practices Implemented
- Row Level Security (RLS) in Supabase
- API key protection
- Secure payment processing
- Input validation and sanitization

### Security Checklist
- [ ] Environment variables secured
- [ ] Database RLS policies active
- [ ] Payment webhooks verified
- [ ] API rate limiting configured

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Documentation

### Core Endpoints

#### Matches
- `GET /matches` - Get upcoming matches
- `GET /matches/:id` - Get match details
- `POST /matches/:id/prediction` - Generate AI prediction

#### Users
- `POST /users` - Create/update user
- `GET /users/:id/history` - Get purchase history

#### Payments
- `POST /payments/crypto` - Process crypto payment
- `POST /payments/stripe` - Process fiat payment

## 🐛 Troubleshooting

### Common Issues

**API Keys Not Working**
- Verify all environment variables are set
- Check API key permissions and quotas
- Ensure correct API endpoints

**Payment Failures**
- Check wallet connection
- Verify sufficient USDC balance
- Confirm network (Base mainnet/testnet)

**Database Connection Issues**
- Verify Supabase URL and keys
- Check RLS policies
- Ensure schema is properly deployed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for AI prediction capabilities
- Supabase for database infrastructure
- Football-Data.org for match data
- Base network for crypto payments
- Vistara team for payment infrastructure

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for the football betting community**
