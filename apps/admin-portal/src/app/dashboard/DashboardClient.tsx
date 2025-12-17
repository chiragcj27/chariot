'use client';

import { Card } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/dashboard-layout';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { JwtPayload } from 'jsonwebtoken';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Package } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface AnalyticsStats {
  totalSales: {
    value: number;
    change: number;
    changeType: 'positive' | 'negative';
  };
  activeSellers: {
    value: number;
    change: number;
    changeType: 'positive' | 'negative';
  };
  activeBuyers: {
    value: number;
    change: number;
    changeType: 'positive' | 'negative';
  };
  avgOrderValue: {
    value: number;
    change: number;
    changeType: 'positive' | 'negative';
  };
}

interface AnalyticsData {
  stats: AnalyticsStats;
  salesOverTime: Array<{ label: string; value: number }>;
  salesByCategory: Array<{ category: string; total: number; count: number }>;
  topSellers: Array<{
    sellerId: string;
    sellerName: string;
    totalSales: number;
    orderCount: number;
    productCount: number;
  }>;
}

interface PendingSeller {
  _id: string;
  name: string;
  email: string;
  storeDetails: {
    name: string;
  };
  createdAt: string;
}

interface PendingBuyer {
  _id: string;
  name: string;
  email: string;
  companyInformation: {
    name: string;
  };
  contactInformation: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

const getChartColors = () => {
  return [
    'rgba(99, 102, 241, 1)',   // indigo
    'rgba(236, 72, 153, 1)',   // pink
    'rgba(251, 146, 60, 1)',   // orange
    'rgba(34, 197, 94, 1)',    // green
    'rgba(59, 130, 246, 1)',   // blue
    'rgba(168, 85, 247, 1)',   // purple
  ];
};

export default function DashboardClient({ user }: { user: JwtPayload | null }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [pendingSellers, setPendingSellers] = useState<PendingSeller[]>([]);
  const [pendingBuyers, setPendingBuyers] = useState<PendingBuyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch analytics
        const analyticsResponse = await fetch('/api/admin/analytics');
        if (!analyticsResponse.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);

        // Fetch pending sellers
        const sellersResponse = await fetch('/api/admin/sellers/pending');
        if (sellersResponse.ok) {
          const sellersData = await sellersResponse.json();
          setPendingSellers(sellersData.sellers || []);
        }

        // Fetch pending buyers
        const buyersResponse = await fetch('/api/admin/buyers/pending');
        if (buyersResponse.ok) {
          const buyersData = await buyersResponse.json();
          setPendingBuyers(buyersData.buyers || []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const salesData = analytics
    ? {
        labels: analytics.salesOverTime.map((item) => item.label),
        datasets: [
          {
            label: 'Sales',
            data: analytics.salesOverTime.map((item) => item.value),
            borderColor: 'rgba(99, 102, 241, 1)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: 'rgba(99, 102, 241, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
          },
        ],
      }
    : {
        labels: [],
        datasets: [],
      };

  const categoryData = analytics
    ? {
        labels: analytics.salesByCategory.map((item) => item.category),
        datasets: [
          {
            data: analytics.salesByCategory.map((item) => item.total),
            backgroundColor: getChartColors(),
            borderWidth: 2,
            borderColor: '#fff',
          },
        ],
      }
    : {
        labels: [],
        datasets: [],
      };

  const stats = analytics
    ? [
        {
          name: 'Total Sales',
          value: formatCurrency(analytics.stats.totalSales.value),
          change: `${analytics.stats.totalSales.change >= 0 ? '+' : ''}${analytics.stats.totalSales.change.toFixed(1)}%`,
          changeType: analytics.stats.totalSales.changeType,
          icon: DollarSign,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50',
        },
        {
          name: 'Active Sellers',
          value: formatNumber(analytics.stats.activeSellers.value),
          change: `${analytics.stats.activeSellers.change >= 0 ? '+' : ''}${analytics.stats.activeSellers.change.toFixed(1)}%`,
          changeType: analytics.stats.activeSellers.changeType,
          icon: Users,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
        },
        {
          name: 'Active Buyers',
          value: formatNumber(analytics.stats.activeBuyers.value),
          change: `${analytics.stats.activeBuyers.change >= 0 ? '+' : ''}${analytics.stats.activeBuyers.change.toFixed(1)}%`,
          changeType: analytics.stats.activeBuyers.changeType,
          icon: ShoppingCart,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        },
        {
          name: 'Average Order Value',
          value: formatCurrency(analytics.stats.avgOrderValue.value),
          change: `${analytics.stats.avgOrderValue.change >= 0 ? '+' : ''}${analytics.stats.avgOrderValue.change.toFixed(1)}%`,
          changeType: analytics.stats.avgOrderValue.changeType,
          icon: Package,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
        },
      ]
    : [];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-6 bg-red-50 border-red-200">
            <p className="text-red-800 font-medium">Error loading dashboard</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.email || 'Admin'}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.name} className="p-6 hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className={`inline-flex p-3 rounded-lg ${stat.bgColor} mb-4`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                    <div className="flex items-center gap-1">
                      {stat.changeType === 'positive' ? (
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          stat.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500">vs last month</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-6 border-0 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Sales Overview</h2>
              <span className="text-sm text-gray-500">Last 6 months</span>
            </div>
            <div className="h-80">
              {analytics && analytics.salesOverTime.length > 0 ? (
                <Line
                  data={salesData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 },
                        callbacks: {
                          label: (context) => formatCurrency(context.parsed.y),
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => formatCurrency(value as number),
                        },
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)',
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No sales data available
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Sales by Category</h2>
            </div>
            <div className="h-80">
              {analytics && analytics.salesByCategory.length > 0 ? (
                <>
                  <Doughnut
                    data={categoryData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 15,
                            font: { size: 12 },
                          },
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          padding: 12,
                          callbacks: {
                            label: (context) => {
                              const label = context.label || '';
                              const value = formatCurrency(context.parsed);
                              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                              const percentage = ((context.parsed / total) * 100).toFixed(1);
                              return `${label}: ${value} (${percentage}%)`;
                            },
                          },
                        },
                      },
                    }}
                  />
                  <div className="mt-4 space-y-2">
                    {analytics.salesByCategory.slice(0, 3).map((category, index) => (
                      <div key={category.category} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getChartColors()[index] }}
                          />
                          <span className="text-gray-700">{category.category}</span>
                        </div>
                        <span className="font-semibold text-gray-900">{formatCurrency(category.total)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No category data available
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Top Sellers */}
        {analytics && analytics.topSellers.length > 0 && (
          <Card className="p-6 border-0 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Top Sellers</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Total Sales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Products
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.topSellers.map((seller, index) => (
                    <tr key={seller.sellerId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-semibold text-sm">
                              {index + 1}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{seller.sellerName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(seller.totalSales)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{formatNumber(seller.orderCount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{formatNumber(seller.productCount)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Pending Approvals */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {pendingSellers.length > 0 && (
            <Card className="p-6 border-0 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Pending Seller Approvals</h2>
                <Link
                  href="/sellers"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  View all →
                </Link>
              </div>
              <div className="space-y-3">
                {pendingSellers.slice(0, 5).map((seller) => (
                  <div
                    key={seller._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{seller.name}</p>
                      <p className="text-xs text-gray-500">{seller.storeDetails.name}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(seller.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {pendingSellers.length > 5 && (
                  <div className="pt-2 text-center">
                    <Link
                      href="/sellers"
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      View {pendingSellers.length - 5} more →
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          )}

          {pendingBuyers.length > 0 && (
            <Card className="p-6 border-0 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Pending Buyer Approvals</h2>
                <Link
                  href="/buyers"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  View all →
                </Link>
              </div>
              <div className="space-y-3">
                {pendingBuyers.slice(0, 5).map((buyer) => (
                  <div
                    key={buyer._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {buyer.contactInformation?.firstName || 'N/A'}{' '}
                        {buyer.contactInformation?.lastName || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">{buyer.companyInformation?.name || 'N/A'}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(buyer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {pendingBuyers.length > 5 && (
                  <div className="pt-2 text-center">
                    <Link
                      href="/buyers"
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      View {pendingBuyers.length - 5} more →
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
