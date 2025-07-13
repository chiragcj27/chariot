'use client';

import { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import BlacklistNotification from '@/components/blacklist-notification';

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
  });
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user info from localStorage or context
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserInfo(user);
        }

        // Only fetch stats if not blacklisted or if blacklist has expired
        const shouldFetchStats = !userInfo?.isBlacklisted || 
          (userInfo?.blacklistInfo?.isExpired && userInfo?.isBlacklisted);
        
        if (shouldFetchStats) {
          const response = await fetch('/api/dashboard/stats');
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userInfo?.isBlacklisted, userInfo?.blacklistInfo?.isExpired]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      {/* Blacklist Notification */}
      {userInfo?.isBlacklisted && userInfo.blacklistInfo && (
        <BlacklistNotification
          blacklistInfo={userInfo.blacklistInfo}
          sellerId={userInfo.id}
          sellerName={userInfo.name}
        />
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