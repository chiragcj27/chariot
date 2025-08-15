"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { paypalService } from '@/lib/paypal';

interface SubscriptionCard {
  _id?: string;
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  button: string;
  paypalPlanId: string;
  planKey: string;
  credits: number;
}

interface SubscriptionCheckoutProps {
  plan: SubscriptionCard;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (subscriptionId: string, newCredits: number) => void;
}

export default function SubscriptionCheckout({ 
  plan, 
  isOpen, 
  onClose, 
  onSuccess 
}: SubscriptionCheckoutProps) {
  const { user, updateCredits } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'checkout' | 'processing' | 'success'>('checkout');
  const [loading] = useState(false);
  const paypalButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('checkout');
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && step === 'checkout' && paypalButtonRef.current) {
      
      // Clear previous button
      paypalButtonRef.current.innerHTML = '';
      
      // Add a small delay to prevent duplicate rendering
      const timeoutId = setTimeout(() => {
        // Render PayPal button
        paypalService.renderPayPalButton(plan.planKey, paypalButtonRef.current!)
          .then(() => {
          })
          .catch((err) => {
            console.error('❌ Error rendering PayPal button:', err);
            setError('Failed to load payment system. Please try again.');
          });
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, step, plan.planKey]);

  // Listen for PayPal subscription success
  useEffect(() => {
    const handleSubscriptionSuccess = (event: CustomEvent) => {
      if (event.detail.planKey === plan.planKey) {
        setStep('processing');
        
        // Update user credits in context
        const newCredits = (user?.credits || 0) + plan.credits;
        updateCredits(newCredits);
        
        setStep('success');
        onSuccess(event.detail.subscriptionId, newCredits);
        
        // Close modal after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    };

    window.addEventListener('paypal-subscription-success', handleSubscriptionSuccess as EventListener);
    
    return () => {
      window.removeEventListener('paypal-subscription-success', handleSubscriptionSuccess as EventListener);
    };
  }, [plan.planKey, user?.credits, plan.credits, updateCredits, onSuccess, onClose]);

  const handleClose = () => {
    if (loading) return; // Prevent closing during processing
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {step === 'checkout' && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Subscribe to {plan.title}
              </h2>
              <p className="text-gray-600">{plan.description}</p>
            </div>

            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Plan:</span>
                  <span>{plan.title}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Price:</span>
                  <span className="text-lg font-bold text-[#FA7035]">
                    {plan.price}{plan.period}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Credits:</span>
                  <span className="text-green-600 font-semibold">
                    +{plan.credits} credits
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Current Credits:</span>
                  <span className="text-blue-600 font-semibold">
                    {user?.credits || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-semibold">After Purchase:</span>
                  <span className="text-green-600 font-semibold">
                    {(user?.credits || 0) + plan.credits}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* PayPal Button Container */}
            <div className="mb-4">
              <div ref={paypalButtonRef} className="w-full"></div>
            </div>
            
            <button
              onClick={handleClose}
              disabled={loading}
              className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                🔒 Secure payment processing by PayPal
              </p>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA7035] mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Processing Subscription
            </h3>
            <p className="text-gray-600">
              Setting up your subscription and adding credits...
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Subscription Successful!
            </h3>
            <p className="text-gray-600 mb-4">
              You&apos;ve been granted {plan.credits} credits to your account.
            </p>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-green-700 text-sm">
                New credit balance: {(user?.credits || 0) + plan.credits}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 