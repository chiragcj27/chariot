'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/dashboard-layout';
import BlacklistDialog from '@/components/blacklist-dialog';
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
  isBlacklisted: boolean;
  blacklistReason?: string;
  blacklistedAt?: string;
  blacklistedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  blacklistExpiryDate?: string;
  reapplicationDate?: string;
  reapplicationReason?: string;
}

interface SellerStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  recentRegistrations: number;
  blacklisted: number;
}

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchSellers = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/sellers?page=${currentPage}&limit=10&status=${statusFilter}`);
      if (response.ok) {
        const data = await response.json();
        setSellers(data.sellers);
        setTotalPages(data.pagination.totalPages);
      } else {
        toast.error('Failed to fetch sellers');
      }
    } catch (error) {
      toast.error('Error fetching sellers');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchSellers();
    fetchStats();
  }, [fetchSellers]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/sellers/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const approveSeller = async (sellerId: string) => {
    try {
      const response = await fetch(`/api/admin/sellers/${sellerId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Seller approved successfully');
        fetchSellers();
        fetchStats();
      } else {
        toast.error('Failed to approve seller');
      }
    } catch (error) {
      toast.error('Error approving seller');
    }
  };

  const rejectSeller = async (sellerId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/sellers/${sellerId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        toast.success('Seller rejected successfully');
        fetchSellers();
        fetchStats();
      } else {
        toast.error('Failed to reject seller');
      }
    } catch (error) {
      toast.error('Error rejecting seller');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Sellers Management</h1>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blacklisted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-800">{stats.blacklisted}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recentRegistrations}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex space-x-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('all')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === 'approved' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('approved')}
          >
            Approved
          </Button>
          <Button
            variant={statusFilter === 'rejected' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('rejected')}
          >
            Rejected
          </Button>
        </div>

        {/* Sellers List */}
        <Card>
          <CardHeader>
            <CardTitle>Sellers</CardTitle>
          </CardHeader>
          <CardContent>
            {sellers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No sellers found.
              </div>
            ) : (
              <div className="space-y-4">
                {sellers.map((seller) => (
                  <div key={seller._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{seller.name}</h3>
                          <Badge 
                            variant={
                              seller.approvalStatus === 'approved' ? 'default' :
                              seller.approvalStatus === 'pending' ? 'secondary' : 'destructive'
                            }
                          >
                            {seller.approvalStatus}
                          </Badge>
                          {seller.isBlacklisted && (
                            <Badge variant="destructive">
                              {isExpired(seller.blacklistExpiryDate!) ? "Blacklist Expired" : "Blacklisted"}
                            </Badge>
                          )}
                          {seller.reapplicationDate && (
                            <Badge variant="outline">Reapplication Pending</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{seller.email}</p>
                        <p className="text-sm text-gray-600">Store: {seller.storeDetails.name}</p>
                        <p className="text-sm text-gray-600">Created: {formatDate(seller.createdAt)}</p>
                        
                        {seller.isBlacklisted && (
                          <div className="mt-2 p-2 bg-red-50 rounded">
                            <p className="text-xs font-medium text-red-800">Blacklist Reason: {seller.blacklistReason}</p>
                            <p className="text-xs text-red-700">
                              Blacklisted: {formatDate(seller.blacklistedAt!)} | 
                              Expires: {formatDate(seller.blacklistExpiryDate!)}
                            </p>
                            {seller.reapplicationReason && (
                              <p className="text-xs text-red-700 mt-1">
                                Reapplication: {seller.reapplicationReason}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {seller.approvalStatus === 'pending' && !seller.isBlacklisted && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => approveSeller(seller._id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => rejectSeller(seller._id, 'Policy violation')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {seller.approvalStatus === 'approved' && !seller.isBlacklisted && (
                          <BlacklistDialog
                            sellerId={seller._id}
                            sellerName={seller.name}
                            onSuccess={() => {
                              fetchSellers();
                              fetchStats();
                            }}
                            trigger={
                              <Button variant="destructive" size="sm">
                                Blacklist
                              </Button>
                            }
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 