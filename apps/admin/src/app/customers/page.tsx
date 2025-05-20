'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';

const customers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    type: 'Buyer',
    status: 'Active',
    joinDate: '2024-01-15',
    lastActive: '2024-03-10',
    totalOrders: 12,
    totalSpent: '$1,234.56',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    type: 'Seller',
    status: 'Active',
    joinDate: '2023-11-20',
    lastActive: '2024-03-09',
    totalOrders: 45,
    totalSpent: '$5,678.90',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@example.com',
    type: 'Both',
    status: 'Inactive',
    joinDate: '2023-09-05',
    lastActive: '2024-02-15',
    totalOrders: 8,
    totalSpent: '$890.12',
  },
];

const customerStats = [
  {
    name: 'Total Customers',
    value: '12,345',
    change: '+15.3%',
    changeType: 'positive',
  },
  {
    name: 'Active Buyers',
    value: '8,234',
    change: '+12.1%',
    changeType: 'positive',
  },
  {
    name: 'Active Sellers',
    value: '2,345',
    change: '+8.7%',
    changeType: 'positive',
  },
  {
    name: 'Average Order Value',
    value: '$234.56',
    change: '+5.2%',
    changeType: 'positive',
  },
];

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'buyer' | 'seller' | 'both'>('all');

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedType === 'all' ||
      (selectedType === 'buyer' && customer.type === 'Buyer') ||
      (selectedType === 'seller' && customer.type === 'Seller') ||
      (selectedType === 'both' && customer.type === 'Both');
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {customerStats.map((stat) => (
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

        {/* Filters and Search */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as 'all' | 'buyer' | 'seller' | 'both')}
                className="rounded-md border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="buyer">Buyers</option>
                <option value="seller">Sellers</option>
                <option value="both">Both</option>
              </select>
              <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                Export
              </button>
            </div>
          </div>
        </Card>

        {/* Customers Table */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                    Customer
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Type
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Join Date
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Last Active
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Orders
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Total Spent
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                      <div className="font-medium text-gray-900">
                        {customer.name}
                      </div>
                      <div className="text-gray-500">{customer.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {customer.type}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          customer.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {customer.joinDate}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {customer.lastActive}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {customer.totalOrders}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {customer.totalSpent}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
} 