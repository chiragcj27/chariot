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
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { JwtPayload } from 'jsonwebtoken';
import { useEffect } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const stats = [
  {
    name: 'Total Sales',
    value: '$45,231.89',
    change: '+20.1%',
    changeType: 'positive',
  },
  {
    name: 'Active Sellers',
    value: '2,338',
    change: '+12.5%',
    changeType: 'positive',
  },
  {
    name: 'Active Buyers',
    value: '12,234',
    change: '+8.2%',
    changeType: 'positive',
  },
  {
    name: 'Average Order Value',
    value: '$234.00',
    change: '-2.3%',
    changeType: 'negative',
  },
];

const salesData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Sales',
      data: [30, 40, 35, 50, 49, 60],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    },
  ],
};

const categoryData = {
  labels: ['Electronics', 'Fashion', 'Home', 'Sports', 'Others'],
  datasets: [
    {
      data: [30, 25, 20, 15, 10],
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 206, 86)',
        'rgb(75, 192, 192)',
        'rgb(153, 102, 255)',
      ],
    },
  ],
};

export default function DashboardClient({ user }: { user: JwtPayload | null }) {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        {user && (
          <div className="mb-4 p-4 bg-gray-100 rounded">
            <p className="text-sm text-gray-700">Email: {user.email}</p>
            <p className="text-sm text-gray-700">Role: {user.role}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`rounded-full px-2.5 py-0.5 text-sm font-medium ${
                    stat.changeType === 'positive'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {stat.change}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-lg font-medium text-gray-900">Sales Overview</h2>
            <div className="mt-4 h-80">
              <Line
                data={salesData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-medium text-gray-900">
              Sales by Category
            </h2>
            <div className="mt-4 h-80">
              <Doughnut
                data={categoryData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </Card>
        </div>

        {/* Top Sellers */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Top Sellers</h2>
          <div className="mt-4">
            <div className="flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                          Seller
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Total Sales
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Products
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Rating
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[
                        {
                          name: 'Tech Store',
                          sales: '$12,345',
                          products: 234,
                          rating: '4.8',
                        },
                        {
                          name: 'Fashion Hub',
                          sales: '$10,234',
                          products: 156,
                          rating: '4.6',
                        },
                        {
                          name: 'Home Goods',
                          sales: '$8,765',
                          products: 98,
                          rating: '4.9',
                        },
                      ].map((seller) => (
                        <tr key={seller.name}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                            {seller.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {seller.sales}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {seller.products}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {seller.rating}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
} 