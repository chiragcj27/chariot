'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import AccountLayout from '@/components/AccountLayout'
import { paypalService } from '@/lib/paypal'
import { Button } from '@/components/ui/button'
import { Clock, XCircle, CreditCard, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCompletedOrders, useAllOrders, type Order } from '@/hooks/useOrders'


interface PendingOrder extends Order {
  timeRemaining: number; // seconds remaining
  isExpired: boolean;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [showPayPalPayment, setShowPayPalPayment] = useState(false);
  const [currentPendingOrder, setCurrentPendingOrder] = useState<PendingOrder | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);
  const paypalButtonRef = useRef<HTMLDivElement>(null);
  const countdownRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const handleAutoCancelOrderRef = useRef<((orderId: string) => Promise<void>) | null>(null);
  const [currentPageState, setCurrentPageState] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const DESKTOP_PAGE_SIZE = 10;
  const MOBILE_PAGE_SIZE = 5;

  const PAYMENT_TIMEOUT_MINUTES = 5;
  const PAYMENT_TIMEOUT_SECONDS = PAYMENT_TIMEOUT_MINUTES * 60;

  // Use SWR hooks to fetch orders
  const { orders, isLoading: ordersLoading, error: ordersError, mutate: mutateOrders } = useCompletedOrders();
  const { orders: allOrders, isLoading: allOrdersLoading, error: allOrdersError, mutate: mutateAllOrders } = useAllOrders();

  const handleAutoCancelOrder = useCallback(async (orderId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/orders/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Remove from pending orders and refresh
        setPendingOrders(prev => prev.filter(order => order._id !== orderId));
        mutateOrders();
        mutateAllOrders(); // Refresh to update completed orders if any
      }
    } catch (error) {
      console.error('Error auto-cancelling order:', error);
    }
  }, [mutateOrders, mutateAllOrders]);

  // Update the ref whenever handleAutoCancelOrder changes
  useEffect(() => {
    handleAutoCancelOrderRef.current = handleAutoCancelOrder;
  }, [handleAutoCancelOrder]);

  const startCountdownTimer = useCallback((orderId: string) => {
    // Clear existing timer if any
    if (countdownRefs.current.has(orderId)) {
      clearInterval(countdownRefs.current.get(orderId)!);
    }

    const timer = setInterval(() => {
      setPendingOrders(prev => {
        const updated = prev.map(order => {
          if (order._id === orderId) {
            const newTimeRemaining = order.timeRemaining - 1;
            const isExpired = newTimeRemaining <= 0;
            
            if (isExpired) {
              // Auto-cancel expired order using ref
              if (handleAutoCancelOrderRef.current) {
                handleAutoCancelOrderRef.current(orderId);
              }
              clearInterval(timer);
              countdownRefs.current.delete(orderId);
            }
            
            return {
              ...order,
              timeRemaining: newTimeRemaining,
              isExpired
            };
          }
          return order;
        });
        return updated;
      });
    }, 1000);

    countdownRefs.current.set(orderId, timer);
  }, []);

  // Memoize processed pending orders to prevent unnecessary recalculations
  const processedPendingOrders = useMemo(() => {
    if (!allOrders) return [];

    // Process pending orders and filter out already expired ones
    const pending = allOrders.filter((order: Order) => 
      order.status === 'pending' && order.paymentStatus === 'pending'
    );

    return pending.map((order: Order): PendingOrder => {
      const createdAt = new Date(order.createdAt).getTime();
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - createdAt) / 1000);
      const timeRemaining = Math.max(0, PAYMENT_TIMEOUT_SECONDS - elapsedSeconds);
      const isExpired = timeRemaining <= 0;

      return {
        ...order,
        timeRemaining,
        isExpired
      };
    });
  }, [allOrders, PAYMENT_TIMEOUT_SECONDS]);

  // Process pending orders from SWR data
  const processPendingOrders = useCallback(() => {
    if (!processedPendingOrders.length) return;

    // Filter out already expired orders from pending display
    const activePendingOrders = processedPendingOrders.filter((order: PendingOrder) => !order.isExpired);
    setPendingOrders(activePendingOrders);

    // Start countdown timers for non-expired pending orders
    activePendingOrders.forEach((order: PendingOrder) => {
      startCountdownTimer(order._id);
    });

    // Auto-cancel any expired orders that are still in the database
    processedPendingOrders.forEach((order: PendingOrder) => {
      if (order.isExpired && handleAutoCancelOrderRef.current) {
        handleAutoCancelOrderRef.current(order._id);
      }
    });
  }, [processedPendingOrders, startCountdownTimer]);

  useEffect(() => {
    if (user) {
      processPendingOrders();
    } else {
      setError('Please log in to view your orders');
    }
  }, [user, processPendingOrders]);

  // Handle client-side hydration and screen size changes
  useEffect(() => {
    setIsClient(true);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset page when switching between mobile and desktop
  useEffect(() => {
    setCurrentPageState(1);
  }, [isMobile]);

  // Cleanup countdown timers on unmount
  useEffect(() => {
    const currentCountdownRefs = countdownRefs.current;
    return () => {
      currentCountdownRefs.forEach((timer) => clearInterval(timer));
    };
  }, []);

  // Listen for PayPal payment events
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handlePayPalPaymentSuccess = (_event: CustomEvent) => {
      // Close payment modal
      setShowPayPalPayment(false);
      setCurrentPendingOrder(null);
      
      // Refresh orders to update status
      mutateOrders();
      mutateAllOrders();
      
      // Show success message
      toast.success('Payment completed! Your order has been processed.');
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handlePayPalPaymentCancelled = (_event: CustomEvent) => {
      // Close payment modal
      setShowPayPalPayment(false);
      setCurrentPendingOrder(null);
      
      // Show user-friendly message
      toast.info('Payment was cancelled. You can try again anytime.');
    };

    const handlePayPalPaymentError = (event: CustomEvent) => {
      const { orderId, error } = event.detail;
      console.error('PayPal payment error:', { orderId, error });
      
      // Close payment modal
      setShowPayPalPayment(false);
      setCurrentPendingOrder(null);
      
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
  }, [mutateOrders, mutateAllOrders]);

  const handleCompletePayment = async (order: PendingOrder) => {
    if (order.paymentBreakdown.paypalAmount <= 0) {
      return; // No PayPal payment needed
    }

    setCurrentPendingOrder(order);
    setShowPayPalPayment(true);
  };

  // Handle PayPal button rendering when modal opens
  useEffect(() => {
    if (showPayPalPayment && currentPendingOrder && paypalButtonRef.current) {
      // Clear any existing button
      paypalButtonRef.current.innerHTML = '';
      
      // Render PayPal button
      paypalService.renderPayPalPaymentButton({
        orderId: currentPendingOrder._id,
        amount: currentPendingOrder.paymentBreakdown.paypalAmount,
        currency: 'USD',
        description: `Complete payment for order ${currentPendingOrder.orderNumber}`
      }, paypalButtonRef.current).catch(error => {
        console.error('Error rendering PayPal button:', error);
        toast.error('Failed to load payment system. Please try again.');
      });
    }
  }, [showPayPalPayment, currentPendingOrder]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      setProcessingPayment(true);
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/orders/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Remove from pending orders and refresh
        setPendingOrders(prev => prev.filter(order => order._id !== orderId));
        mutateOrders();
      mutateAllOrders(); // Refresh to update completed orders if any
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };




  const handleDownloadInvoice = async (orderId: string) => {
    if (downloadingInvoice === orderId) return; // Prevent multiple simultaneous downloads
    
    setDownloadingInvoice(orderId);
    toast.info('Preparing your invoice...', { duration: 2000 });
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please log in to download your invoice');
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/invoices/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Invoice not found');
          return;
        }
        throw new Error('Failed to download invoice');
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Find the order to get the order number for filename
      const order = orders.find(o => o._id === orderId);
      const orderNumber = order?.orderNumber || 'unknown';
      
      // Create download link for PDF
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${orderNumber}.pdf`;
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Invoice PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice. Please try again.');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  // Build flattened row data for pagination
  const flattenedRows = useMemo(() => {
    return orders.flatMap((order) =>
      order.items.map((item, itemIndex) => ({ order, item, key: `${order._id}-${itemIndex}` }))
    );
  }, [orders]);

  // Group items by order for mobile view
  const ordersWithItems = useMemo(() => {
    return orders.map(order => ({
      ...order,
      allItems: order.items
    }));
  }, [orders]);

  const totalRows = flattenedRows.length;
  const totalOrders = ordersWithItems.length;
  
  // Use different page sizes for desktop vs mobile
  const currentPageSize = isMobile ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE;
  const currentTotal = isMobile ? totalOrders : totalRows;
  
  const totalPages = Math.max(1, Math.ceil(currentTotal / currentPageSize));
  const safePage = Math.min(Math.max(1, currentPageState), totalPages);
  const startIndex = (safePage - 1) * currentPageSize;
  
  const paginatedRows = flattenedRows.slice(startIndex, startIndex + currentPageSize);
  const paginatedOrders = ordersWithItems.slice(startIndex, startIndex + currentPageSize);

  if (ordersLoading || allOrdersLoading) {
    return (
      <AccountLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </AccountLayout>
    );
  }

  if (ordersError || allOrdersError || error) {
    return (
      <AccountLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md mx-auto px-4">
            <p className="text-red-600 mb-4">{ordersError?.message || allOrdersError?.message || error}</p>
            <Link href="/login" className="text-orange-500 hover:text-orange-600">
              Go to Login
            </Link>
          </div>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className="w-full overflow-hidden">
              {/* Pending Orders Section */}
              {pendingOrders.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    Pending Orders
                  </h2>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <p className="text-orange-800 text-sm">
                      You have {pendingOrders.length} pending order{pendingOrders.length > 1 ? 's' : ''} that need{pendingOrders.length > 1 ? '' : 's'} payment completion within {PAYMENT_TIMEOUT_MINUTES} minutes.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {pendingOrders.map((order) => (
                      <div key={order._id} className="bg-white border border-orange-200 rounded-lg p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Order #{order.orderNumber}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Created: {new Date(order.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${order.isExpired ? 'text-red-600' : 'text-sunrise'}`}>
                              ${order.total.toFixed(2)}
                            </div>
                            {!order.isExpired && (
                              <div className="flex items-center text-sm text-orange-600">
                                <Clock className="w-4 h-4 mr-1" />
                                {formatTimeRemaining(order.timeRemaining)} remaining
                              </div>
                            )}
                            {order.isExpired && (
                              <div className="flex items-center text-sm text-red-600">
                                <XCircle className="w-4 h-4 mr-1" />
                                Expired
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="text-sm text-gray-600 mb-2">Items:</div>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{item.productName} (x{item.quantity})</span>
                                <span>${item.totalPrice.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4 p-3 bg-gray-50 rounded">
                          <div className="text-sm text-gray-600 mb-2">Payment Breakdown:</div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Credits Used:</span>
                              <span className="text-green-600">-{order.paymentBreakdown.creditsUsed.toFixed(2)} credits (${order.paymentBreakdown.creditsAmount.toFixed(2)})</span>
                            </div>
                            <div className="flex justify-between">
                              <span>PayPal Payment:</span>
                              <span>${order.paymentBreakdown.paypalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-semibold border-t pt-1">
                              <span>Total:</span>
                              <span>${order.paymentBreakdown.totalAmount.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          {!order.isExpired && order.paymentBreakdown.paypalAmount > 0 && (
                            <Button
                              onClick={() => handleCompletePayment(order)}
                              className="bg-sunrise hover:bg-sunrise/80 text-black"
                              disabled={processingPayment}
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              Complete Payment
                            </Button>
                          )}
                          <Button
                            onClick={() => handleCancelOrder(order._id)}
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            disabled={processingPayment}
                          >
                            Cancel Order
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Orders Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  Order History
                </h2>
                
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">No completed orders found.</p>
                    <Link href="/" className="text-orange-500 hover:text-orange-600">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Loading state during hydration */}
                    {!isClient && (
                      <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading...</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Desktop Table View */}
                    {isClient && !isMobile && (
                      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="max-h-[70vh] overflow-y-auto scrollbar-hide">
                          <table className="w-full">
                            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Product Name
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Order ID
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Date
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Price
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Invoice
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {paginatedRows.map(({ order, item, key }) => (
                                  <tr key={key} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 text-sm">
                                      <div className="max-w-xs">
                                        <p className="text-sm font-medium text-left text-gray-900 truncate" title={item.productName}>
                                          {item.productName}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="px-3 py-4 text-sm text-left font-medium text-gray-900">
                                      <span className="truncate">#{order.orderNumber}</span>
                                    </td>
                                    <td className="px-3 py-4 text-sm text-left text-gray-900">
                                      <span className="whitespace-nowrap">
                                        {new Date(order.createdAt).toLocaleDateString('en-US', { 
                                          year: '2-digit', 
                                          month: 'short', 
                                          day: 'numeric' 
                                        })}
                                      </span>
                                    </td>
                                    <td className="px-3 py-4 text-sm text-left text-gray-900">
                                      <span className="whitespace-nowrap">${item.totalPrice.toFixed(2)}</span>
                                    </td>
                                    <td className="px-3 py-4 text-sm text-left">
                                      <button
                                        onClick={() => handleDownloadInvoice(order._id)}
                                        disabled={downloadingInvoice === order._id}
                                        className="text-[#D94506] hover:underline text-xs whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                      >
                                        {downloadingInvoice === order._id ? (
                                          <>
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Preparing...
                                          </>
                                        ) : (
                                          'Download'
                                        )}
                                      </button>
                                    </td>
                                  </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Tablet Card View */}
                    {isClient && !isMobile && (
                    <div className="hidden md:block lg:hidden space-y-4">
                      {paginatedOrders.map((order) => (
                        <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                Order #{order.orderNumber}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-lg font-bold text-gray-900">
                                ${order.total.toFixed(2)}
                              </div>
                              <button
                                onClick={() => handleDownloadInvoice(order._id)}
                                disabled={downloadingInvoice === order._id}
                                className="text-[#D94506] hover:underline text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                              >
                                {downloadingInvoice === order._id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Preparing Invoice...
                                  </>
                                ) : (
                                  'Download Invoice'
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {order.allItems.map((item, index) => (
                              <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded">
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium truncate block" title={item.productName}>
                                    {item.productName}
                                  </span>
                                  <span className="text-gray-600">Qty: {item.quantity}</span>
                                </div>
                                <span className="font-semibold ml-2">${item.totalPrice.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      </div>
                    )}

                    {/* Mobile Card View */}
                    {isClient && isMobile && (
                      <div className="md:hidden space-y-4">
                      {paginatedOrders.map((order) => (
                        <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                Order #{order.orderNumber}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                ${order.total.toFixed(2)}
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="text-sm text-gray-600 mb-2">Items:</div>
                            <div className="space-y-2">
                              {order.allItems.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{item.productName}</span>
                                    <span className="text-gray-600">x{item.quantity}</span>
                                  </div>
                                  <span className="font-semibold">${item.totalPrice.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                            <button
                              onClick={() => handleDownloadInvoice(order._id)}
                              disabled={downloadingInvoice === order._id}
                              className="flex items-center gap-1 text-[#D94506] hover:underline text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {downloadingInvoice === order._id ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Preparing...
                                </>
                              ) : (
                                <>
                                  <Download className="w-4 h-4" />
                                  Download Invoice
                                </>
                              )}
                            </button>
                            <div className="text-xs text-gray-500">
                              {order.allItems.length} item{order.allItems.length > 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      ))}
                      </div>
                    )}

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 mt-4">
                      <div className="text-sm text-gray-600">
                        {currentTotal === 0 ? 'No records' : `Showing ${startIndex + 1}-${Math.min(startIndex + currentPageSize, currentTotal)} of ${currentTotal}`}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPageState((p) => Math.max(1, p - 1))}
                          disabled={safePage === 1}
                          className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                        >
                          Prev
                        </button>
                        <div className="text-sm">
                          Page {safePage} of {totalPages}
                        </div>
                        <button
                          onClick={() => setCurrentPageState((p) => Math.min(totalPages, p + 1))}
                          disabled={safePage >= totalPages}
                          className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
      </div>

      {/* PayPal Payment Modal */}
      {showPayPalPayment && currentPendingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Payment</h3>
            <p className="text-gray-600 mb-4">
              Order: <strong>#{currentPendingOrder.orderNumber}</strong>
            </p>
            <p className="text-gray-600 mb-6">
              PayPal Amount: <strong>${currentPendingOrder.paymentBreakdown.paypalAmount.toFixed(2)}</strong>
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
      
    </AccountLayout>
  );
}