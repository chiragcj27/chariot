"use client";

import React from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag } from 'lucide-react';
import { ProductFormData } from '@/types/products/create/product.types';
import { TagInput } from './TagInput';

interface AdditionalInformationProps {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export function AdditionalInformation({
  control,
  errors,
  tags,
  onAddTag,
  onRemoveTag
}: AdditionalInformationProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-purple-600" />
          Additional Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Controller
              name="theme"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="e.g., Modern, Classic" />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="season">Season</Label>
            <Controller
              name="season"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="e.g., Spring, Winter" />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="occasion">Occasion</Label>
            <Controller
              name="occasion"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="e.g., Wedding, Corporate" />
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label>Tags *</Label>
          <TagInput
            items={tags}
            onAdd={onAddTag}
            onRemove={onRemoveTag}
            placeholder="Add a tag"
          />
          {errors.tags && <p className="text-sm text-red-500">{errors.tags.message}</p>}
        </div>
      </CardContent>
    </Card>
  );
}