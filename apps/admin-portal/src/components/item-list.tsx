'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import Image from 'next/image';

interface Item {
  id: string;
  title: string;
  slug: string;
  image: string;
  description: string;
  subCategoryId: string;
}

interface ItemListProps {
  subCategoryId: string;
}

export function ItemList({ subCategoryId }: ItemListProps) {
  // TODO: Replace with actual API call
  const items: Item[] = [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.id} className="ml-6">
          <CardContent className="p-4">
            <div className="relative aspect-square mb-4">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover rounded-md"
              />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.description}</p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 