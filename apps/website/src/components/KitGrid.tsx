"use client";

import KitCard from './KitCard';
import { useKits } from '@/hooks/useKits';

export default function KitGrid() {
  const { kits, isLoading, error } = useKits();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sunrise"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-red-500">Error: {error.message || 'Failed to fetch kits'}</p>
      </div>
    );
  }

  if (kits.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-500">No kits available at the moment.</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
        {kits.map((kit) => (
          <KitCard key={kit._id} kit={kit} />
        ))}
      </div>
    </>
  );
} 