'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

interface BlacklistInfo {
  isBlacklisted: boolean;
  blacklistReason?: string;
  blacklistedAt?: string;
  blacklistExpiryDate?: string;
  reapplicationDate?: string;
  isExpired?: boolean;
}

interface BlacklistNotificationProps {
  blacklistInfo: BlacklistInfo;
  sellerId: string;
  sellerName: string;
}

export default function BlacklistNotification({ blacklistInfo, sellerId }: BlacklistNotificationProps) {
  const [showReapplication, setShowReapplication] = useState(false);
  const [reapplicationReason, setReapplicationReason] = useState('');
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Use the isExpired field from API if available, otherwise calculate locally
  const isExpired = blacklistInfo.isExpired !== undefined 
    ? blacklistInfo.isExpired 
    : blacklistInfo.blacklistExpiryDate && new Date(blacklistInfo.blacklistExpiryDate) < new Date();

  const handleReapplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reapplicationReason.trim()) {
      toast.error('Please provide a reason for reapplication');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/sellers/${sellerId}/reapply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reapplicationReason: reapplicationReason.trim(),
        }),
      });

      if (response.ok) {
        toast.success('Reapplication submitted successfully. Admin will review your request.');
        setShowReapplication(false);
        setReapplicationReason('');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit reapplication');
      }
    } catch (error) {
      toast.error('Error submitting reapplication');
    } finally {
      setLoading(false);
    }
  };

  if (!blacklistInfo.isBlacklisted) {
    return null;
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Account Blacklisted
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-red-700">
            <strong>Reason:</strong> {blacklistInfo.blacklistReason}
          </p>
          <p className="text-red-700">
            <strong>Blacklisted on:</strong> {formatDate(blacklistInfo.blacklistedAt!)}
          </p>
          <p className="text-red-700">
            <strong>Expires on:</strong> {formatDate(blacklistInfo.blacklistExpiryDate!)}
          </p>
          
          {isExpired && (
            <div className="p-3 bg-yellow-100 border border-yellow-300 rounded">
              <p className="text-yellow-800 text-sm">
                Your blacklist period has expired. You may now submit a reapplication request.
              </p>
            </div>
          )}

          {blacklistInfo.reapplicationDate && (
            <div className="p-3 bg-blue-100 border border-blue-300 rounded">
              <p className="text-blue-800 text-sm">
                <strong>Reapplication submitted:</strong> {formatDate(blacklistInfo.reapplicationDate)}
              </p>
              <p className="text-blue-700 text-sm mt-1">
                Your reapplication is under review. You will be notified once a decision is made.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-red-700 text-sm">
            During this period:
          </p>
          <ul className="text-red-700 text-sm list-disc list-inside space-y-1">
            <li>All your products have been temporarily deactivated</li>
            <li>You cannot upload new products</li>
            <li>You cannot process new orders</li>
            <li>You cannot access certain seller features</li>
          </ul>
        </div>

        {isExpired && !blacklistInfo.reapplicationDate && (
          <div className="pt-4 border-t border-red-200">
            <Button
              onClick={() => setShowReapplication(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              Submit Reapplication Request
            </Button>
          </div>
        )}

        {showReapplication && (
          <div className="pt-4 border-t border-red-200">
            <form onSubmit={handleReapplication} className="space-y-4">
              <div>
                <Label htmlFor="reapplication-reason">Reapplication Reason</Label>
                <Textarea
                  id="reapplication-reason"
                  value={reapplicationReason}
                  onChange={(e) => setReapplicationReason(e.target.value)}
                  placeholder="Please explain why your account should be reactivated..."
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading || !reapplicationReason.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {loading ? 'Submitting...' : 'Submit Reapplication'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReapplication(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 