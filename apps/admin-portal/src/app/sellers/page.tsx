'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { toast } from 'react-hot-toast';

interface Seller {
  _id: string;
  name: string;
  email: string;
  storeDetails: {
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
  };
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

interface SellerStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  recentRegistrations: number;
}

export default function SellersPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingSeller, setRejectingSeller] = useState<string | null>(null);

  useEffect(() => {
    fetchSellers();
    fetchStats();
  }, [activeTab]);

  const fetchSellers = async () => {
    try {
      const response = await fetch(`/api/admin/sellers?status=${activeTab}`);
      const data = await response.json();
      if (response.ok) {
        setSellers(data.sellers || []);
      } else {
        toast.error('Failed to fetch sellers');
      }
    } catch (error) {
      toast.error('Failed to fetch sellers');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/sellers/stats');
      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const handleApprove = async (sellerId: string) => {
    try {
      const response = await fetch(`/api/admin/sellers/${sellerId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Seller approved successfully!');
        fetchSellers();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to approve seller');
      }
    } catch (error) {
      toast.error('Failed to approve seller');
    }
  };

  const handleReject = async (sellerId: string) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const response = await fetch(`/api/admin/sellers/${sellerId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Seller rejected successfully!');
        setRejectReason('');
        setRejectingSeller(null);
        fetchSellers();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to reject seller');
      }
    } catch (error) {
      toast.error('Failed to reject seller');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Seller Management</h1>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Total Sellers</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="mt-1 text-3xl font-semibold text-yellow-600">{stats.pending}</p>
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="mt-1 text-3xl font-semibold text-green-600">{stats.approved}</p>
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="mt-1 text-3xl font-semibold text-red-600">{stats.rejected}</p>
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Recent (30d)</p>
                <p className="mt-1 text-3xl font-semibold text-blue-600">{stats.recentRegistrations}</p>
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {(['pending', 'approved', 'rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Sellers
              </button>
            ))}
          </nav>
        </div>

        {/* Sellers Table */}
        <Card className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading sellers...</p>
            </div>
          ) : sellers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No {activeTab} sellers found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                      Seller
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Store Details
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Registered
                    </th>
                    {activeTab === 'pending' && (
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sellers.map((seller) => (
                    <tr key={seller._id}>
                      <td className="py-4 pl-4 pr-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{seller.name}</p>
                          <p className="text-sm text-gray-500">{seller.email}</p>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{seller.storeDetails.name}</p>
                          <p className="text-sm text-gray-500">{seller.storeDetails.phone}</p>
                          <p className="text-sm text-gray-500">{seller.storeDetails.address}</p>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        {getStatusBadge(seller.approvalStatus)}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {new Date(seller.createdAt).toLocaleDateString()}
                      </td>
                      {activeTab === 'pending' && (
                        <td className="px-3 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(seller._id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectingSeller(seller._id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Reject Modal */}
        {rejectingSeller && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Seller</h3>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => {
                      setRejectingSeller(null);
                      setRejectReason('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(rejectingSeller)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 