'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

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

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAccountId, setUserAccountId] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchUserAccountId();
    } else {
      setLoading(false);
      setError('Please log in to view your orders');
    }
  }, [user]);



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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/orders/user/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch orders' }));
        throw new Error(errorData.message || 'Failed to load orders');
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  const handleDownloadZip = async (orderId: string, productId: string, productName: string) => {
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
      console.error('Error downloading ZIP:', error);
      alert('Failed to download the file. Please try again.');
    }
  };

  const handleDownloadInvoice = (orderId: string) => {
    // TODO: Implement invoice download
    console.log('Downloading invoice for order:', orderId);
    // This would typically call an API endpoint to generate and download the invoice
  };

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
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-orange-500">My Account</h1>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <div className="w-64 bg-gray-100 p-6 rounded-lg">
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
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders History</h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No orders found.</p>
                <Link href="/" className="text-orange-500 hover:text-orange-600">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Number ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      order.items.map((item, itemIndex) => (
                        <tr key={`${order._id}-${itemIndex}`} className="hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
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
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate" title={item.productName}>
                                {item.productName}
                              </p>
                            </div>
                            {/* Only show download button for digital products or kit products */}
                            {(item.productInfo?.type === 'digital' || item.productInfo?.isKitProduct) && (
                              <button
                                onClick={() => handleDownloadZip(order._id, item.productId, item.productName)}
                                className="ml-3 inline-flex items-center px-3 py-1 border-2 border-[#D94506] text-xs font-medium rounded-md text-black bg-[#FFC1A0] hover:bg-[#FFB08A] focus:outline-none transition-colors duration-200"
                              >
                                Download
                              </button>
                            )}
                          </div>
                        </td>
                                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDownloadInvoice(order._id)}
                            className="inline-flex items-center px-3 py-1 border-2 border-[#D94506] text-xs font-medium rounded-md text-black hover:bg-[#ffd9c7] focus:outline-none transition-colors duration-200"
                          >
                            Invoice
                          </button>
                        </td>
                        </tr>
                      ))
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}