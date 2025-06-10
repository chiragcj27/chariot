

import React from 'react';
import Image from 'next/image';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Loader2 } from 'lucide-react';
import { ProductFormData, Category, SubCategory, CategoryItem } from '@/types/products/create/product.types';

interface CategorySelectorProps {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  categories: Category[];
  selectedCategory: string;
  selectedSubCategory: string;
  selectedItem: string;
  availableSubCategories: SubCategory[];
  availableItems: CategoryItem[];
  formStep: number;
  isLoading: boolean;
  onCategoryChange: (categoryId: string) => void;
  onSubCategoryChange: (subCategoryId: string) => void;
  onItemChange: (itemId: string) => void;
}

export function CategorySelector({
  control,
  errors,
  categories,
  selectedCategory,
  selectedSubCategory,
  selectedItem,
  availableSubCategories,
  availableItems,
  formStep,
  isLoading,
  onCategoryChange,
  onSubCategoryChange,
  onItemChange
}: CategorySelectorProps) {
  if (isLoading) {
    return (
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Product Categories
          </CardTitle>
          <CardDescription>
            Loading categories...
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading categories...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-100 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          Product Categories
        </CardTitle>
        <CardDescription>
          Select the appropriate category hierarchy for your product
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Main Category (L1)</Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select 
                  value={selectedCategory} 
                  onValueChange={(value) => {
                    field.onChange(value);
                    onCategoryChange(value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId.message}</p>}
          </div>

          <div className={`space-y-2 transition-all duration-300 ${formStep >= 1 ? 'opacity-100' : 'opacity-50'}`}>
            <Label htmlFor="subcategory">Subcategory (L2)</Label>
            <Controller
              name="subCategoryId"
              control={control}
              render={({ field }) => (
                <Select 
                  value={selectedSubCategory} 
                  onValueChange={(value) => {
                    field.onChange(value);
                    onSubCategoryChange(value);
                  }}
                  disabled={!selectedCategory || availableSubCategories.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubCategories.map((subCategory) => (
                      <SelectItem key={subCategory._id} value={subCategory._id}>
                        {subCategory.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.subCategoryId && <p className="text-sm text-red-500">{errors.subCategoryId.message}</p>}
          </div>

          <div className={`space-y-2 transition-all duration-300 ${formStep >= 2 ? 'opacity-100' : 'opacity-50'}`}>
            <Label htmlFor="item">Item (L3)</Label>
            <Controller
              name="itemId"
              control={control}
              render={({ field }) => (
                <Select 
                  value={selectedItem} 
                  onValueChange={(value) => {
                    field.onChange(value);
                    onItemChange(value);
                  }}
                  disabled={availableItems.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableItems.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        <div className="flex items-center gap-2">
                          <span>{item.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.itemId && <p className="text-sm text-red-500">{errors.itemId.message}</p>}
          </div>
        </div>

        {/* Selected Item Preview */}
        {selectedItem && availableItems.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            {(() => {
              const selectedItemData = availableItems.find(item => item._id === selectedItem);
              if (!selectedItemData) return null;
              
              return (
                <div className="flex items-center gap-4">
                  <Image 
                    src={selectedItemData.image.url} 
                    alt={selectedItemData.title}
                    width={64}
                    height={64}
                    className="object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedItemData.title}</h4>
                    <p className="text-sm text-gray-600">{selectedItemData.description}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}