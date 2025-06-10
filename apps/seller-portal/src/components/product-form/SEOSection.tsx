"use client";

import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { ProductFormData } from '@/types/products/create/product.types';
import { TagInput } from './TagInput';

interface SEOSectionProps {
  control: Control<ProductFormData>;
  metaKeywords: string[];
  onAddKeyword: (keyword: string) => void;
  onRemoveKeyword: (keyword: string) => void;
}

export function SEOSection({
  control,
  metaKeywords,
  onAddKeyword,
  onRemoveKeyword
}: SEOSectionProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-cyan-600" />
          SEO Settings
        </CardTitle>
        <CardDescription>
          Optimize your product for search engines
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Controller
            name="seo.metaTitle"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="SEO-friendly title" />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Controller
            name="seo.metaDescription"
            control={control}
            render={({ field }) => (
              <Textarea {...field} placeholder="Brief description for search results" rows={3} />
            )}
          />
        </div>

        <div className="space-y-4">
          <Label>Meta Keywords</Label>
          <TagInput
            items={metaKeywords}
            onAdd={onAddKeyword}
            onRemove={onRemoveKeyword}
            placeholder="Add a keyword"
            variant="outline"
          />
        </div>
      </CardContent>
    </Card>
  );
}