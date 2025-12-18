'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ChartBarIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import BlacklistNotification from '@/components/blacklist-notification';
import { JwtPayload } from 'jsonwebtoken';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  totalRevenue: number;
  totalCommission: number;
  totalEarnings: number;
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
  };
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  isBlacklisted: boolean;
  blacklistInfo?: {
    isBlacklisted: boolean;
    blacklistReason?: string;
    blacklistedAt?: string;
    blacklistExpiryDate?: string;
    reapplicationDate?: string;
    isExpired?: boolean;
  };
}

interface DashboardClientProps {
  user: JwtPayload | null;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    totalRevenue: 0,
    totalCommission: 0,
    totalEarnings: 0,
  });
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchDashboardStats = useCallback(async (sellerId: string) => {
    try {
      if (!sellerId) return;
      const response = await fetch(`/api/marketplace/seller/stats/${sellerId}?period=month`);
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalSales: data.stats.totalSales,
          totalOrders: data.stats.orderCount,
          totalCustomers: data.stats.orderCount,
          averageOrderValue: data.stats.averageOrderValue,
          totalRevenue: data.stats.totalRevenue,
          totalCommission: data.stats.totalCommission,
          totalEarnings: data.stats.totalEarnings,
        });
      }
    } catch {}
  }, []);

  const fetchNotifications = useCallback(async (sellerId: string) => {
    try {
      if (!sellerId) return;
      const response = await fetch(`/api/marketplace/seller/notifications/${sellerId}?limit=10`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use user info from JWT token or fallback to localStorage
        if (user) {
          setUserInfo({
            id: user.id as string,
            name: user.name as string,
            email: user.email as string,
            isBlacklisted: user.isBlacklisted as boolean || false,
            blacklistInfo: user.blacklistInfo as {
              isBlacklisted: boolean;
              blacklistReason?: string;
              blacklistedAt?: string;
              blacklistExpiryDate?: string;
              reapplicationDate?: string;
              isExpired?: boolean;
            },
          });
        } else {
          // Fallback to localStorage for backward compatibility
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUserInfo(parsedUser);
          }
        }

        // Resolve sellerId immediately for fetching
        const effectiveUserId = (user?.id as string) || (() => {
          const storedUser = localStorage.getItem('user');
          if (!storedUser) return '';
          try { return (JSON.parse(storedUser) || {}).id as string; } catch { return ''; }
        })();

        // Only fetch stats if not blacklisted or if blacklist has expired
        const isBlacklisted = user ? (user.isBlacklisted as boolean) : (userInfo?.isBlacklisted ?? false);
        const isExpired = user ? ((user.blacklistInfo as { isExpired?: boolean } | undefined)?.isExpired ?? false) : (userInfo?.blacklistInfo?.isExpired ?? false);
        const shouldFetchStats = !isBlacklisted || (isExpired && isBlacklisted);

        if (effectiveUserId && shouldFetchStats) {
          await Promise.all([
            fetchDashboardStats(effectiveUserId),
            fetchNotifications(effectiveUserId),
          ]);
        }
      } catch {
        // no-op
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, userInfo?.isBlacklisted, userInfo?.blacklistInfo?.isExpired, fetchDashboardStats, fetchNotifications]);

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/marketplace/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      
      if (response.ok) {
        // Update local state to mark notification as read
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, status: 'read' }
              : notif
          )
        );
      }
    } catch {
      // no-op
    }
  };

  const unreadNotificationsCount = notifications.filter(n => n.status === 'unread').length;

  const statsCards = [
    {
      name: 'Total Sales',
      value: `$${stats.totalSales.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCartIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Customers',
      value: stats.totalCustomers.toLocaleString(),
      icon: UserGroupIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Average Order Value',
      value: `$${stats.averageOrderValue.toLocaleString()}`,
      icon: ChartBarIcon,
      color: 'bg-yellow-500',
    },
  ];

  const marketplaceStatsCards = [
    {
      name: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-emerald-500',
    },
    {
      name: 'Platform Commission',
      value: `$${stats.totalCommission.toLocaleString()}`,
      icon: ChartBarIcon,
      color: 'bg-orange-500',
    },
    {
      name: 'Your Earnings',
      value: `$${stats.totalEarnings.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-green-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        
        {/* Notifications Button */}
        <div className="relative">
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

      {/* Blacklist Notification */}
      {userInfo?.isBlacklisted && userInfo.blacklistInfo && (
        <BlacklistNotification
          blacklistInfo={userInfo.blacklistInfo}
          sellerId={userInfo.id}
        />
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Recent Notifications</h3>
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

      {/* Dashboard Stats - Show if not blacklisted or if blacklist has expired */}
      {(!userInfo?.isBlacklisted || (userInfo?.blacklistInfo?.isExpired && userInfo?.isBlacklisted)) && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((card) => (
              <div
                key={card.name}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${card.color}`}>
                      <card.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {card.name}
                        </dt>
                        <dd className="text-lg font-semibold text-gray-900">
                          {card.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Marketplace Stats */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Marketplace Performance</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {marketplaceStatsCards.map((card) => (
                <div
                  key={card.name}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 rounded-md p-3 ${card.color}`}>
                        <card.icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {card.name}
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900">
                            {card.value}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            <div className="mt-4 bg-white shadow rounded-lg">
              <div className="p-6">
                <div className="flow-root">
                  <ul role="list" className="-mb-8">
                    {/* Add recent activity items here */}
                    <li className="text-sm text-gray-500">
                      No recent activity to display
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Blacklisted Message - Only show for active blacklists */}
      {userInfo?.isBlacklisted && !userInfo?.blacklistInfo?.isExpired && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Account Temporarily Suspended
            </h2>
            <p className="text-gray-600">
              Your seller account has been temporarily suspended. Please review the notification above for more details.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 