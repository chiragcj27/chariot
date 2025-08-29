'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ChartBarIcon,
  BellIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

interface MarketplaceStats {
  totalSales: number;
  totalRevenue: number;
  totalCommission: number;
  totalTax: number;
  orderCount: number;
  sellerCount: number;
  productCount: number;
  averageOrderValue: number;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  status: string;
  createdAt: string;
  metadata?: {
    saleAmount?: number;
    commissionAmount?: number;
    orderNumber?: string;
    productName?: string;
    sellerName?: string;
  };
}

export default function MarketplacePage() {
  const [stats, setStats] = useState<MarketplaceStats>({
    totalSales: 0,
    totalRevenue: 0,
    totalCommission: 0,
    totalTax: 0,
    orderCount: 0,
    sellerCount: 0,
    productCount: 0,
    averageOrderValue: 0,
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchMarketplaceStats(),
        fetchNotifications(),
      ]);
    } catch (error) {
      console.error('Failed to fetch marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketplaceStats = async () => {
    try {
      const response = await fetch(`/api/marketplace/admin/stats?period=${period}`);
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch marketplace stats:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      
      const response = await fetch(`/api/marketplace/admin/notifications/${userId}?limit=10`);
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/marketplace/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, status: 'read' }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const unreadNotificationsCount = notifications.filter(n => n.status === 'unread').length;

  const statsCards = [
    {
      name: 'Total Sales',
      value: `$${stats.totalSales.toLocaleString()}`,
      icon: ShoppingCartIcon,
      color: 'bg-blue-500',
      change: '+12.5%',
    },
    {
      name: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
      change: '+8.2%',
    },
    {
      name: 'Platform Commission',
      value: `$${stats.totalCommission.toLocaleString()}`,
      icon: ArrowTrendingUpIcon,
      color: 'bg-orange-500',
      change: '+15.3%',
    },
    {
      name: 'Total Tax Collected',
      value: `$${stats.totalTax.toLocaleString()}`,
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      change: '+6.7%',
    },
    {
      name: 'Active Sellers',
      value: stats.sellerCount.toLocaleString(),
      icon: UserGroupIcon,
      color: 'bg-indigo-500',
      change: '+3.1%',
    },
    {
      name: 'Average Order Value',
      value: `$${stats.averageOrderValue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-emerald-500',
      change: '+2.4%',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Marketplace Analytics</h1>
            <p className="text-gray-600">Monitor your marketplace performance and sales</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={period} onValueChange={(value: 'day' | 'week' | 'month' | 'year') => setPeriod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="flex items-center gap-2"
            >
              <BellIcon className="h-5 w-5" />
              Notifications
              {unreadNotificationsCount > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {unreadNotificationsCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Notifications Panel */}
        {showNotifications && (
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Recent Marketplace Notifications</h3>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 rounded-lg border ${
                      notification.status === 'unread' 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        {notification.metadata && (
                          <div className="mt-2 text-xs text-gray-500">
                            {notification.metadata.saleAmount && (
                              <span className="mr-3">Amount: ${notification.metadata.saleAmount}</span>
                            )}
                            {notification.metadata.orderNumber && (
                              <span className="mr-3">Order: {notification.metadata.orderNumber}</span>
                            )}
                            {notification.metadata.sellerName && (
                              <span className="mr-3">Seller: {notification.metadata.sellerName}</span>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {notification.status === 'unread' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markNotificationAsRead(notification._id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No notifications to display</p>
            )}
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {statsCards.map((card) => (
            <Card key={card.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.name}</CardTitle>
                <div className={`flex-shrink-0 rounded-md p-2 ${card.color}`}>
                  <card.icon className="h-4 w-4 text-white" aria-hidden="true" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-green-600 mt-1">{card.change} from last period</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Analytics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Sellers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Seller performance analytics will be displayed here</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Category-wise sales breakdown will be displayed here</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Recent sales and transactions will be displayed here</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
