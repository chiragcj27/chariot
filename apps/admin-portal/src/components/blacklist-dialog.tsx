'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';

interface BlacklistDialogProps {
  sellerId: string;
  sellerName: string;
  onSuccess: () => void;
  trigger: React.ReactNode;
}

export default function BlacklistDialog({ sellerId, sellerName, onSuccess, trigger }: BlacklistDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      toast.error('Please provide a reason for blacklisting');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/blacklist/${sellerId}/blacklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason.trim(),
          expiryDate: expiryDate || undefined,
        }),
      });

      if (response.ok) {
        toast.success('Seller blacklisted successfully');
        setOpen(false);
        setReason('');
        setExpiryDate('');
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to blacklist seller');
      }
    } catch (error) {
      toast.error('Error blacklisting seller');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultExpiryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Blacklist Seller</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="seller-name">Seller Name</Label>
            <Input
              id="seller-name"
              value={sellerName}
              disabled
              className="bg-gray-50"
            />
          </div>
          <div>
            <Label htmlFor="reason">Reason for Blacklisting *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter the reason for blacklisting this seller..."
              required
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="expiry-date">Expiry Date (Optional)</Label>
            <Input
              id="expiry-date"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              placeholder={getDefaultExpiryDate()}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for default 30 days from today
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={loading || !reason.trim()}
            >
              {loading ? 'Blacklisting...' : 'Blacklist Seller'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 