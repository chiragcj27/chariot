'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';

const pricingPlans = [
  {
    name: 'Basic',
    price: '$29',
    features: [
      'Up to 100 products',
      'Basic analytics',
      'Email support',
      '24/7 support',
    ],
  },
  {
    name: 'Professional',
    price: '$79',
    features: [
      'Up to 1000 products',
      'Advanced analytics',
      'Priority support',
      'API access',
      'Custom domain',
    ],
  },
  {
    name: 'Enterprise',
    price: '$299',
    features: [
      'Unlimited products',
      'Custom analytics',
      'Dedicated support',
      'API access',
      'Custom domain',
      'White-label solution',
    ],
  },
];

const discounts = [
  {
    code: 'SUMMER2024',
    type: 'Percentage',
    value: '20%',
    validUntil: '2024-08-31',
    usage: '234/1000',
  },
  {
    code: 'WELCOME10',
    type: 'Fixed',
    value: '$10',
    validUntil: '2024-12-31',
    usage: '89/500',
  },
  {
    code: 'FLASH25',
    type: 'Percentage',
    value: '25%',
    validUntil: '2024-06-30',
    usage: '45/200',
  },
];

export default function Pricing() {
  const [activeTab, setActiveTab] = useState<'plans' | 'discounts'>('plans');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Pricing & Discounts
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'plans'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Pricing Plans
            </button>
            <button
              onClick={() => setActiveTab('discounts')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'discounts'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Discounts
            </button>
          </div>
        </div>

        {activeTab === 'plans' ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <Card key={plan.name} className="p-6">
                <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                <p className="mt-4 text-3xl font-bold text-gray-900">
                  {plan.price}
                  <span className="text-base font-normal text-gray-500">
                    /month
                  </span>
                </p>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <svg
                        className="h-6 w-6 flex-shrink-0 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-8 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                  Edit Plan
                </button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                Active Discounts
              </h2>
              <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                Create Discount
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                      Code
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Type
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Value
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Valid Until
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Usage
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {discounts.map((discount) => (
                    <tr key={discount.code}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                        {discount.code}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {discount.type}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {discount.value}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {discount.validUntil}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {discount.usage}
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
        )}
      </div>
    </DashboardLayout>
  );
} 