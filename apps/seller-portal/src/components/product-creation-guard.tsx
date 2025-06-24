'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ProductCreationGuardProps {
  isBlacklisted: boolean;
  blacklistReason?: string;
  children: React.ReactNode;
}

export default function ProductCreationGuard({ 
  isBlacklisted, 
  blacklistReason, 
  children 
}: ProductCreationGuardProps) {
  const router = useRouter();

  if (isBlacklisted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Product Creation Disabled
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-red-700">
                Your seller account has been temporarily suspended, which prevents you from creating or editing products.
              </p>
              {blacklistReason && (
                <p className="text-red-700">
                  <strong>Reason:</strong> {blacklistReason}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-red-700 text-sm">
                During this suspension period:
              </p>
              <ul className="text-red-700 text-sm list-disc list-inside space-y-1">
                <li>You cannot create new products</li>
                <li>You cannot edit existing products</li>
                <li>All your products are temporarily deactivated</li>
                <li>You cannot process new orders</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-red-200">
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
} 