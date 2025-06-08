import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Search } from 'lucide-react';
import { Control } from 'react-hook-form';
import { ProductFormData } from '@/types/products/create/product.types';

interface SEOSectionProps {
  control: Control<ProductFormData>;
  errors: any;
}

export const SEOSection: React.FC<SEOSectionProps> = ({
  control,
  errors
}) => {
  return (
    <Card className="shadow-lg border-2 border-orange-100">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-orange-600" />
          SEO Settings
        </CardTitle>
        <CardDescription>
          Optimize your product for search engines
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input
            placeholder="Enter meta title (50-60 characters)"
            maxLength={60}
          />
          <p className="text-sm text-gray-500">
            The title that appears in search results
          </p>
        </div>

        <div className="space-y-4">
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea
            placeholder="Enter meta description (150-160 characters)"
            maxLength={160}
            className="min-h-[100px]"
          />
          <p className="text-sm text-gray-500">
            A brief description of your product for search results
          </p>
        </div>

        <div className="space-y-4">
          <Label htmlFor="keywords">Keywords</Label>
          <Input
            placeholder="Enter keywords separated by commas"
          />
          <p className="text-sm text-gray-500">
            Add relevant keywords to improve search visibility
          </p>
        </div>

        <div className="space-y-4">
          <Label htmlFor="canonicalUrl">Canonical URL</Label>
          <Input
            placeholder="Enter canonical URL if different from product URL"
          />
          <p className="text-sm text-gray-500">
            Specify if this product has multiple URLs
          </p>
        </div>
      </CardContent>
    </Card>
  );
}; 