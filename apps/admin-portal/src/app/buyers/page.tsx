'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { toast } from 'react-hot-toast';

interface Buyer {
  _id: string;
  name?: string;
  email?: string;
  companyInformation?: {
    name?: string;
    address?: string;
    country?: string;
    state?: string;
    zipcode?: string;
    websiteUrl?: string;
  };
  contactInformation?: {
    firstName?: string;
    lastName?: string;
    position?: string;
    email?: string;
    telephone?: string[];
  };
  otherInformation?: {
    primaryMarketSegment?: string;
    buyingOrganization?: string;
    TaxId?: string;
    JBT_id?: string;
    DUNN?: string;
  };
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  approvedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  rejectedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  userAccountId?: string;
}

interface BuyerStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  recentRegistrations: number;
}

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [stats, setStats] = useState<BuyerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchBuyers = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/buyers?page=${currentPage}&limit=10&status=${statusFilter}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Filter out any buyers with missing data and ensure unique IDs
        const validBuyers = (data.buyers || [])
          .filter((buyer: Buyer) => {
            return buyer && buyer._id && buyer.approvalStatus;
          })
          .filter((buyer: Buyer, index: number, self: Buyer[]) => {
            // Remove duplicates based on _id
            return index === self.findIndex(b => b._id === buyer._id);
          });
        
        setBuyers(validBuyers);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        toast.error('Failed to fetch buyers');
      }
    } catch (error) {
      toast.error('Error fetching buyers');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchBuyers();
    fetchStats();
  }, [fetchBuyers]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/buyers/stats');
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const approveBuyer = async (buyerId: string) => {
    try {
      const response = await fetch(`/api/admin/buyers/${buyerId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Buyer approved successfully');
        fetchBuyers();
        fetchStats();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to approve buyer');
      }
    } catch (error) {
      toast.error('Error approving buyer');
    }
  };

  const rejectBuyer = async (buyerId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/buyers/${buyerId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        toast.success('Buyer rejected successfully');
        fetchBuyers();
        fetchStats();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to reject buyer');
      }
    } catch (error) {
      toast.error('Error rejecting buyer');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading buyers...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Buyer Management</h1>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Buyers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
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
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <Button
                onClick={() => {
                  setCurrentPage(1);
                  fetchBuyers();
                }}
                className="px-4 py-2"
              >
                Refresh
              </Button>


            </div>
          </CardContent>
        </Card>

        {/* Buyers List */}
        <Card>
          <CardHeader>
            <CardTitle>Buyers</CardTitle>
          </CardHeader>
          <CardContent>
            {buyers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No buyers found with the selected criteria.
              </div>
            ) : (
              <div className="space-y-4">
                {buyers.map((buyer, index) => (
                  <div
                    key={`${buyer._id}-${index}`}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                                                 <div className="flex items-center gap-3 mb-2">
                           <h3 className="font-medium text-gray-900">
                             {buyer.contactInformation?.firstName || 'N/A'} {buyer.contactInformation?.lastName || 'N/A'}
                           </h3>
                           {getStatusBadge(buyer.approvalStatus)}
                         </div>
                                                 <div className="text-sm text-gray-600 space-y-1">
                           <p><strong>Company:</strong> {buyer.companyInformation?.name || 'N/A'}</p>
                           <p><strong>Email:</strong> {buyer.contactInformation?.email || 'N/A'}</p>
                           <p><strong>Position:</strong> {buyer.contactInformation?.position || 'N/A'}</p>
                           <p><strong>Market Segment:</strong> {buyer.otherInformation?.primaryMarketSegment || 'N/A'}</p>
                           <p><strong>Registered:</strong> {formatDate(buyer.createdAt)}</p>
                           {buyer.userAccountId && (
                             <div><strong>Account ID:</strong> {buyer.userAccountId}</div>
                           )}
                           {buyer.approvalStatus === 'approved' && buyer.approvedAt && (
                             <div><strong>Approved:</strong> {formatDate(buyer.approvedAt)}</div>
                           )}
                           {buyer.approvalStatus === 'rejected' && buyer.rejectionReason && (
                             <div><strong>Rejection Reason:</strong> {buyer.rejectionReason}</div>
                           )}
                         </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBuyer(buyer);
                            setShowDetails(true);
                          }}
                        >
                          View Details
                        </Button>
                        {buyer.approvalStatus === 'pending' && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => approveBuyer(buyer._id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const reason = prompt('Please provide a reason for rejection:');
                                if (reason) {
                                  rejectBuyer(buyer._id, reason);
                                }
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Buyer Details Modal */}
        {showDetails && selectedBuyer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Buyer Details</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                >
                  Close
                </Button>
              </div>
              
              <div className="space-y-6">
                                 {/* Contact Information */}
                 <div>
                   <h3 className="font-medium text-gray-900 mb-2">Contact Information</h3>
                   <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                     <p><strong>Name:</strong> {selectedBuyer.contactInformation?.firstName || 'N/A'} {selectedBuyer.contactInformation?.lastName || 'N/A'}</p>
                     <p><strong>Email:</strong> {selectedBuyer.contactInformation?.email || 'N/A'}</p>
                     <p><strong>Position:</strong> {selectedBuyer.contactInformation?.position || 'N/A'}</p>
                     <p><strong>Phone:</strong> {selectedBuyer.contactInformation?.telephone?.join(', ') || 'N/A'}</p>
                   </div>
                 </div>

                 {/* Company Information */}
                 <div>
                   <h3 className="font-medium text-gray-900 mb-2">Company Information</h3>
                   <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                     <p><strong>Company Name:</strong> {selectedBuyer.companyInformation?.name || 'N/A'}</p>
                     <div><strong>Website:</strong> {selectedBuyer.companyInformation?.websiteUrl ? (
                       <a href={selectedBuyer.companyInformation.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedBuyer.companyInformation.websiteUrl}</a>
                     ) : 'N/A'}</div>
                     <p><strong>Address:</strong> {selectedBuyer.companyInformation?.address || 'N/A'}</p>
                     <p><strong>Location:</strong> {selectedBuyer.companyInformation?.state || 'N/A'}, {selectedBuyer.companyInformation?.zipcode || 'N/A'}, {selectedBuyer.companyInformation?.country || 'N/A'}</p>
                   </div>
                 </div>

                 {/* Business Information */}
                 <div>
                   <h3 className="font-medium text-gray-900 mb-2">Business Information</h3>
                   <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                     <p><strong>Market Segment:</strong> {selectedBuyer.otherInformation?.primaryMarketSegment || 'N/A'}</p>
                     <p><strong>Buying Organization:</strong> {selectedBuyer.otherInformation?.buyingOrganization || 'N/A'}</p>
                     <p><strong>Tax ID:</strong> {selectedBuyer.otherInformation?.TaxId || 'N/A'}</p>
                     <p><strong>JBT ID:</strong> {selectedBuyer.otherInformation?.JBT_id || 'N/A'}</p>
                     <p><strong>DUNS Number:</strong> {selectedBuyer.otherInformation?.DUNN || 'N/A'}</p>
                   </div>
                 </div>

                {/* Approval Information */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Approval Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                         <div><strong>Status:</strong> {getStatusBadge(selectedBuyer.approvalStatus)}</div>
                    <p><strong>Registration Date:</strong> {formatDate(selectedBuyer.createdAt)}</p>
                                         {selectedBuyer.userAccountId && (
                       <div><strong>User Account ID:</strong> {selectedBuyer.userAccountId}</div>
                     )}
                     {selectedBuyer.approvalStatus === 'approved' && selectedBuyer.approvedAt && (
                       <div><strong>Approved Date:</strong> {formatDate(selectedBuyer.approvedAt)}</div>
                     )}
                     {selectedBuyer.approvalStatus === 'rejected' && selectedBuyer.rejectionReason && (
                       <div><strong>Rejection Reason:</strong> {selectedBuyer.rejectionReason}</div>
                     )}
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedBuyer.approvalStatus === 'pending' && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="default"
                      onClick={() => {
                        approveBuyer(selectedBuyer._id);
                        setShowDetails(false);
                      }}
                    >
                      Approve Buyer
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        const reason = prompt('Please provide a reason for rejection:');
                        if (reason) {
                          rejectBuyer(selectedBuyer._id, reason);
                          setShowDetails(false);
                        }
                      }}
                    >
                      Reject Buyer
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
