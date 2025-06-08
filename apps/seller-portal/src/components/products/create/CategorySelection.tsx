import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderTree } from 'lucide-react';
import { Control } from 'react-hook-form';
import { ProductFormData } from '@/types/products/create/product.types';

interface CategorySelectionProps {
  menuStructure: any;
  selectedCategory: string;
  selectedSubCategory: string;
  formStep: number;
  onCategoryChange: (value: string) => void;
  onSubCategoryChange: (value: string) => void;
  onItemChange: (value: string) => void;
  control: Control<ProductFormData>;
  errors: any;
}

export const CategorySelection: React.FC<CategorySelectionProps> = ({
  menuStructure,
  selectedCategory,
  selectedSubCategory,
  formStep,
  onCategoryChange,
  onSubCategoryChange,
  onItemChange,
  control,
  errors
}) => {
  const getSubCategories = () => {
    if (!menuStructure || !selectedCategory) return [];
    const category = menuStructure.find((cat: any) => cat._id === selectedCategory);
    return category?.subCategories || [];
  };

  const getItems = () => {
    if (!menuStructure || !selectedCategory || !selectedSubCategory) return [];
    const category = menuStructure.find((cat: any) => cat._id === selectedCategory);
    const subCategory = category?.subCategories.find((sub: any) => sub._id === selectedSubCategory);
    return subCategory?.items || [];
  };

  return (
    <Card className="shadow-lg border-2 border-indigo-100">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50">
        <CardTitle className="flex items-center gap-2">
          <FolderTree className="h-5 w-5 text-indigo-600" />
          Category Selection
        </CardTitle>
        <CardDescription>
          Choose the appropriate category for your product
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={selectedCategory}
              onValueChange={onCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(menuStructure) && menuStructure.map((category: any) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-red-500">{errors.categoryId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subCategory">Subcategory *</Label>
            <Select
              value={selectedSubCategory}
              onValueChange={onSubCategoryChange}
              disabled={!selectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                {getSubCategories().map((subCategory: any) => (
                  <SelectItem key={subCategory._id} value={subCategory._id}>
                    {subCategory.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.subCategoryId && (
              <p className="text-sm text-red-500">{errors.subCategoryId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="item">Item *</Label>
            <Select
              onValueChange={onItemChange}
              disabled={!selectedSubCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                {getItems().map((item: any) => (
                  <SelectItem key={item._id} value={item._id}>
                    {item.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.itemId && (
              <p className="text-sm text-red-500">{errors.itemId.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 