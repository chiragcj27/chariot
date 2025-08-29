'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
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

  const fetchMarketplaceStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/marketplace/admin/stats?period=${period}`);
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch marketplace stats:', error);
    }
  }, [period]);

  const fetchNotifications = useCallback(async () => {
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
  }, []);

  const fetchData = useCallback(async () => {
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
  }, [fetchMarketplaceStats, fetchNotifications]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      change: '+5.7%',
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Marketplace Dashboard</h1>
            <p className="text-gray-600">Monitor sales, revenue, and marketplace activity</p>
          </div>
          <div className="flex items-center space-x-4">
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
              className="relative"
            >
              <BellIcon className="h-5 w-5" />
              {unreadNotificationsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                  {unreadNotificationsCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card) => (
            <Card key={card.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.name}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{card.change}</span> from last period
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.orderCount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Average order value: ${stats.averageOrderValue.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Sellers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sellerCount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Active sellers on platform
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.productCount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total products listed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Panel */}
        {showNotifications && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No notifications</p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`flex items-start justify-between p-3 rounded-lg border ${
                        notification.status === 'unread' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                        {notification.metadata && (
                          <div className="mt-2 text-xs text-gray-500">
                            {notification.metadata.saleAmount && (
                              <span className="mr-4">Sale: ${notification.metadata.saleAmount}</span>
                            )}
                            {notification.metadata.commissionAmount && (
                              <span className="mr-4">Commission: ${notification.metadata.commissionAmount}</span>
                            )}
                            {notification.metadata.orderNumber && (
                              <span className="mr-4">Order: {notification.metadata.orderNumber}</span>
                            )}
                          </div>
                        )}
                      </div>
                      {notification.status === 'unread' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markNotificationAsRead(notification._id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
