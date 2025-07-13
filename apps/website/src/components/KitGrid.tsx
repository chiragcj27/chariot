"use client";

import { useState, useEffect } from 'react';
import KitCard from './KitCard';
import { ArrowUpRight } from 'lucide-react';

interface KitImage {
  _id: string;
  url: string;
  originalname: string;
}

interface Kit {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: KitImage;
  onHoverImage?: KitImage;
  mainImage?: KitImage;
  carouselImages?: KitImage[];
}

export default function KitGrid() {
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchKits = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/kits');
        
        if (!response.ok) {
          throw new Error('Failed to fetch kits');
        }
        
        const data = await response.json();
        setKits(data);
      } catch (err) {
        console.error('Error fetching kits:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch kits');
      } finally {
        setLoading(false);
      }
    };

    fetchKits();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sunrise"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-red-500">Error: {error}</p>
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
        {(showAll ? kits : kits.slice(0, 6)).map((kit) => (
          <KitCard key={kit._id} kit={kit} />
        ))}
      </div>
      {!showAll && kits.length > 6 && (
        <div className="flex justify-center mt-12">
          <button
            onClick={() => setShowAll(true)}
            className="flex items-center px-5 py-4 border-2 border-sunrise/80 text-sunrise/80 text-2xl rounded-full font-secondary font-light transition hover:bg-sunrise/10"
          >
            Explore more <ArrowUpRight size={24} />
          </button>
        </div>
      )}
    </>
  );
} 