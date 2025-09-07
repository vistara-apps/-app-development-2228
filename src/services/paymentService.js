import { paymentClient, apiCall } from './api.js';
import { withPaymentInterceptor, decodeXPaymentResponse } from 'x402-axios';

/**
 * Payment Service for handling both crypto and fiat payments
 */
export class PaymentService {

  /**
   * Process crypto payment via Base network
   * @param {Object} walletClient - Wallet client from wagmi
   * @param {Object} paymentData - Payment information
   * @returns {Promise<Object>} Payment result
   */
  static async processCryptoPayment(walletClient, paymentData) {
    const { amount, matchId, userId, transactionType } = paymentData;
    
    if (!walletClient || !walletClient.account) {
      throw new Error('Please connect your wallet');
    }

    try {
      // Create payment client with interceptor
      const apiClient = withPaymentInterceptor(paymentClient, walletClient);
      
      // Process payment
      const response = await apiClient.post('/api/payment', {
        amount: amount,
        currency: 'USDC',
        network: 'base',
        metadata: {
          matchId,
          userId,
          transactionType
        }
      });

      const paymentResponse = response.config.headers['X-PAYMENT'];
      
      if (!paymentResponse) {
        throw new Error('Payment response is absent');
      }

      const decoded = decodeXPaymentResponse(paymentResponse);
      
      return {
        success: true,
        transactionHash: decoded.transactionHash,
        amount: decoded.amount,
        paymentMethod: 'crypto',
        network: 'base'
      };
    } catch (error) {
      console.error('Crypto payment failed:', error);
      throw new Error(`Crypto payment failed: ${error.message}`);
    }
  }

  /**
   * Process fiat payment via Stripe
   * @param {Object} paymentData - Payment information
   * @returns {Promise<Object>} Payment result
   */
  static async processFiatPayment(paymentData) {
    const { amount, matchId, userId, transactionType, customerEmail } = paymentData;
    
    try {
      // Create Stripe payment intent
      const response = await apiCall(() =>
        paymentClient.post('/api/stripe/payment-intent', {
          amount: this.convertToStripeAmount(amount),
          currency: 'usd',
          metadata: {
            matchId,
            userId,
            transactionType
          },
          customer_email: customerEmail
        })
      );

      return {
        success: true,
        clientSecret: response.client_secret,
        paymentIntentId: response.id,
        paymentMethod: 'fiat',
        amount: amount
      };
    } catch (error) {
      console.error('Fiat payment failed:', error);
      throw new Error(`Fiat payment failed: ${error.message}`);
    }
  }

  /**
   * Confirm Stripe payment
   * @param {string} paymentIntentId - Payment intent ID
   * @returns {Promise<Object>} Confirmation result
   */
  static async confirmStripePayment(paymentIntentId) {
    try {
      const response = await apiCall(() =>
        paymentClient.post('/api/stripe/confirm-payment', {
          payment_intent_id: paymentIntentId
        })
      );

      return {
        success: response.status === 'succeeded',
        transactionId: response.id,
        status: response.status
      };
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      throw new Error(`Payment confirmation failed: ${error.message}`);
    }
  }

  /**
   * Get payment history for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Payment history
   */
  static async getPaymentHistory(userId) {
    try {
      return apiCall(() =>
        paymentClient.get(`/api/payments/history/${userId}`)
      );
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      return [];
    }
  }

  /**
   * Validate payment amount and type
   * @param {string} transactionType - Type of transaction
   * @param {string} amount - Payment amount
   * @returns {Object} Validation result
   */
  static validatePayment(transactionType, amount) {
    const validTypes = {
      'match_insight': { price: '$0.50', usdAmount: 0.50 },
      'streak_analysis': { price: '$1.00', usdAmount: 1.00 }
    };

    if (!validTypes[transactionType]) {
      return {
        valid: false,
        error: 'Invalid transaction type'
      };
    }

    const expectedAmount = validTypes[transactionType].usdAmount;
    const providedAmount = parseFloat(amount.replace('$', ''));

    if (providedAmount !== expectedAmount) {
      return {
        valid: false,
        error: `Invalid amount. Expected ${validTypes[transactionType].price}`
      };
    }

    return {
      valid: true,
      amount: expectedAmount,
      displayAmount: validTypes[transactionType].price
    };
  }

