"use client";

import { useState, useEffect } from 'react';

interface Kit {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: {
    _id: string;
    url: string;
    originalname: string;
    filename?: string;
  };
  mainImage?: {
    _id: string;
    url: string;
    originalname: string;
    filename?: string;
  };
  onHoverImage?: {
    _id: string;
    url: string;
    originalname: string;
    filename?: string;
  };
  carouselImages?: Array<{
    _id: string;
    url: string;
    originalname: string;
    filename?: string;
  }>;
  testimonials?: string[];
  createdAt: string;
  updatedAt: string;
}

export function useKits() {
  const [kits, setKits] = useState<Kit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKits = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/kits');
      
        if (!response.ok) {
          throw new Error(`Failed to fetch kits: ${response.status} ${response.statusText}`);
        }
        
        const data: Kit[] = await response.json();
        setKits(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch kits';
        setError(errorMessage);
        console.error('Error fetching kits:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKits();
  }, []);

  const refetch = () => {
    const fetchKits = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/kits');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch kits: ${response.status} ${response.statusText}`);
        }
        
        const data: Kit[] = await response.json();
        setKits(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch kits';
        setError(errorMessage);
        console.error('Error fetching kits:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKits();
  };

  return {
    kits,
    isLoading,
    error,
    refetch
  };
} 