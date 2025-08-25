'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, FileText, Calendar, DollarSign, CreditCard, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCart } from '@/contexts/CartContext'

interface OrderConfirmationData {
  orderNumber: string;
  orderDate: string;
  total: number;
  paymentMethod: string;
  paymentBreakdown: {
    creditsUsed: number;
    creditsAmount: number;
    paypalAmount: number;
    totalAmount: number;
  };
  items: Array<{
    productId?: string;
    productName: string;
    quantity: number;
    totalPrice: number;
    imageUrl?: string;
    isDigitalProduct?: boolean;
    isKitProduct?: boolean;
  }>;
}

export default function OrderConfirmationPage() {
  const { clearCart } = useCart();
  const [orderData, setOrderData] = useState<OrderConfirmationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get order data from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    if (orderId) {
      fetchOrderDetails(orderId);
    } else {
      // Mock order data for demonstration
      setOrderData({
        orderNumber: 'ORD-20250101-001',
        orderDate: new Date().toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        }),
        total: 90,
        paymentMethod: 'Mixed (Credits + PayPal)',
        paymentBreakdown: {
          creditsUsed: 70,
          creditsAmount: 70,
          paypalAmount: 20,
          totalAmount: 90,
        },
        items: [
          {
            productName: 'Test Product 1',
            quantity: 1,
            totalPrice: 25,
            imageUrl: 'https://placehold.co/80x80',
          },
          {
            productName: 'Test Product 2',
            quantity: 1,
            totalPrice: 35,
            imageUrl: 'https://placehold.co/80x80',
          },
          {
            productName: 'Test Product 3',
            quantity: 1,
            totalPrice: 15,
            imageUrl: 'https://placehold.co/80x80',
          },
          {
            productName: 'Test Product 4',
            quantity: 1,
            totalPrice: 15,
            imageUrl: 'https://placehold.co/80x80',
          },
        ],
      });
      setLoading(false);
    }

    // Clear cart after successful order
    clearCart();
  }, []); // Remove clearCart from dependencies to prevent infinite loop

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/orders/user/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const order = await response.json();
      
      // Transform the order data to match our interface
      setOrderData({
        orderNumber: order.orderNumber,
        orderDate: new Date(order.createdAt).toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        }),
        total: order.total,
        paymentMethod: getPaymentMethodDisplay(order.paymentMethod),
        paymentBreakdown: order.paymentBreakdown,
        items: order.items.map((item: { productName: string; quantity: number; totalPrice: number; imageUrl?: string }) => ({
          productName: item.productName,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          imageUrl: item.imageUrl,
        })),
      });
    } catch (error) {
      console.error('Error fetching order details:', error);
      // Fall back to mock data
      setOrderData({
        orderNumber: 'ORD-20250101-001',
        orderDate: new Date().toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        }),
        total: 90,
        paymentMethod: 'Mixed (Credits + PayPal)',
        paymentBreakdown: {
          creditsUsed: 70,
          creditsAmount: 70,
          paypalAmount: 20,
          totalAmount: 90,
        },
        items: [
          {
            productName: 'Test Product 1',
            quantity: 1,
            totalPrice: 25,
            imageUrl: 'https://placehold.co/80x80',
          },
          {
            productName: 'Test Product 2',
            quantity: 1,
            totalPrice: 35,
            imageUrl: 'https://placehold.co/80x80',
          },
          {
            productName: 'Test Product 3',
            quantity: 1,
            totalPrice: 15,
            imageUrl: 'https://placehold.co/80x80',
          },
          {
            productName: 'Test Product 4',
            quantity: 1,
            totalPrice: 15,
            imageUrl: 'https://placehold.co/80x80',
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'credits':
        return 'Credits Only';
      case 'paypal':
        return 'PayPal Only';
      case 'mixed':
        return 'Mixed (Credits + PayPal)';
      default:
        return method;
    }
  };

  const handleDownloadDigitalProduct = async (productId: string, productName: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Please log in to download your digital products');
        return;
      }

      // Get the download URL from our frontend API
      const response = await fetch(`/api/assets/digital-product/${productId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 401) {
          alert('Please log in to download this product');
          return;
        }
        
        if (response.status === 403) {
          alert('You need to purchase this product to download it');
          return;
        }
        
        throw new Error(errorData.message || 'Failed to get download URL');
      }

      const { downloadUrl } = await response.json();

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${productName}.zip`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('Download started! The download link will expire in 5 minutes.');
    } catch (error) {
      console.error('Error downloading digital product:', error);
      alert('Failed to download the file. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order confirmation...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Order not found</p>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your purchase. Your order has been successfully placed.</p>
        </div>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Order Number</span>
              </div>
              <span className="font-semibold text-gray-900">{orderData.orderNumber}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Order Date</span>
              </div>
              <span className="text-gray-900">{orderData.orderDate}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Payment Method</span>
              </div>
              <span className="text-gray-900">{orderData.paymentMethod}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Total Amount</span>
              </div>
              <span className="font-semibold text-lg text-gray-900">${orderData.total}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Payment Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orderData.paymentBreakdown.creditsUsed > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Credits Used</span>
                <span className="text-green-600 font-medium">
                  {orderData.paymentBreakdown.creditsUsed} credits (${orderData.paymentBreakdown.creditsAmount})
                </span>
              </div>
            )}
            
            {orderData.paymentBreakdown.paypalAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-700">PayPal Payment</span>
                <span className="text-blue-600 font-medium">${orderData.paymentBreakdown.paypalAmount}</span>
              </div>
            )}

            <div className="border-t pt-3 flex items-center justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-semibold text-lg text-gray-900">${orderData.paymentBreakdown.totalAmount}</span>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderData.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                    <img 
                      src={item.imageUrl || 'https://placehold.co/80x80'} 
                      alt={item.productName}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    {(item.isDigitalProduct || item.isKitProduct) && item.productId && (
                      <button
                        onClick={() => handleDownloadDigitalProduct(item.productId!, item.productName)}
                        className="text-orange-500 hover:text-orange-600 font-medium text-sm mt-1"
                      >
                        Download {item.isDigitalProduct ? 'Digital Product' : 'Kit Files'}
                      </button>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">${item.totalPrice}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/orders">
            <Button variant="outline" className="w-full sm:w-auto">
              <FileText className="w-4 h-4 mr-2" />
              View All Orders
            </Button>
          </Link>
          
          <Link href="/">
            <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>You will receive an email confirmation shortly.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </div>
  );
}

