'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { paypalService } from '@/lib/paypal'
import { Button } from '@/components/ui/button'
import { Clock, XCircle, CreditCard } from 'lucide-react'

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    totalPrice: number;
    imageUrl?: string;
    productInfo?: {
      type: 'physical' | 'digital' | 'service';
      isKitProduct?: boolean;
    };
  }>;
  paymentBreakdown: {
    creditsUsed: number;
    creditsAmount: number;
    paypalAmount: number;
    totalAmount: number;
  };
}

interface PendingOrder extends Order {
  timeRemaining: number; // seconds remaining
  isExpired: boolean;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAccountId, setUserAccountId] = useState<string>('');
  const [showPayPalPayment, setShowPayPalPayment] = useState(false);
  const [currentPendingOrder, setCurrentPendingOrder] = useState<PendingOrder | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const paypalButtonRef = useRef<HTMLDivElement>(null);
  const countdownRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const [currentPageState, setCurrentPageState] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const PAGE_SIZE = 10;
  const MOBILE_PAGE_SIZE = 3;

  const PAYMENT_TIMEOUT_MINUTES = 5;
  const PAYMENT_TIMEOUT_SECONDS = PAYMENT_TIMEOUT_MINUTES * 60;

  const fetchAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Fetch completed orders
      const completedResponse = await fetch(`${API_URL}/api/orders/user/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Fetch all orders including pending ones
      const allOrdersResponse = await fetch(`${API_URL}/api/orders/user/orders/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!completedResponse.ok || !allOrdersResponse.ok) {
        const errorData = await completedResponse.json().catch(() => ({ message: 'Failed to fetch orders' }));
        throw new Error(errorData.message || 'Failed to load orders');
      }

      const completedData = await completedResponse.json();
      const allOrdersData = await allOrdersResponse.json();

      setOrders(completedData);

      // Process pending orders and filter out already expired ones
      const pending = allOrdersData.filter((order: Order) => 
        order.status === 'pending' && order.paymentStatus === 'pending'
      );

      const processedPendingOrders = pending.map((order: Order): PendingOrder => {
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

      // Filter out already expired orders from pending display
      const activePendingOrders = processedPendingOrders.filter((order: PendingOrder) => !order.isExpired);
      setPendingOrders(activePendingOrders);

      // Start countdown timers for non-expired pending orders
      activePendingOrders.forEach((order: PendingOrder) => {
        startCountdownTimer(order._id);
      });

      // Auto-cancel any expired orders that are still in the database
      processedPendingOrders.forEach((order: PendingOrder) => {
        if (order.isExpired) {
          handleAutoCancelOrder(order._id);
        }
      });

    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAllOrders();
      fetchUserAccountId();
    } else {
      setLoading(false);
      setError('Please log in to view your orders');
    }
  }, [user, fetchAllOrders]);

  // Handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
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

  // Listen for PayPal payment success
  useEffect(() => {
    const handlePayPalPaymentSuccess = (event: CustomEvent) => {
      const { orderId, paymentId, result } = event.detail;
      console.log('PayPal payment successful:', { orderId, paymentId, result });
      
      // Close payment modal
      setShowPayPalPayment(false);
      setCurrentPendingOrder(null);
      
      // Refresh orders to update status
      fetchAllOrders();
      
      // Show success message
      alert('Payment completed successfully! Your order has been processed.');
    };

    window.addEventListener('paypal-payment-success', handlePayPalPaymentSuccess as EventListener);

    return () => {
      window.removeEventListener('paypal-payment-success', handlePayPalPaymentSuccess as EventListener);
    };
  }, [fetchAllOrders]);

  const fetchUserAccountId = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/buyers/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserAccountId(data.buyer.userAccountId || 'N/A');
      }
    } catch (error) {
      console.error('Error fetching user account ID:', error);
    }
  };


  const startCountdownTimer = (orderId: string) => {
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
              // Auto-cancel expired order
              handleAutoCancelOrder(orderId);
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
  };

  const handleAutoCancelOrder = async (orderId: string) => {
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
        fetchAllOrders(); // Refresh to update completed orders if any
      }
    } catch (error) {
      console.error('Error auto-cancelling order:', error);
    }
  };

  const handleCompletePayment = async (order: PendingOrder) => {
    if (order.paymentBreakdown.paypalAmount <= 0) {
      return; // No PayPal payment needed
    }

    setCurrentPendingOrder(order);
    setShowPayPalPayment(true);
    
    // Render PayPal button after modal is shown
    setTimeout(() => {
      if (paypalButtonRef.current) {
        paypalService.renderPayPalPaymentButton({
          orderId: order._id,
          amount: order.paymentBreakdown.paypalAmount,
          currency: 'USD',
          description: `Complete payment for order ${order.orderNumber}`
        }, paypalButtonRef.current);
      }
    }, 100);
  };

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
        fetchAllOrders(); // Refresh to update completed orders if any
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

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };



  const handleDownloadInvoice = (orderId: string) => {
    // TODO: Implement invoice download
    console.log('Downloading invoice for order:', orderId);
    // This would typically call an API endpoint to generate and download the invoice
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
  const currentPageSize = isMobile ? MOBILE_PAGE_SIZE : PAGE_SIZE;
  const currentTotal = isMobile ? totalOrders : totalRows;
  
  const totalPages = Math.max(1, Math.ceil(currentTotal / currentPageSize));
  const safePage = Math.min(Math.max(1, currentPageState), totalPages);
  const startIndex = (safePage - 1) * currentPageSize;
  
  const paginatedRows = flattenedRows.slice(startIndex, startIndex + currentPageSize);
  const paginatedOrders = ordersWithItems.slice(startIndex, startIndex + currentPageSize);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/login" className="text-orange-500 hover:text-orange-600">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen max-w-full mx-auto bg-white mb-10 overflow-x-hidden">
        {/* Header */}
        <div className="text-center py-8 px-[clamp(1rem,4vw,2rem)]">
          <h1 className="text-4xl font-bold text-orange-500">My Account</h1>
        </div>

        <div className="max-w-7xl mx-auto px-[clamp(1rem,4vw,2rem)]">
          <div className="flex sm:flex-row flex-col gap-8">
            {/* Left Sidebar */}
            <div className="w-full sm:w-64 bg-gray-100 p-6 rounded-lg">
              <h2 className="font-bold text-gray-900 mb-4">Account ID: {userAccountId}</h2>
              <hr className="border-gray-300 mb-4" />
              <nav className="space-y-2">
                <Link href="/profile" className="block text-gray-700 hover:text-orange-600 font-medium">
                  Account
                </Link>
                <Link href="/orders" className="block text-gray-600 hover:text-orange-600 font-medium">
                  Orders
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block text-gray-600 hover:text-orange-600"
                >
                  Log Out
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-x-hidden">
              {/* Pending Orders Section */}
              {pendingOrders.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    Pending Orders
                  </h2>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <p className="text-orange-800 text-sm">
                      You have {pendingOrders.length} pending order{pendingOrders.length > 1 ? 's' : ''} that need payment completion within {PAYMENT_TIMEOUT_MINUTES} minutes.
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
                            <div className={`text-lg font-bold ${order.isExpired ? 'text-red-600' : 'text-orange-600'}`}>
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
                              <span className="text-green-600">-${order.paymentBreakdown.creditsUsed.toFixed(2)}</span>
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
                              className="bg-orange-500 hover:bg-orange-600 text-white"
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
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="overflow-x-auto overflow-y-auto max-h-[70vh] w-full">
                        <table className="w-full min-w-[800px]">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                                Product Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                Number ID
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                                Dates
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                Price
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                                Invoice
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedRows.map(({ order, item, key }) => (
                                <tr key={key} className="hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                                  <td className="px-6 py-4 text-sm">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate" title={item.productName}>
                                          {item.productName}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    #{order.orderNumber}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(order.createdAt).toLocaleDateString('en-US', { 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${item.totalPrice.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                      onClick={() => handleDownloadInvoice(order._id)}
                                      className="text-[#D94506] hover:underline"
                                    >
                                      Download invoice
                                    </button>
                                  </td>
                                </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Mobile Card View */}
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
                              className="text-[#D94506] hover:underline text-sm font-medium"
                            >
                              Download Invoice
                            </button>
                            <div className="text-xs text-gray-500">
                              {order.allItems.length} item{order.allItems.length > 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

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
      </div>
    </ProtectedRoute>
  );
}