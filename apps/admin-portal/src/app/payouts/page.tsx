'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface PayoutRequest {
  _id: string;
  requestNumber: string;
  sellerId: {
    _id: string;
    name: string;
    email: string;
  };
  sellerName: string;
  sellerEmail: string;
  requestedAmount: number;
  availableEarnings: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  approvedAt?: string;
  approvedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  rejectedAt?: string;
  rejectedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  completedAt?: string;
  completedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  rejectionReason?: string;
  notes?: string;
}

export default function PayoutsPage() {
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<PayoutRequest | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPayoutRequests = async () => {
    try {
      setIsLoading(true);
      const status = statusFilter === 'all' ? '' : statusFilter;
      const response = await fetch(
        `/api/marketplace/payout/requests?status=${status}&page=${page}&limit=20`
      );
      if (response.ok) {
        const data = await response.json();
        setPayoutRequests(data.requests || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching payout requests:', error);
      toast.error('Failed to fetch payout requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayoutRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      const response = await fetch(
        `/api/marketplace/payout/requests/${selectedRequest._id}/approve`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notes }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Payout request approved successfully');
        setShowApproveModal(false);
        setSelectedRequest(null);
        setNotes('');
        fetchPayoutRequests();
      } else {
        toast.error(data.message || 'Failed to approve payout request');
      }
    } catch (error) {
      console.error('Error approving payout request:', error);
      toast.error('Failed to approve payout request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(
        `/api/marketplace/payout/requests/${selectedRequest._id}/reject`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason: rejectionReason }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Payout request rejected');
        setShowRejectModal(false);
        setSelectedRequest(null);
        setRejectionReason('');
        fetchPayoutRequests();
      } else {
        toast.error(data.message || 'Failed to reject payout request');
      }
    } catch (error) {
      console.error('Error rejecting payout request:', error);
      toast.error('Failed to reject payout request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      const response = await fetch(
        `/api/marketplace/payout/requests/${selectedRequest._id}/complete`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notes }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Payout request marked as completed');
        setShowCompleteModal(false);
        setSelectedRequest(null);
        setNotes('');
        fetchPayoutRequests();
      } else {
        toast.error(data.message || 'Failed to complete payout request');
      }
    } catch (error) {
      console.error('Error completing payout request:', error);
      toast.error('Failed to complete payout request');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Payout Management</h1>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Label htmlFor="status-filter">Filter by Status:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payout Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Payout Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : payoutRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CurrencyDollarIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No payout requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payoutRequests.map((request) => (
                  <div
                    key={request._id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">{request.requestNumber}</p>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          <strong>Seller:</strong> {request.sellerName} ({request.sellerEmail})
                        </p>
                        <p className="text-sm text-gray-500">
                          Requested: {formatDate(request.createdAt)}
                        </p>
                        {request.approvedAt && (
                          <p className="text-sm text-gray-500">
                            Approved: {formatDate(request.approvedAt)}
                            {request.approvedBy && ` by ${request.approvedBy.name}`}
                          </p>
                        )}
                        {request.completedAt && (
                          <p className="text-sm text-green-600">
                            Completed: {formatDate(request.completedAt)}
                            {request.completedBy && ` by ${request.completedBy.name}`}
                          </p>
                        )}
                        {request.rejectedAt && (
                          <p className="text-sm text-red-600">
                            Rejected: {formatDate(request.rejectedAt)}
                            {request.rejectedBy && ` by ${request.rejectedBy.name}`}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold text-gray-900">
                          ${request.requestedAmount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Available: ${request.availableEarnings.toFixed(2)}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {request.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowApproveModal(true);
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowRejectModal(true);
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {request.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowCompleteModal(true);
                              }}
                            >
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    {request.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <strong>Rejection Reason:</strong> {request.rejectionReason}
                      </div>
                    )}
                    {request.notes && (
                      <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
                        <strong>Notes:</strong> {request.notes}
                      </div>
                    )}
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approve Modal */}
        {showApproveModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Approve Payout Request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Request:</strong> {selectedRequest.requestNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Seller:</strong> {selectedRequest.sellerName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Amount:</strong> ${selectedRequest.requestedAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label htmlFor="approve-notes">Notes (optional)</Label>
                  <Input
                    id="approve-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this approval"
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? 'Approving...' : 'Approve'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowApproveModal(false);
                      setSelectedRequest(null);
                      setNotes('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Reject Payout Request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Request:</strong> {selectedRequest.requestNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Seller:</strong> {selectedRequest.sellerName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Amount:</strong> ${selectedRequest.requestedAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                  <Input
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejection"
                    className="mt-1"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleReject}
                    disabled={isProcessing || !rejectionReason.trim()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isProcessing ? 'Rejecting...' : 'Reject'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectModal(false);
                      setSelectedRequest(null);
                      setRejectionReason('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Complete Modal */}
        {showCompleteModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Mark Payout as Completed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Request:</strong> {selectedRequest.requestNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Seller:</strong> {selectedRequest.sellerName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Amount:</strong> ${selectedRequest.requestedAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Mark this payout as completed after processing the payment internally.
                  </p>
                </div>
                <div>
                  <Label htmlFor="complete-notes">Notes (optional)</Label>
                  <Input
                    id="complete-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about payment processing"
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleComplete}
                    disabled={isProcessing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessing ? 'Completing...' : 'Mark Complete'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCompleteModal(false);
                      setSelectedRequest(null);
                      setNotes('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

