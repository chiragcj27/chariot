'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
 Legend
);

const campaigns = [
  {
    name: 'Summer Sale 2024',
    status: 'Active',
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    budget: '$10,000',
    spent: '$4,500',
    impressions: '234,567',
    clicks: '12,345',
    conversions: '234',
  },
  {
    name: 'Back to School',
    status: 'Scheduled',
    startDate: '2024-08-15',
    endDate: '2024-09-15',
    budget: '$5,000',
    spent: '$0',
    impressions: '0',
    clicks: '0',
    conversions: '0',
  },
  {
    name: 'Holiday Special',
    status: 'Completed',
    startDate: '2023-12-01',
    endDate: '2023-12-31',
    budget: '$15,000',
    spent: '$15,000',
    impressions: '567,890',
    clicks: '45,678',
    conversions: '1,234',
  },
];

const performanceData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Impressions',
      data: [30000, 45000, 35000, 50000, 49000, 60000],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    },
    {
      label: 'Clicks',
      data: [1500, 2500, 2000, 3000, 2800, 3500],
      borderColor: 'rgb(255, 99, 132)',
      tension: 0.1,
    },
    {
      label: 'Conversions',
      data: [100, 150, 120, 180, 160, 200],
      borderColor: 'rgb(54, 162, 235)',
      tension: 0.1,
    },
  ],
};

export default function Marketing() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'analytics'>('campaigns');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Marketing</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'campaigns'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Campaigns
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {activeTab === 'campaigns' ? (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                Marketing Campaigns
              </h2>
              <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                Create Campaign
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                      Campaign
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Dates
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Budget
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Performance
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.name}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                        {campaign.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            campaign.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : campaign.status === 'Scheduled'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {campaign.startDate} - {campaign.endDate}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {campaign.spent} / {campaign.budget}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="space-y-1">
                          <div>Impressions: {campaign.impressions}</div>
                          <div>Clicks: {campaign.clicks}</div>
                          <div>Conversions: {campaign.conversions}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Campaign Performance
              </h2>
              <div className="h-96">
                <Line
                  data={performanceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                    },
                  }}
                />
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="p-6">
                <h3 className="text-sm font-medium text-gray-500">
                  Total Impressions
                </h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  1,234,567
                </p>
                <p className="mt-2 text-sm text-green-600">+12.5% from last month</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium text-gray-500">
                  Total Clicks
                </h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900">45,678</p>
                <p className="mt-2 text-sm text-green-600">+8.2% from last month</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium text-gray-500">
                  Total Conversions
                </h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900">1,234</p>
                <p className="mt-2 text-sm text-green-600">+15.3% from last month</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium text-gray-500">
                  Conversion Rate
                </h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900">2.7%</p>
                <p className="mt-2 text-sm text-green-600">+0.5% from last month</p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 