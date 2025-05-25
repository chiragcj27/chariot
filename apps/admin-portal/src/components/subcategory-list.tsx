'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { ItemList } from './item-list';
import { CreateItemDialog } from './create-item-dialog';

interface SubCategory {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
}

interface SubCategoryListProps {
  categoryId: string;
}

export function SubCategoryList({ categoryId }: SubCategoryListProps) {
  const [expandedSubCategories, setExpandedSubCategories] = useState<Set<string>>(new Set());
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [isCreateItemOpen, setIsCreateItemOpen] = useState(false);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  useEffect(() => {
    // TODO: Replace with actual API call
    // For now, we'll just use an empty array
    setSubCategories([]);
  }, [categoryId]);

  const toggleSubCategory = (subCategoryId: string) => {
    const newExpanded = new Set(expandedSubCategories);
    if (newExpanded.has(subCategoryId)) {
      newExpanded.delete(subCategoryId);
    } else {
      newExpanded.add(subCategoryId);
    }
    setExpandedSubCategories(newExpanded);
  };

  return (
    <div className="space-y-4">
      {subCategories.map((subCategory) => (
        <Card key={subCategory.id} className="ml-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSubCategory(subCategory.id)}
              >
                {expandedSubCategories.has(subCategory.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              <CardTitle>{subCategory.title}</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedSubCategory(subCategory.id);
                setIsCreateItemOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardHeader>
          {expandedSubCategories.has(subCategory.id) && (
            <CardContent>
              <ItemList subCategoryId={subCategory.id} />
            </CardContent>
          )}
        </Card>
      ))}

      <CreateItemDialog
        open={isCreateItemOpen}
        onOpenChange={setIsCreateItemOpen}
        subCategoryId={selectedSubCategory}
      />
    </div>
  );
} 