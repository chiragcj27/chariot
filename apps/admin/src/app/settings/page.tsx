'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';

const settings = {
  general: {
    siteName: 'Chariot Marketplace',
    siteDescription: 'Your trusted marketplace for buying and selling',
    contactEmail: 'support@chariot.com',
    supportPhone: '+1 (555) 123-4567',
  },
  payment: {
    currency: 'USD',
    paymentMethods: ['Credit Card', 'PayPal', 'Bank Transfer'],
    commissionRate: '5%',
    minimumPayout: '$100',
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    marketingEmails: false,
  },
  security: {
    twoFactorAuth: true,
    sessionTimeout: '30 minutes',
    passwordExpiry: '90 days',
    ipWhitelist: ['192.168.1.1', '10.0.0.1'],
  },
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState<
    'general' | 'payment' | 'notifications' | 'security'
  >('general');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Master Settings</h1>

        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'general'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'payment'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Payment
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'notifications'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'security'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Security
          </button>
        </div>

        <Card className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.general.siteName}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Site Description
                </label>
                <textarea
                  value={settings.general.siteDescription}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.general.contactEmail}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Support Phone
                </label>
                <input
                  type="tel"
                  value={settings.general.supportPhone}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <select
                  value={settings.payment.currency}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Payment Methods
                </label>
                <div className="mt-2 space-y-2">
                  {settings.payment.paymentMethods.map((method) => (
                    <div key={method} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={true}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        {method}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Commission Rate
                </label>
                <input
                  type="text"
                  value={settings.payment.commissionRate}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Minimum Payout
                </label>
                <input
                  type="text"
                  value={settings.payment.minimumPayout}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email Notifications
                  </label>
                  <p className="text-sm text-gray-500">
                    Receive notifications via email
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.emailNotifications}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    SMS Notifications
                  </label>
                  <p className="text-sm text-gray-500">
                    Receive notifications via SMS
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.smsNotifications}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Order Updates
                  </label>
                  <p className="text-sm text-gray-500">
                    Receive notifications for order updates
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.orderUpdates}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Marketing Emails
                  </label>
                  <p className="text-sm text-gray-500">
                    Receive marketing and promotional emails
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.marketingEmails}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Two-Factor Authentication
                  </label>
                  <p className="text-sm text-gray-500">
                    Require 2FA for admin access
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.security.twoFactorAuth}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Session Timeout
                </label>
                <select
                  value={settings.security.sessionTimeout}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="15 minutes">15 minutes</option>
                  <option value="30 minutes">30 minutes</option>
                  <option value="1 hour">1 hour</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password Expiry
                </label>
                <select
                  value={settings.security.passwordExpiry}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="30 days">30 days</option>
                  <option value="60 days">60 days</option>
                  <option value="90 days">90 days</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  IP Whitelist
                </label>
                <textarea
                  value={settings.security.ipWhitelist.join('\n')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter one IP address per line
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              Save Changes
            </button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
} 