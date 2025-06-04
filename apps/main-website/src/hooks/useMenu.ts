import { useState, useEffect } from 'react';
import { menuService, MenuStructure } from '@/services/menu.service';

export const useMenu = () => {
  const [menuData, setMenuData] = useState<MenuStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const data = await menuService.getMenuStructure();
        setMenuData(data);
      } catch (err) {
        console.error('Error fetching menu data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch menu data'));
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  return { menuData, loading, error };
}; 