import React from 'react';
import { CreditCard, Wallet } from 'lucide-react';
import { usePaymentContext } from '../hooks/usePaymentContext';

const PaymentButton = ({ amount, description, onSuccess, loading, setLoading }) => {
  const { createSession } = usePaymentContext();

  const handlePayment = async () => {
    try {
      setLoading(true);
      await createSession();
      onSuccess();
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handlePayment}
        disabled={loading}
        className="btn-primary flex items-center space-x-2 w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Wallet className="w-5 h-5" />
        <span>{loading ? 'Processing...' : `Pay ${amount} with Crypto`}</span>
      </button>
      
      <div className="text-center">
        <p className="text-xs text-dark-textSecondary">
          Secure payment via Base network • {description}
        </p>
      </div>
    </div>
  );
};

export default PaymentButton;