  /**
   * Convert dollar amount to Stripe cents
   * @param {string} amount - Dollar amount (e.g., '$0.50')
   * @returns {number} Amount in cents
   */
  static convertToStripeAmount(amount) {
    const dollarAmount = parseFloat(amount.replace('$', ''));
    return Math.round(dollarAmount * 100);
  }

  /**
   * Get supported payment methods
   * @returns {Array} Payment methods
   */
  static getSupportedPaymentMethods() {
    return [
      {
        id: 'crypto',
        name: 'Crypto (USDC)',
        description: 'Pay with USDC on Base network',
        icon: 'wallet',
        network: 'base',
        currency: 'USDC'
      },
      {
        id: 'card',
        name: 'Credit Card',
        description: 'Pay with credit or debit card',
        icon: 'credit-card',
        processor: 'stripe',
        currencies: ['USD']
      }
    ];
  }

  /**
   * Estimate transaction fees
   * @param {string} paymentMethod - Payment method
   * @param {number} amount - Payment amount
   * @returns {Object} Fee estimation
   */
  static estimateFees(paymentMethod, amount) {
    const fees = {
      crypto: {
        networkFee: 0.001, // Base network fee in USDC
        processingFee: 0,
        total: amount + 0.001
      },
      card: {
        processingFee: Math.max(0.30, amount * 0.029), // Stripe fees
        networkFee: 0,
        total: amount + Math.max(0.30, amount * 0.029)
      }
    };

    return fees[paymentMethod] || fees.card;
  }

  /**
   * Create payment session for match insight
   * @param {Object} sessionData - Session data
   * @returns {Promise<Object>} Session result
   */
  static async createMatchInsightSession(sessionData) {
    const { userId, matchId, paymentMethod, walletClient } = sessionData;
    
    const validation = this.validatePayment('match_insight', '$0.50');
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const paymentData = {
      amount: '$0.50',
      matchId,
      userId,
      transactionType: 'match_insight'
    };

    if (paymentMethod === 'crypto') {
      return this.processCryptoPayment(walletClient, paymentData);
    } else {
      return this.processFiatPayment(paymentData);
    }
  }

  /**
   * Create payment session for streak analysis
   * @param {Object} sessionData - Session data
   * @returns {Promise<Object>} Session result
   */
  static async createStreakAnalysisSession(sessionData) {
    const { userId, matchId, paymentMethod, walletClient } = sessionData;
    
    const validation = this.validatePayment('streak_analysis', '$1.00');
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const paymentData = {
      amount: '$1.00',
      matchId,
      userId,
      transactionType: 'streak_analysis'
    };

    if (paymentMethod === 'crypto') {
      return this.processCryptoPayment(walletClient, paymentData);
    } else {
      return this.processFiatPayment(paymentData);
    }
  }

  /**
   * Handle payment webhook (for server-side processing)
   * @param {Object} webhookData - Webhook payload
   * @returns {Promise<Object>} Processing result
   */
  static async handlePaymentWebhook(webhookData) {
    try {
      const { type, data } = webhookData;
      
      switch (type) {
        case 'payment_intent.succeeded':
          return this.handleSuccessfulPayment(data.object);
        case 'payment_intent.payment_failed':
          return this.handleFailedPayment(data.object);
        default:
          console.log(`Unhandled webhook type: ${type}`);
          return { processed: false };
      }
    } catch (error) {
      console.error('Webhook processing failed:', error);
      throw error;
    }
  }

  /**
   * Handle successful payment
   * @param {Object} paymentIntent - Stripe payment intent
   * @returns {Promise<Object>} Processing result
   */
  static async handleSuccessfulPayment(paymentIntent) {
    // This would typically update the database and trigger any necessary actions
    console.log('Payment succeeded:', paymentIntent.id);
    return { processed: true, status: 'success' };
  }

  /**
   * Handle failed payment
   * @param {Object} paymentIntent - Stripe payment intent
   * @returns {Promise<Object>} Processing result
   */
  static async handleFailedPayment(paymentIntent) {
    console.log('Payment failed:', paymentIntent.id);
    return { processed: true, status: 'failed' };
  }
}

export default PaymentService;
