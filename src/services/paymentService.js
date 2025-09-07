// Payment service for handling crypto and fiat payments
import { useWalletClient } from "wagmi";
import { withPaymentInterceptor, decodeXPaymentResponse } from "x402-axios";
import axios from "axios";

const PAYMENT_API_URL = import.meta.env.VITE_PAYMENT_API_URL || 'https://payments.vistara.dev';
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const USDC_CONTRACT_ADDRESS = import.meta.env.VITE_USDC_CONTRACT_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

class PaymentService {
  constructor() {
    this.paymentApiUrl = PAYMENT_API_URL;
    this.stripeKey = STRIPE_PUBLISHABLE_KEY;
    this.usdcAddress = USDC_CONTRACT_ADDRESS;
  }

  // Crypto payment methods
  async createCryptoPayment(walletClient, amount, description = '') {
    if (!walletClient || !walletClient.account) {
      throw new Error('Wallet not connected');
    }

    try {
      const baseClient = axios.create({
        baseURL: this.paymentApiUrl,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const apiClient = withPaymentInterceptor(baseClient, walletClient);
      
      const response = await apiClient.post('/api/payment', {
        amount: `$${amount}`,
        description,
        currency: 'USDC',
        network: 'base',
      });

      const paymentResponse = response.config.headers['X-PAYMENT'];
      
      if (!paymentResponse) {
        throw new Error('Payment response is absent');
      }

      const decoded = decodeXPaymentResponse(paymentResponse);
      console.log('Payment successful:', decoded);
      
      return {
        success: true,
        transactionHash: decoded.transactionHash,
        amount: decoded.amount,
        currency: decoded.currency,
        network: decoded.network,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Crypto payment failed:', error);
      throw new Error(`Payment failed: ${error.message}`);
    }
  }

  // Fiat payment methods (Stripe)
  async createStripePayment(amount, description = '', metadata = {}) {
    if (!this.stripeKey) {
      throw new Error('Stripe not configured');
    }

    try {
      // This would typically be handled by your backend
      // For demo purposes, we'll simulate the flow
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          description,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();
      
      return {
        clientSecret,
        amount,
        currency: 'usd',
        description,
      };
    } catch (error) {
      console.error('Stripe payment creation failed:', error);
      throw new Error(`Payment setup failed: ${error.message}`);
    }
  }

  async confirmStripePayment(stripe, elements, clientSecret) {
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: window.location.origin + '/payment-success',
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Stripe payment confirmation failed:', error);
      throw new Error(`Payment confirmation failed: ${error.message}`);
    }
  }

  // Payment validation and utilities
  validatePaymentAmount(amount) {
    if (!amount || amount <= 0) {
      throw new Error('Invalid payment amount');
    }
    
    if (amount > 1000) {
      throw new Error('Payment amount too large');
    }
    
    return true;
  }

  formatPaymentAmount(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }

  // Transaction recording
  async recordTransaction(transactionData) {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...transactionData,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record transaction');
      }

      return await response.json();
    } catch (error) {
      console.error('Transaction recording failed:', error);
      // Don't throw here - payment was successful even if recording failed
      return null;
    }
  }

  // Payment status checking
  async checkPaymentStatus(transactionId, paymentMethod = 'crypto') {
    try {
      const endpoint = paymentMethod === 'crypto' 
        ? `/api/crypto-payment-status/${transactionId}`
        : `/api/stripe-payment-status/${transactionId}`;

      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }

      return await response.json();
    } catch (error) {
      console.error('Payment status check failed:', error);
      return { status: 'unknown', error: error.message };
    }
  }

  // Mock payment for development/testing
  async createMockPayment(amount, description = '') {
    console.log('Creating mock payment:', { amount, description });
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate random success/failure for testing
    const success = Math.random() > 0.1; // 90% success rate
    
    if (!success) {
      throw new Error('Mock payment failed (random failure for testing)');
    }

    return {
      success: true,
      transactionHash: 'mock_tx_' + Date.now(),
      amount,
      currency: 'USDC',
      network: 'base',
      timestamp: new Date().toISOString(),
      mock: true,
    };
  }

  // Payment method detection
  getAvailablePaymentMethods(walletConnected = false) {
    const methods = [];
    
    if (walletConnected) {
      methods.push({
        id: 'crypto',
        name: 'Crypto (USDC)',
        description: 'Pay with USDC on Base network',
        icon: 'wallet',
        fees: 'Network fees apply',
      });
    }
    
    if (this.stripeKey) {
      methods.push({
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Pay with card via Stripe',
        icon: 'credit-card',
        fees: '2.9% + $0.30',
      });
    }
    
    return methods;
  }

  // Price calculations
  calculateTotalWithFees(amount, paymentMethod = 'crypto') {
    let fees = 0;
    let total = amount;
    
    switch (paymentMethod) {
      case 'crypto':
        // Network fees are handled separately
        fees = 0;
        break;
      case 'card':
        // Stripe fees: 2.9% + $0.30
        fees = (amount * 0.029) + 0.30;
        break;
      default:
        fees = 0;
    }
    
    total = amount + fees;
    
    return {
      subtotal: amount,
      fees,
      total,
      feeDescription: this.getFeeDescription(paymentMethod),
    };
  }

  getFeeDescription(paymentMethod) {
    switch (paymentMethod) {
      case 'crypto':
        return 'Network fees paid separately';
      case 'card':
        return 'Processing fee included';
      default:
        return 'No additional fees';
    }
  }
}

export default new PaymentService();
