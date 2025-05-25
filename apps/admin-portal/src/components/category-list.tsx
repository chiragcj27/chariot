'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { SubCategoryList } from '../components/subcategory-list';
import { CreateSubCategoryDialog } from '../components/create-subcategory-dialog';

interface Category {
  id: string;
  title: string;
  slug: string;
  featuredItems: Array<{
    id: string;
    title: string;
    price: number;
    image: string;
    slug: string;
  }>;
}

export function CategoryList() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreateSubCategoryOpen, setIsCreateSubCategoryOpen] = useState(false);

  // TODO: Replace with actual API call
  const categories: Category[] = [];

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <Card key={category.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCategory(category.id)}
              >
                {expandedCategories.has(category.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              <CardTitle>{category.title}</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory(category.id);
                setIsCreateSubCategoryOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Subcategory
            </Button>
          </CardHeader>
          {expandedCategories.has(category.id) && (
            <CardContent>
              <SubCategoryList categoryId={category.id} />
            </CardContent>
          )}
        </Card>
      ))}

      <CreateSubCategoryDialog
        open={isCreateSubCategoryOpen}
        onOpenChange={setIsCreateSubCategoryOpen}
        categoryId={selectedCategory}
      />
    </div>
  );
} 