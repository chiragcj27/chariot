'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { JwtPayload } from 'jsonwebtoken';

interface PayoutRequest {
  _id: string;
  requestNumber: string;
  requestedAmount: number;
  availableEarnings: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
  notes?: string;
}

interface EarningsInfo {
  availableEarnings: number;
  minimumPayoutAmount: number;
  canRequestPayout: boolean;
}

interface PayoutsClientProps {
  user: JwtPayload | null;
}

export default function PayoutsClient({ user }: PayoutsClientProps) {
  const [earningsInfo, setEarningsInfo] = useState<EarningsInfo | null>(null);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestedAmount, setRequestedAmount] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user?.userId) {
      fetchEarningsInfo();
      fetchPayoutRequests();
    }
  }, [user, page]);

  const fetchEarningsInfo = async () => {
    if (!user?.userId) return;
    try {
      const response = await fetch(`/api/marketplace/payout/earnings/${user.userId}`);
      if (response.ok) {
        const data = await response.json();
        setEarningsInfo(data);
      }
    } catch (error) {
      console.error('Error fetching earnings info:', error);
    }
  };

  const fetchPayoutRequests = async () => {
    if (!user?.userId) return;
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/marketplace/payout/requests/seller/${user.userId}?page=${page}&limit=10`
      );
      if (response.ok) {
        const data = await response.json();
        setPayoutRequests(data.requests || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching payout requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    if (!user?.userId || !earningsInfo) return;

    const amount = parseFloat(requestedAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount < earningsInfo.minimumPayoutAmount) {
      toast.error(`Minimum payout amount is $${earningsInfo.minimumPayoutAmount}`);
      return;
    }

    if (amount > earningsInfo.availableEarnings) {
      toast.error('Requested amount exceeds available earnings');
      return;
    }

    setIsRequesting(true);
    try {
      const response = await fetch('/api/marketplace/payout/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestedAmount: amount }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Payout request submitted successfully');
        setRequestedAmount('');
        setShowRequestForm(false);
        fetchEarningsInfo();
        fetchPayoutRequests();
      } else {
        toast.error(data.message || 'Failed to submit payout request');
      }
    } catch (error) {
      console.error('Error requesting payout:', error);
      toast.error('Failed to submit payout request');
    } finally {
      setIsRequesting(false);
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

  if (isLoading && !earningsInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Payouts</h1>
      </div>

      {/* Earnings Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Available Earnings</CardTitle>
          <CardDescription>Your current available earnings for payout</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Available Balance</p>
              <p className="text-3xl font-bold text-gray-900">
                ${earningsInfo?.availableEarnings.toFixed(2) || '0.00'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Minimum payout: ${earningsInfo?.minimumPayoutAmount.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {earningsInfo?.canRequestPayout ? (
                <Button
                  onClick={() => setShowRequestForm(!showRequestForm)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                  Request Payout
                </Button>
              ) : (
                <Button disabled variant="outline">
                  Minimum payout not reached
                </Button>
              )}
            </div>
          </div>

          {/* Request Form */}
          {showRequestForm && earningsInfo?.canRequestPayout && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Request Payout</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Requested Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min={earningsInfo.minimumPayoutAmount}
                    max={earningsInfo.availableEarnings}
                    step="0.01"
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(e.target.value)}
                    placeholder={`Min: $${earningsInfo.minimumPayoutAmount.toFixed(2)}`}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Available: ${earningsInfo.availableEarnings.toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleRequestPayout}
                    disabled={isRequesting}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {isRequesting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRequestForm(false);
                      setRequestedAmount('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>View all your payout requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {payoutRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CurrencyDollarIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No payout requests yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payoutRequests.map((request) => (
                <div
                  key={request._id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{request.requestNumber}</p>
                      <p className="text-sm text-gray-500">
                        Requested: {formatDate(request.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ${request.requestedAmount.toFixed(2)}
                        </p>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  </div>
                  {request.status === 'rejected' && request.rejectionReason && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <strong>Rejection Reason:</strong> {request.rejectionReason}
                    </div>
                  )}
                  {request.status === 'approved' && request.approvedAt && (
                    <p className="text-sm text-gray-500 mt-2">
                      Approved: {formatDate(request.approvedAt)}
                    </p>
                  )}
                  {request.status === 'completed' && request.completedAt && (
                    <p className="text-sm text-green-600 mt-2">
                      Completed: {formatDate(request.completedAt)}
                    </p>
                  )}
                  {request.notes && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Notes:</strong> {request.notes}
                    </p>
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
    </div>
  );
}
