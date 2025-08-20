'use client';

import React from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';

// Pseudo data for orders
const ordersData = [
  {
    id: 'P9451_358',
    date: 'October 17, 2022',
    price: '$8234.00',
    file: 'Download PDF',
    invoice: 'Download more'
  },
  {
    id: 'P9451_760',
    date: 'October 1, 2022',
    price: '$950.00',
    file: 'Download PDF',
    invoice: 'Download more'
  },
  {
    id: 'P9451_730',
    date: 'August 24, 2021',
    price: '$3341.00',
    file: 'Download PDF',
    invoice: 'Download more'
  },
  {
    id: 'P9451_581',
    date: 'August 12, 2021',
    price: '$950.00',
    file: 'Download PDF',
    invoice: 'Download more'
  }
];

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#FCA17A]">My Account</h1>
          </div>

          <div className="flex gap-8">
            {/* Left Sidebar */}
            <div className="w-64 bg-gray-100 p-6 rounded-lg">
              <h2 className="font-bold text-gray-900 mb-4">Account Name</h2>
              <nav className="space-y-2">
                <Link 
                  href="/profile" 
                  className="block text-gray-700 hover:text-[#FCA17A] font-medium"
                >
                  Account
                </Link>
                <Link 
                  href="/orders" 
                  className="block text-gray-700 bg-gray-200 px-3 py-2 rounded font-medium"
                >
                  Orders
                </Link>
                <button 
                  onClick={() => {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                  }}
                  className="block text-gray-700 hover:text-[#FCA17A] font-medium"
                >
                  Log Out
                </button>
              </nav>
            </div>

            {/* Right Content Area */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders History</h2>
              
              {/* Orders Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ordersData.map((order, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-[#FCA17A] hover:text-orange-600 font-medium">
                            {order.file}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-[#FCA17A] hover:text-orange-600 font-medium">
                            {order.invoice}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}