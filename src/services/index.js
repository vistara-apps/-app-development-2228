/**
 * Service exports for BetWiseAI
 * Central export point for all services
 */

// Core services
export { default as AIService } from './aiService.js';
export { default as DatabaseService } from './databaseService.js';
export { default as FootballService } from './footballService.js';
export { default as PaymentService } from './paymentService.js';

// API utilities
export * from './api.js';

// Service integration utilities
export const ServiceStatus = {
  READY: 'ready',
  LOADING: 'loading',
  ERROR: 'error',
  OFFLINE: 'offline'
};

/**
 * Check service health and availability
 */
export const checkServiceHealth = async () => {
  const services = {
    ai: { name: 'OpenAI', status: ServiceStatus.LOADING },
    database: { name: 'Supabase', status: ServiceStatus.LOADING },
    football: { name: 'Football Data', status: ServiceStatus.LOADING },
    payment: { name: 'Payment API', status: ServiceStatus.LOADING }
  };

  // Check OpenAI
  try {
    if (import.meta.env.VITE_OPENAI_API_KEY) {
      services.ai.status = ServiceStatus.READY;
    } else {
      services.ai.status = ServiceStatus.ERROR;
      services.ai.error = 'API key not configured';
    }
  } catch (error) {
    services.ai.status = ServiceStatus.ERROR;
    services.ai.error = error.message;
  }

  // Check Supabase
  try {
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      services.database.status = ServiceStatus.READY;
    } else {
      services.database.status = ServiceStatus.ERROR;
      services.database.error = 'Database credentials not configured';
    }
  } catch (error) {
    services.database.status = ServiceStatus.ERROR;
    services.database.error = error.message;
  }

  // Check Football API
  try {
    if (import.meta.env.VITE_FOOTBALL_API_KEY) {
      services.football.status = ServiceStatus.READY;
    } else {
      services.football.status = ServiceStatus.ERROR;
      services.football.error = 'Football API key not configured';
    }
  } catch (error) {
    services.football.status = ServiceStatus.ERROR;
    services.football.error = error.message;
  }

  // Check Payment API
  try {
    if (import.meta.env.VITE_PAYMENT_API_URL) {
      services.payment.status = ServiceStatus.READY;
    } else {
      services.payment.status = ServiceStatus.ERROR;
      services.payment.error = 'Payment API URL not configured';
    }
  } catch (error) {
    services.payment.status = ServiceStatus.ERROR;
    services.payment.error = error.message;
  }

  return services;
};

/**
 * Initialize all services
 */
export const initializeServices = async () => {
  console.log('🚀 Initializing BetWiseAI services...');
  
  const health = await checkServiceHealth();
  
  // Log service status
  Object.entries(health).forEach(([key, service]) => {
    const emoji = service.status === ServiceStatus.READY ? '✅' : '❌';
    console.log(`${emoji} ${service.name}: ${service.status}`);
    if (service.error) {
      console.warn(`   Error: ${service.error}`);
    }
  });

  const readyServices = Object.values(health).filter(s => s.status === ServiceStatus.READY).length;
  const totalServices = Object.keys(health).length;
  
  console.log(`📊 Services ready: ${readyServices}/${totalServices}`);
  
  if (readyServices === totalServices) {
    console.log('🎉 All services initialized successfully!');
  } else {
    console.warn('⚠️ Some services are not available. App will run with limited functionality.');
  }

  return health;
};

/**
 * Service configuration validation
 */
export const validateConfiguration = () => {
  const requiredEnvVars = [
    'VITE_OPENAI_API_KEY',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_FOOTBALL_API_KEY',
    'VITE_PAYMENT_API_URL'
  ];

  const missing = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    return false;
  }

  console.log('✅ All required environment variables are configured');
  return true;
};

// Export service instances for direct use
export const services = {
  ai: AIService,
  database: DatabaseService,
  football: FootballService,
  payment: PaymentService
};
