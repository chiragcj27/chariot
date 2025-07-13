"use client";

import { useState, useEffect } from 'react';
import { MenuStructure } from '@/types/menu';

const API_BASE_URL = 'http://localhost:3001';

export function useCategories() {
  const [categories, setCategories] = useState<MenuStructure>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/api/menu/structure`);
      
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
        }
        
        const data: MenuStructure = await response.json();
        setCategories(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
        setError(errorMessage);
        console.error('Error fetching categories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const refetch = () => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/api/menu/structure`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
        }
        
        const data: MenuStructure = await response.json();
        setCategories(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
        setError(errorMessage);
        console.error('Error fetching categories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  };

  return {
    categories,
    isLoading,
    error,
    refetch
  };
}