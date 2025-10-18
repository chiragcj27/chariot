'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Calendar, CreditCard, ChevronDown, X, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { paypalService } from '@/lib/paypal'
import { toast } from 'sonner'

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
  category?: string;
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
  const { items: cartItems, buyNowItem, clearCart, removeItem, updateQuantity, clearBuyNowItem, updateBuyNowItemQuantity } = useCart();
  const router = useRouter();
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

  const fetchCheckoutInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');

      if (!token) {
        router.replace('/login?redirect=/checkout');
        return;
      }

      // Use buyNowItem if it exists, otherwise use cart items
      const itemsToCheckout = buyNowItem ? [buyNowItem] : cartItems;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/orders/checkout/info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ items: itemsToCheckout }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch checkout info' }));
        throw new Error(errorData.message || 'Failed to load checkout information');
      }

      const data = await response.json();
      console.log('Checkout info:', data);
      setCheckoutInfo(data);
    } catch (err) {
      console.error('Error fetching checkout info:', err);
      setError(err instanceof Error ? err.message : 'Failed to load checkout information');
    } finally {
      setLoading(false);
    }
  }, [cartItems, buyNowItem, router]);
  // Load checkout info when authenticated and has items to checkout
  useEffect(() => {
    if (!user) {
      // Not logged in: allow viewing cart, don't fetch checkout info
      setLoading(false);
      setCheckoutInfo(null);
      return;
    }

    // Check if we have items to checkout (either buyNowItem or cart items)
    const hasItemsToCheckout = buyNowItem || cartItems.length > 0;
    
    if (!hasItemsToCheckout) {
      setLoading(false);
      // Clear any previous checkout info to avoid rendering stale items
      setCheckoutInfo(null);
      return;
    }

    fetchCheckoutInfo();
  }, [user, cartItems.length, buyNowItem, fetchCheckoutInfo]);

  useEffect(() => {
    // Listen for PayPal payment success
    const handlePayPalPaymentSuccess = (event: CustomEvent) => {
      const { orderId, paymentId, result } = event.detail;
      console.log('PayPal payment successful:', { orderId, paymentId, result });

      // Clear cart/buyNowItem and redirect to order confirmation
      if (buyNowItem) {
        clearBuyNowItem();
      } else {
        clearCart();
      }
      window.location.href = `/order-confirmation?orderId=${orderId}`;
    };

    // Listen for PayPal payment cancellation
    const handlePayPalPaymentCancelled = (event: CustomEvent) => {
      const { orderId, reason } = event.detail;
      console.log('PayPal payment cancelled:', { orderId, reason });
      
      // Close PayPal payment modal
      setShowPayPalPayment(false);
      setCurrentOrder(null);
      
      // Show user-friendly message
      toast.info('Payment was cancelled. You can try again anytime.');
    };

    // Listen for PayPal payment errors
    const handlePayPalPaymentError = (event: CustomEvent) => {
      const { orderId, error } = event.detail;
      console.error('PayPal payment error:', { orderId, error });
      
      // Close PayPal payment modal
      setShowPayPalPayment(false);
      setCurrentOrder(null);
      
      // Show user-friendly error message
      toast.error('Payment failed. Please try again or contact support if the issue persists.');
    };

    window.addEventListener('paypal-payment-success', handlePayPalPaymentSuccess as EventListener);
    window.addEventListener('paypal-payment-cancelled', handlePayPalPaymentCancelled as EventListener);
    window.addEventListener('paypal-payment-error', handlePayPalPaymentError as EventListener);

    return () => {
      window.removeEventListener('paypal-payment-success', handlePayPalPaymentSuccess as EventListener);
      window.removeEventListener('paypal-payment-cancelled', handlePayPalPaymentCancelled as EventListener);
      window.removeEventListener('paypal-payment-error', handlePayPalPaymentError as EventListener);
    };
  }, [clearCart, clearBuyNowItem, buyNowItem]);



  const handlePaymentMethodChange = (method: 'credits' | 'paypal') => {
    setPaymentMethod(method);
    setShowPaymentMethods(false);
  };

  const handleCreateOrder = async () => {
    if (!user) {
      // Cart is already persisted via CartContext -> localStorage
      router.replace('/login?redirect=/checkout');
      return;
    }
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
          items: buyNowItem ? [buyNowItem] : cartItems,
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
        // Clear the appropriate state after successful order
        if (buyNowItem) {
          clearBuyNowItem();
        } else {
          clearCart();
        }
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
    if (buyNowItem && buyNowItem.productId === productId) {
      clearBuyNowItem();
    } else {
      removeItem(productId);
    }
    // The useEffect above will automatically re-fetch checkout info when cartItems changes
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      if (buyNowItem && buyNowItem.productId === productId) {
        clearBuyNowItem();
      } else {
        removeItem(productId);
      }
    } else {
      if (buyNowItem && buyNowItem.productId === productId) {
        // Update buy now item quantity
        updateBuyNowItemQuantity(newQuantity);
      } else {
        updateQuantity(productId, newQuantity);
      }
    }
    // The useEffect above will automatically re-fetch checkout info when cartItems changes
  };

  const incrementQuantity = (productId: string, currentQuantity: number) => {
    handleQuantityChange(productId, currentQuantity + 1);
  };

  const decrementQuantity = (productId: string, currentQuantity: number) => {
    handleQuantityChange(productId, currentQuantity - 1);
  };

  const getPaymentMethodDisplay = () => {
    switch (paymentMethod) {
      case 'credits':
        const availableCredits = checkoutInfo?.userCredits || 0;
        const totalAmount = checkoutInfo?.total || 0;
        if (availableCredits >= totalAmount) {
          return `Credits (${availableCredits.toFixed(2)} available)`;
        } else {
          return `${availableCredits.toFixed(2)} Credits + $${(totalAmount - availableCredits).toFixed(2)}`;
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

  // Gracefully handle empty cart/buy now state
  if (!buyNowItem && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-gray-700 mb-2">Your cart is empty.</p>
          <p className="text-gray-500 mb-6">Add items to proceed to checkout.</p>
          <div className="space-y-2">
            <Link href="/">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error && user && !checkoutInfo) {
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

  // Get items for display and calculations
  const itemsForCalculation = buyNowItem ? [buyNowItem] : cartItems;
  const fallbackTotalPrice = itemsForCalculation.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  const subtotalForTax = checkoutInfo?.subtotal ?? fallbackTotalPrice;
  const calculatedTax = checkoutInfo?.tax ?? 0;
  const totalWithTax = subtotalForTax + calculatedTax;

  const displayTotal = checkoutInfo?.total ?? totalWithTax;
  const displaySubtotal = checkoutInfo?.subtotal ?? fallbackTotalPrice;
  const displayTax = checkoutInfo?.tax ?? calculatedTax;
  const itemsToRender = checkoutInfo?.orderItems ?? itemsForCalculation.map(ci => ({
    productId: ci.productId,
    productName: ci.productName,
    productSlug: ci.productSlug,
    quantity: ci.quantity,
    unitPrice: ci.price,
    unitCreditsCost: ci.creditsCost,
    totalPrice: ci.price * ci.quantity,
    totalCreditsCost: ci.creditsCost * ci.quantity,
    imageUrl: ci.imageUrl,
    category: ci.category,
  }));

  return (
    <div className="min-h-screen bg-white">
  

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Payment Section */}
        <div className="border-b border-gray-200 py-2">
          <div className="flex flex-row items-center justify-between gap-3">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 w-max">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Link>

            <div className="flex items-center flex-wrap gap-4 sm:gap-6">
              
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div className="px-3 py-1 bg-black text-white rounded-lg text-xs sm:text-sm font-medium">
                Payment Pending
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-400 mb-8 lg:mb-12">
          <div className="text-base sm:text-lg lg:text-xl text-gray-900 px-4 sm:px-6 py-3 sm:py-4">Payment</div>
          <span className="block w-full h-px bg-gray-400"></span>
          <div className="px-4 sm:px-6 py-4 sm:py-6">
            {/* Mobile Layout */}
            <div className="block lg:hidden space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 text-sm sm:text-base">Total Payment</span>
                <span className="font-semibold text-lg sm:text-xl">${displayTotal}</span>
              </div>
              
              <div className="space-y-3">
                <span className="text-gray-700 text-sm sm:text-base block">Payment Method</span>
                <div className="flex items-center space-x-2 relative">
                  <CreditCard className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  <span className="text-gray-900 text-sm sm:text-base">{getPaymentMethodDisplay()}</span>
                  <button
                    type="button"
                    onClick={() => setShowPaymentMethods(!showPaymentMethods)}
                    className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${showPaymentMethods ? 'rotate-180' : ''}`} />
                  </button>
                  {/* Payment Method Dropdown */}
                  {showPaymentMethods && (
                    <div className="absolute right-0 top-full mt-2 w-full sm:w-72 bg-white border border-gray-200 rounded-lg p-2 shadow-lg z-20">
                      <button
                        type="button"
                        onClick={() => handlePaymentMethodChange('paypal')}
                        className={`w-full text-left p-3 rounded text-sm sm:text-base ${paymentMethod === 'paypal' ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">PayPal / Credit Card</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePaymentMethodChange('credits')}
                        className={`w-full text-left p-3 rounded text-sm sm:text-base ${paymentMethod === 'credits' ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600 flex-shrink-0">💰</span>
                          <span className="truncate">Credits ({(checkoutInfo?.userCredits || 0).toFixed(2)} available)</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                className="w-full bg-white text-gray-700 border-2 border-[#FCA17A] py-3 sm:py-4 rounded-xl transition-colors hover:bg-[#FCA17A]/70 focus:outline-none focus:ring-2 focus:ring-[#FCA17A]/40 text-sm sm:text-base font-medium"
                onClick={handleCreateOrder}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Continue with Payment'}
              </Button>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:grid lg:grid-cols-3 lg:items-start lg:gap-6">
              <span className="text-gray-700">Total Payment</span>
              <span className="font-semibold text-lg xl:text-xl">${displayTotal}</span>
              <div className="row-span-2 self-center justify-self-end">
                <Button
                  className="bg-white text-gray-700 border-2 border-[#FCA17A] px-6 py-3 rounded-md transition-colors hover:bg-[#FCA17A]/70 focus:outline-none focus:ring-2 focus:ring-[#FCA17A]/40 whitespace-nowrap"
                  onClick={handleCreateOrder}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Continue with Payment'}
                </Button>
              </div>

              <span className="text-gray-700">Payment Method</span>
              <div className="flex items-center space-x-2 relative">
                <CreditCard className="w-4 h-4 text-gray-600" />
                <span className="text-gray-900 text-base">{getPaymentMethodDisplay()}</span>
                <button
                  type="button"
                  onClick={() => setShowPaymentMethods(!showPaymentMethods)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showPaymentMethods ? 'rotate-180' : ''}`} />
                </button>
                {/* Payment Method Dropdown */}
                {showPaymentMethods && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg p-2 shadow-lg z-20">
                    <button
                      type="button"
                      onClick={() => handlePaymentMethodChange('paypal')}
                      className={`w-full text-left p-2 rounded ${paymentMethod === 'paypal' ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4" />
                        <span>PayPal / Credit Card</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePaymentMethodChange('credits')}
                      className={`w-full text-left p-2 rounded ${paymentMethod === 'credits' ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">💰</span>
                        <span>Credits ({(checkoutInfo?.userCredits || 0).toFixed(2)} available)</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Section */}
        <div className="bg-white rounded-lg border border-gray-400 mb-8 lg:mb-12">
          <div className="text-base sm:text-lg lg:text-xl text-gray-900 px-4 sm:px-6 py-3 sm:py-4">Order</div>
          <span className="block w-full h-px bg-gray-400"></span>

          <div className="max-h-96 lg:max-h-[28rem] overflow-y-auto">
            <div className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              {itemsToRender.map((item, index) => (
                <div key={index} className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-4 first:pt-0 border-b border-gray-100 last:border-b-0 pb-3 sm:pb-4 last:pb-0">
                  {/* Product Image */}
                  <div className="w-28 h-28 sm:w-38 sm:h-38 lg:w-46 lg:h-46 bg-gray-200 flex-shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        width={640}
                        height={640}
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
                  
                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg truncate pr-2">{item.productName}</h3>
                    {item.category && (
                      <p className="text-gray-600 text-xs sm:text-sm mt-1">{item.category}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs sm:text-sm text-gray-500">Qty:</span>
                      <div className="flex items-center gap-1 border border-gray-300 rounded-md">
                        <button
                          type="button"
                          onClick={() => decrementQuantity(item.productId, item.quantity)}
                          className="p-1 hover:bg-gray-100 transition-colors rounded-l-md"
                          disabled={processing}
                        >
                          <Minus className="w-3 h-3 text-gray-600" />
                        </button>
                        <span className="px-2 py-1 text-xs sm:text-sm font-medium min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => incrementQuantity(item.productId, item.quantity)}
                          className="p-1 hover:bg-gray-100 transition-colors rounded-r-md"
                          disabled={processing}
                        >
                          <Plus className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price and Remove Button */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 flex-shrink-0">
                    <div className="text-right">
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">${item.totalPrice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.productId)}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Remove item"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-lg border border-gray-400 overflow-hidden mb-6 sm:mb-8">
          <div className="divide-y divide-gray-400">
            {displayTax > 0 && (
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
                <span className="text-gray-700 text-sm sm:text-base">Subtotal</span>
                <span className="text-gray-900 text-sm sm:text-base font-medium">${displaySubtotal}</span>
              </div>
            )}
            {displayTax > 0 && (
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
                <span className="text-gray-700 text-sm sm:text-base">Tax</span>
                <span className="text-gray-900 text-sm sm:text-base font-medium">${displayTax}</span>
              </div>
            )}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 bg-gray-50">
              <span className="font-semibold text-gray-900 text-base sm:text-lg">Total</span>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="font-bold text-lg sm:text-xl lg:text-2xl text-gray-900">${displayTotal}</span>
                {displayTax == 0 && (
                  <div className="text-gray-500 text-xs sm:text-sm">+ taxes</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-center sm:justify-start gap-3 sm:gap-4">
          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="border-2 border-sunrise bg-white text-black hover:bg-sunrise rounded-lg w-full sm:w-auto px-6 py-2 text-sm sm:text-base"
            >
              Back To Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Credit Confirmation Dialog */}
      {showCreditConfirmation && checkoutInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Confirm Credit Payment</h3>

            {checkoutInfo.userCredits >= checkoutInfo.total ? (
              // Full credit payment
              <>
                <p className="text-gray-600 mb-4">
                  You are about to use <strong>{checkoutInfo.total.toFixed(2)} credits</strong> from your account to complete this purchase.
                </p>
                <p className="text-gray-600 mb-6">
                  Your remaining credits after this purchase: <strong>{(checkoutInfo.userCredits - checkoutInfo.total).toFixed(2)} credits</strong>
                </p>
              </>
            ) : (
              // Mixed payment (credits + PayPal)
              <>
                <p className="text-gray-600 mb-4">
                  You will use <strong>{checkoutInfo.userCredits.toFixed(2)} credits</strong> and pay the remaining <strong>${(checkoutInfo.total - checkoutInfo.userCredits).toFixed(2)}</strong> via PayPal.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Total Amount:</span>
                    <span>${checkoutInfo.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Credits Used:</span>
                    <span>-{checkoutInfo.userCredits.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t pt-2 mt-2">
                    <span>PayPal Payment:</span>
                    <span>${(checkoutInfo.total - checkoutInfo.userCredits).toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">
                  Your remaining credits after this purchase: <strong>0.00 credits</strong>
                </p>
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3 sm:gap-0">
              <Button
                onClick={() => setShowCreditConfirmation(false)}
                variant="outline"
                className="flex-1 py-2 px-6 text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button
                onClick={processOrder}
                className="flex-1 border-2 border-sunrise bg-white text-black hover:bg-sunrise py-2 px-6 text-sm sm:text-base"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Complete Payment</h3>
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
                className="w-full py-2 px-6 text-sm sm:text-base"
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
