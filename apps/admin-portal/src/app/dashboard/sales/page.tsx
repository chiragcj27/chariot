'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/dashboard-layout';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface SellerAnalytics {
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  storeName: string;
  totalSales: number;
  totalRevenue: number;
  totalCommission: number;
  sellerEarnings: number;
  platformEarnings: number;
  orderCount: number;
  averageOrderValue: number;
  productCount: number;
}

interface AnalyticsResponse {
  sellerAnalytics: SellerAnalytics[];
  summary: {
    totalSellers: number;
    totalRevenue: number;
    totalCommission: number;
    totalSellerEarnings: number;
    totalPlatformEarnings: number;
  };
}

export default function SellerSalesAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [sortBy, setSortBy] = useState<'revenue' | 'sales' | 'earnings'>('revenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/seller-analytics?period=${period}`);

      if (response.ok) {
        const data: AnalyticsResponse = await response.json();
        setAnalytics(data);
      } else {
        console.error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const sortedAnalytics = analytics?.sellerAnalytics
    ? [...analytics.sellerAnalytics].sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'revenue':
            comparison = a.totalRevenue - b.totalRevenue;
            break;
          case 'sales':
            comparison = a.totalSales - b.totalSales;
            break;
          case 'earnings':
            comparison = a.sellerEarnings - b.sellerEarnings;
            break;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      })
    : [];

  // Prepare chart data
  const topSellersData = sortedAnalytics.slice(0, 10);
  // Helper function to get display name (prefer storeName, fallback to sellerName, avoid "N/A")
  const getDisplayName = (seller: SellerAnalytics) => {
    if (seller.storeName && seller.storeName !== 'N/A') {
      return seller.storeName;
    }
    return seller.sellerName || 'Unknown';
  };

  const revenueChartData = {
    labels: topSellersData.map(getDisplayName),
    datasets: [
      {
        label: 'Total Revenue',
        data: topSellersData.map((s) => s.totalRevenue),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const earningsChartData = {
    labels: topSellersData.map(getDisplayName),
    datasets: [
      {
        label: 'Seller Earnings',
        data: topSellersData.map((s) => s.sellerEarnings),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Platform Earnings',
        data: topSellersData.map((s) => s.platformEarnings),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
  };

  const revenueDistributionData = {
    labels: topSellersData.map(getDisplayName),
    datasets: [
      {
        data: topSellersData.map((s) => s.totalRevenue),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">No analytics data available</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Seller-Wise Sales Analytics</h1>
            <p className="text-gray-600">Comprehensive sales analytics by seller</p>
          </div>
          
          <Select value={period} onValueChange={(value: 'day' | 'week' | 'month' | 'year') => setPeriod(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
              <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.totalSellers}</div>
              <p className="text-xs text-muted-foreground">Active sellers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${analytics.summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Gross revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Seller Earnings</CardTitle>
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${analytics.summary.totalSellerEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Total seller earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Earnings</CardTitle>
              <ChartBarIcon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${analytics.summary.totalPlatformEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Platform commission</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
              <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${analytics.summary.totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Commission collected</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Sellers by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Bar
                  data={revenueChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => `$${context.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => `$${Number(value).toLocaleString()}`,
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Earnings Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Bar
                  data={earningsChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (context) => `$${context.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => `$${Number(value).toLocaleString()}`,
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Seller Performance Details</CardTitle>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(value: 'revenue' | 'sales' | 'earnings') => setSortBy(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="earnings">Earnings</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <ArrowTrendingUpIcon className="h-4 w-4" /> : <ArrowTrendingDownIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {sortedAnalytics.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Rank</th>
                      <th className="text-left py-3 px-4 font-medium">Seller</th>
                      <th className="text-left py-3 px-4 font-medium">Store</th>
                      <th className="text-left py-3 px-4 font-medium">Total Sales</th>
                      <th className="text-left py-3 px-4 font-medium">Total Revenue</th>
                      <th className="text-left py-3 px-4 font-medium">Seller Earnings</th>
                      <th className="text-left py-3 px-4 font-medium">Platform Earnings</th>
                      <th className="text-left py-3 px-4 font-medium">Orders</th>
                      <th className="text-left py-3 px-4 font-medium">Avg Order Value</th>
                      <th className="text-left py-3 px-4 font-medium">Products</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAnalytics.map((seller, index) => (
                      <tr key={seller.sellerId} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Badge variant="outline">#{index + 1}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{seller.sellerName}</div>
                            <div className="text-sm text-gray-500">{seller.sellerEmail}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{seller.storeName}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{seller.totalSales}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">
                            ${seller.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-green-600">
                            ${seller.sellerEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-blue-600">
                            ${seller.platformEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{seller.orderCount}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">
                            ${seller.averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{seller.productCount}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No sales data</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No sales records found for the selected period.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Distribution Chart */}
        {topSellersData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Revenue Distribution (Top 10 Sellers)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Doughnut
                  data={revenueDistributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: $${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${percentage}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

