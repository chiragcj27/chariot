'use client';

import React from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-400 to-orange-600 px-6 py-8">
              <h1 className="text-3xl font-bold text-white">My Orders</h1>
              <p className="text-orange-100 mt-2">Track your order history and status</p>
            </div>

            {/* Content */}
            <div className="px-6 py-8">
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                <p className="text-gray-600 mb-6">You haven&apos;t placed any orders yet. Start shopping to see your order history here.</p>
                <Link
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  Start Shopping
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 