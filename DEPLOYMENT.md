# BetWiseAI Deployment Guide

This guide covers the complete deployment process for BetWiseAI, from development to production.

## 🚀 Pre-Deployment Checklist

### Environment Setup
- [ ] All API keys configured in `.env`
- [ ] Supabase database schema deployed
- [ ] OpenAI API key with sufficient credits
- [ ] Football-Data.org API key active
- [ ] Stripe account configured (if using fiat payments)
- [ ] Base network wallet for testing

### Code Quality
- [ ] All tests passing
- [ ] No console errors in development
- [ ] Payment flows tested
- [ ] AI predictions working
- [ ] Database connections verified

### Security
- [ ] Environment variables secured
- [ ] API keys not exposed in client code
- [ ] Supabase RLS policies active
- [ ] Payment webhooks secured

## 🏗 Production Build

### 1. Build the Application

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build
```

### 2. Verify Build

```bash
# Preview production build locally
npm run preview
```

Test all features in the preview:
- Wallet connection
- Match loading
- AI predictions
- Payment flows
- Database operations

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

#### Quick Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Manual Setup
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy

#### Environment Variables for Vercel
```
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
VITE_FOOTBALL_API_KEY=your_football_api_key
VITE_FOOTBALL_API_URL=https://api.football-data.org/v4
VITE_PAYMENT_API_URL=https://payments.vistara.dev
VITE_USDC_CONTRACT_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
VITE_APP_NAME=BetWiseAI
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
```

### Option 2: Netlify

#### Deploy via Git
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables
5. Deploy

#### Deploy via CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### Option 3: Custom Server

#### Using Docker
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
```

```bash
# Build and run
docker build -t betwise-ai .
docker run -p 3000:3000 betwise-ai
```

## 🗄 Database Deployment

### Supabase Production Setup

1. **Create Production Project**
   ```bash
   # Create new Supabase project for production
   # Use the Supabase dashboard
   ```

2. **Deploy Schema**
   ```sql
   -- Copy and execute database/schema.sql in Supabase SQL Editor
   ```

3. **Configure RLS Policies**
   ```sql
   -- Ensure all RLS policies are active
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
   ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
   ```

4. **Set Environment Variables**
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Database Migration Checklist
- [ ] Schema deployed successfully
- [ ] RLS policies active
- [ ] Sample data inserted (optional)
- [ ] Database functions working
- [ ] Indexes created for performance

## 🔐 Security Configuration

### API Key Management
- Use environment variables for all API keys
- Never commit API keys to version control
- Rotate keys regularly
- Monitor API usage and quotas

### Supabase Security
```sql
-- Verify RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check table permissions
SELECT table_name, privilege_type, grantee 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public';
```

### Payment Security
- Verify webhook signatures
- Use HTTPS for all payment endpoints
- Implement rate limiting
- Monitor for suspicious transactions

## 📊 Monitoring & Analytics

### Application Monitoring
```javascript
// Add to main.jsx for production monitoring
if (import.meta.env.VITE_ENVIRONMENT === 'production') {
  // Initialize error tracking (e.g., Sentry)
  // Initialize analytics (e.g., Google Analytics)
}
```

### Database Monitoring
- Monitor query performance
- Set up alerts for high error rates
- Track user growth and engagement
- Monitor payment success rates

### API Monitoring
- Track API response times
- Monitor rate limits
- Set up alerts for service outages
- Track AI prediction accuracy

## 🚀 Post-Deployment Steps

### 1. Smoke Testing
Test critical paths in production:
- [ ] Homepage loads correctly
- [ ] Wallet connection works
- [ ] Matches display properly
- [ ] AI predictions generate
- [ ] Payments process successfully
- [ ] Database operations work

### 2. Performance Optimization
```bash
# Analyze bundle size
npm run build -- --analyze

# Check Core Web Vitals
# Use Lighthouse or PageSpeed Insights
```

### 3. SEO & Meta Tags
Update `index.html` with production meta tags:
```html
<meta name="description" content="BetWiseAI - AI-powered football betting insights">
<meta property="og:title" content="BetWiseAI">
<meta property="og:description" content="Smarter football bets with AI insights">
<meta property="og:image" content="/og-image.png">
```

### 4. Domain Configuration
- Set up custom domain
- Configure SSL certificate
- Set up CDN (if needed)
- Configure DNS records

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          VITE_OPENAI_API_KEY: ${{ secrets.VITE_OPENAI_API_KEY }}
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          # Add other environment variables
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🐛 Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check
```

#### Environment Variable Issues
```bash
# Verify environment variables are set
echo $VITE_OPENAI_API_KEY
echo $VITE_SUPABASE_URL

# Check in browser console
console.log(import.meta.env.VITE_OPENAI_API_KEY ? 'Set' : 'Not set');
```

#### Database Connection Issues
```sql
-- Test database connection
SELECT NOW();

-- Check RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

#### Payment Issues
- Verify API keys are correct
- Check network configuration (mainnet vs testnet)
- Verify webhook endpoints
- Check CORS settings

### Performance Issues
- Enable gzip compression
- Optimize images and assets
- Use CDN for static assets
- Implement caching strategies

## 📈 Scaling Considerations

### Database Scaling
- Monitor connection pool usage
- Implement read replicas if needed
- Optimize queries with indexes
- Consider connection pooling

### API Rate Limiting
- Implement client-side rate limiting
- Cache API responses
- Use request queuing for AI predictions
- Monitor API quotas

### Frontend Optimization
- Implement code splitting
- Use lazy loading for components
- Optimize bundle size
- Enable service worker caching

## 🔄 Maintenance

### Regular Tasks
- [ ] Monitor error rates
- [ ] Update dependencies
- [ ] Rotate API keys
- [ ] Backup database
- [ ] Review security logs
- [ ] Update documentation

### Monthly Reviews
- [ ] Analyze user metrics
- [ ] Review payment success rates
- [ ] Check AI prediction accuracy
- [ ] Update match data sources
- [ ] Review and optimize costs

---

## 🆘 Support

For deployment issues:
1. Check the troubleshooting section above
2. Review application logs
3. Check service status pages
4. Contact the development team

**Remember**: Always test thoroughly in a staging environment before deploying to production!
