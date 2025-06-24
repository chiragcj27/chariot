'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { toast } from 'react-hot-toast';

interface BlacklistedSeller {
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
  isBlacklisted: boolean;
  blacklistReason: string;
  blacklistedAt: string;
  blacklistedBy: {
    _id: string;
    name: string;
    email: string;
  };
  blacklistExpiryDate: string;
  reapplicationDate?: string;
  reapplicationReason?: string;
}

interface BlacklistStats {
  totalBlacklisted: number;
  totalSellers: number;
  blacklistPercentage: string;
  pendingReapplications: number;
  expiredBlacklist: number;
}

export default function BlacklistPage() {
  const [blacklistedSellers, setBlacklistedSellers] = useState<BlacklistedSeller[]>([]);
  const [stats, setStats] = useState<BlacklistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBlacklistedSellers();
    fetchBlacklistStats();
  }, [currentPage]);

  const fetchBlacklistedSellers = async () => {
    try {
      const response = await fetch(`/api/admin/blacklist?page=${currentPage}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setBlacklistedSellers(data.sellers);
        setTotalPages(data.pagination.totalPages);
      } else {
        toast.error('Failed to fetch blacklisted sellers');
      }
    } catch (error) {
      toast.error('Error fetching blacklisted sellers');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlacklistStats = async () => {
    try {
      const response = await fetch('/api/admin/blacklist/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching blacklist stats:', error);
    }
  };

  const removeFromBlacklist = async (sellerId: string) => {
    try {
      const response = await fetch(`/api/admin/blacklist/${sellerId}/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Seller removed from blacklist successfully');
        fetchBlacklistedSellers();
        fetchBlacklistStats();
      } else {
        toast.error('Failed to remove seller from blacklist');
      }
    } catch (error) {
      toast.error('Error removing seller from blacklist');
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
          <h1 className="text-3xl font-bold">Blacklisted Sellers</h1>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Blacklisted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBlacklisted}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blacklist %</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.blacklistPercentage}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reapplications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingReapplications}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expired Blacklists</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.expiredBlacklist}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSellers}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Blacklisted Sellers List */}
        <Card>
          <CardHeader>
            <CardTitle>Blacklisted Sellers</CardTitle>
          </CardHeader>
          <CardContent>
            {blacklistedSellers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No blacklisted sellers found.
              </div>
            ) : (
              <div className="space-y-4">
                {blacklistedSellers.map((seller) => (
                  <div key={seller._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{seller.name}</h3>
                          <Badge variant={isExpired(seller.blacklistExpiryDate) ? "destructive" : "secondary"}>
                            {isExpired(seller.blacklistExpiryDate) ? "Expired" : "Active"}
                          </Badge>
                          {seller.reapplicationDate && (
                            <Badge variant="outline">Reapplication Pending</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{seller.email}</p>
                        <p className="text-sm text-gray-600">Store: {seller.storeDetails.name}</p>
                        <p className="text-sm text-gray-600">
                          <strong>Reason:</strong> {seller.blacklistReason}
                        </p>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>Blacklisted: {formatDate(seller.blacklistedAt)}</p>
                          <p>Expires: {formatDate(seller.blacklistExpiryDate)}</p>
                          <p>By: {seller.blacklistedBy?.name || 'Unknown'}</p>
                          {seller.reapplicationDate && (
                            <p>Reapplication: {formatDate(seller.reapplicationDate)}</p>
                          )}
                        </div>
                        {seller.reapplicationReason && (
                          <div className="mt-2 p-2 bg-blue-50 rounded">
                            <p className="text-xs font-medium text-blue-800">Reapplication Reason:</p>
                            <p className="text-xs text-blue-700">{seller.reapplicationReason}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromBlacklist(seller._id)}
                        >
                          Remove from Blacklist
                        </Button>
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