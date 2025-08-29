'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, FileText, Calendar, CreditCard, ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { paypalService } from '@/lib/paypal'

interface OrderItem {
  productId: string;
  productName: string;
  productSlug: string;
  quantity: number;
  unitPrice: number;
  unitCreditsCost: number;
  totalPrice: number;
  totalCreditsCost: number;
  imageUrl?: string;
}

interface CheckoutInfo {
  orderItems: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  userCredits: number;
  paymentBreakdown: {
    creditsUsed: number;
    creditsAmount: number;
    paypalAmount: number;
    totalAmount: number;
  };
  canPayWithCredits: boolean;
  requiresPayPalPayment: boolean;
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items: cartItems, clearCart, removeItem } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'credits' | 'paypal'>('paypal');
  const [checkoutInfo, setCheckoutInfo] = useState<CheckoutInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showCreditConfirmation, setShowCreditConfirmation] = useState(false);
  const [showPayPalPayment, setShowPayPalPayment] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<{ _id: string; orderNumber: string; total: number; paypalAmount?: number; items: unknown[] } | null>(null);
  const paypalButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError('Please log in to continue with checkout');
      return;
    }

    if (cartItems.length === 0) {
      setLoading(false);
      setError('Your cart is empty. Please add items before checkout.');
      // Clear any previous checkout info to avoid rendering stale items
      setCheckoutInfo(null);
      return;
    }

    fetchCheckoutInfo();
  }, [user, cartItems]);

  useEffect(() => {
    // Listen for PayPal payment success
    const handlePayPalPaymentSuccess = (event: CustomEvent) => {
      const { orderId, paymentId, result } = event.detail;
      console.log('PayPal payment successful:', { orderId, paymentId, result });
      
      // Clear cart and redirect to order confirmation
      clearCart();
      window.location.href = `/order-confirmation?orderId=${orderId}`;
    };

    window.addEventListener('paypal-payment-success', handlePayPalPaymentSuccess as EventListener);

    return () => {
      window.removeEventListener('paypal-payment-success', handlePayPalPaymentSuccess as EventListener);
    };
  }, [clearCart]);

  const fetchCheckoutInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/orders/checkout/info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ items: cartItems }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch checkout info' }));
        throw new Error(errorData.message || 'Failed to load checkout information');
      }

      const data = await response.json();
      setCheckoutInfo(data);
    } catch (err) {
      console.error('Error fetching checkout info:', err);
      setError(err instanceof Error ? err.message : 'Failed to load checkout information');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodChange = (method: 'credits' | 'paypal') => {
    setPaymentMethod(method);
    setShowPaymentMethods(false);
  };

  const handleCreateOrder = async () => {
    // If credits are selected, show confirmation for mixed payment
    if (paymentMethod === 'credits' && checkoutInfo) {
      const availableCredits = checkoutInfo.userCredits || 0;
      
      if (availableCredits > 0) {
        // Show confirmation for credit usage
        setShowCreditConfirmation(true);
        return;
      } else {
        // No credits available, switch to PayPal
        setPaymentMethod('paypal');
      }
    }

    await processOrder();
  };

  const processOrder = async () => {
    try {
      setProcessing(true);
      setError(null);
      setShowCreditConfirmation(false);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/orders/checkout/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cartItems,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create order' }));
        throw new Error(errorData.message || 'Failed to create order');
      }

      const orderData = await response.json();
      
      if (orderData.requiresPayPalPayment) {
        // Show PayPal payment modal
        setCurrentOrder({
          ...orderData.order,
          paypalAmount: orderData.paymentBreakdown.paypalAmount
        });
        setShowPayPalPayment(true);
        
        // Render PayPal button after a short delay to ensure modal is rendered
        setTimeout(() => {
          if (paypalButtonRef.current && orderData.paymentBreakdown.paypalAmount > 0) {
            paypalService.renderPayPalPaymentButton({
              orderId: orderData.order._id,
              amount: orderData.paymentBreakdown.paypalAmount,
              currency: 'USD',
              description: `Order ${orderData.order.orderNumber} - ${orderData.order.items.length} items`
            }, paypalButtonRef.current);
          }
        }, 100);
      } else {
        clearCart();
        window.location.href = `/order-confirmation?orderId=${orderData.order._id}`;
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
    // The useEffect above will automatically re-fetch checkout info when cartItems changes
  };

  const getPaymentMethodDisplay = () => {
    switch (paymentMethod) {
      case 'credits':
        const availableCredits = checkoutInfo?.userCredits || 0;
        const totalAmount = checkoutInfo?.total || 0;
        if (availableCredits >= totalAmount) {
          return `Credits (${availableCredits} available)`;
        } else {
          return `Credits + PayPal (${availableCredits} credits + $${totalAmount - availableCredits} PayPal)`;
        }
      case 'paypal':
        return 'PayPal / Credit Card';
      default:
        return 'PayPal / Credit Card';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout information...</p>
        </div>
      </div>
    );
  }

  if (error && !checkoutInfo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-2">
            <Button onClick={fetchCheckoutInfo} variant="outline" className="w-full">
              Try Again
            </Button>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Back To Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!checkoutInfo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No checkout information available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Link>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-2" />
              Order number
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <div className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
              Payment Pending
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Payment Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Total Payment</span>
              <span className="font-semibold text-lg">${checkoutInfo.total}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Payment Method</span>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-gray-600" />
                <span className="text-gray-900">{getPaymentMethodDisplay()}</span>
                <button
                  onClick={() => setShowPaymentMethods(!showPaymentMethods)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showPaymentMethods ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Payment Method Dropdown */}
            {showPaymentMethods && (
              <div className="border border-gray-200 rounded-lg p-3 space-y-2">
                <button
                  onClick={() => handlePaymentMethodChange('paypal')}
                  className={`w-full text-left p-2 rounded ${paymentMethod === 'paypal' ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4" />
                    <span>PayPal / Credit Card</span>
                  </div>
                </button>
                
                <button
                  onClick={() => handlePaymentMethodChange('credits')}
                  className={`w-full text-left p-2 rounded ${paymentMethod === 'credits' ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">💰</span>
                    <span>Credits ({checkoutInfo.userCredits || 0} available)</span>
                  </div>
                </button>


              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500 rounded-lg"
                onClick={handleCreateOrder}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Continue with Payment'}
              </Button>
            </div>
          </div>
        </div>

        {/* Order Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order</h2>
          
          <div className="space-y-4">
            {checkoutInfo.orderItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <Image 
                      src={item.imageUrl} 
                      alt={item.productName}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      onError={() => {
                        // Fallback handled by Next.js Image component
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                  <p className="text-gray-600">Product Category</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">${item.totalPrice}</span>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.productId)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove item"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Subtotal</span>
              <span className="text-gray-900">${checkoutInfo.subtotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Tax</span>
              <span className="text-gray-900">${checkoutInfo.tax}</span>
            </div>
            <div className="border-t pt-3 flex items-center justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-semibold text-lg text-gray-900">${checkoutInfo.total}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center">
          <Link href="/">
            <Button 
              variant="outline" 
              className="border-orange-500 text-orange-500 hover:bg-orange-50 rounded-lg"
            >
              Back To Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Credit Confirmation Dialog */}
      {showCreditConfirmation && checkoutInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Credit Payment</h3>
            
            {checkoutInfo.userCredits >= checkoutInfo.total ? (
              // Full credit payment
              <>
                <p className="text-gray-600 mb-4">
                  You are about to use <strong>{checkoutInfo.total} credits</strong> from your account to complete this purchase.
                </p>
                <p className="text-gray-600 mb-6">
                  Your remaining credits after this purchase: <strong>{checkoutInfo.userCredits - checkoutInfo.total} credits</strong>
                </p>
              </>
            ) : (
              // Mixed payment (credits + PayPal)
              <>
                <p className="text-gray-600 mb-4">
                  You will use <strong>{checkoutInfo.userCredits} credits</strong> and pay the remaining <strong>${checkoutInfo.total - checkoutInfo.userCredits}</strong> via PayPal.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Total Amount:</span>
                    <span>${checkoutInfo.total}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Credits Used:</span>
                    <span>-{checkoutInfo.userCredits}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t pt-2 mt-2">
                    <span>PayPal Payment:</span>
                    <span>${checkoutInfo.total - checkoutInfo.userCredits}</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">
                  Your remaining credits after this purchase: <strong>0 credits</strong>
                </p>
              </>
            )}
            
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowCreditConfirmation(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={processOrder}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Confirm Payment'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PayPal Payment Dialog */}
      {showPayPalPayment && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Payment</h3>
            <p className="text-gray-600 mb-4">
              Order: <strong>{currentOrder.orderNumber}</strong>
            </p>
            <p className="text-gray-600 mb-6">
              PayPal Amount: <strong>${currentOrder.paypalAmount || currentOrder.total}</strong>
            </p>
            
            {/* PayPal Button Container */}
            <div ref={paypalButtonRef} className="mb-4"></div>
            
            <div className="flex justify-center">
              <Button
                onClick={() => setShowPayPalPayment(false)}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
