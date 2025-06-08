import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings } from 'lucide-react';
import { Control, useWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { ProductFormData, DigitalProductFormData, productTypes, productStatuses } from '@/types/products/create/product.types';
import { DigitalProductDetails } from './DigitalProductDetails';
import { ServiceProductDetails } from './ServiceProductDetails';

interface ProductDetailsProps {
  control: Control<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  onNameChange: (value: string) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  control,
  setValue,
  errors,
  onNameChange
}) => {
  const name = useWatch({ control, name: 'name' });
  const type = useWatch({ control, name: 'type' });
  const watchedFields = useWatch({ control });

  // Auto-generate slug when name changes
  useEffect(() => {
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', slug);
    }
  }, [name, setValue]);

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-green-600" />
          Product Details
        </CardTitle>
        <CardDescription>
          Fill in the essential product information
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input 
              placeholder="Enter product name"
              onChange={(e) => onNameChange(e.target.value)}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <Input 
              placeholder="product-url-slug"
              value={name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : ''}
              readOnly
            />
            {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea 
            placeholder="Detailed product description..."
            rows={4}
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Product Type *</Label>
            <Select onValueChange={(value: ProductFormData['type']) => setValue('type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {productTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select onValueChange={(value: ProductFormData['status']) => setValue('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {productStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Conditional rendering based on product type */}
        {type === 'DIGITAL' && <DigitalProductDetails control={control} setValue={setValue} errors={errors} watchedFields={watchedFields as Partial<DigitalProductFormData>} />}
        {type === 'SERVICE' && <ServiceProductDetails control={control} setValue={setValue} errors={errors} />}
      </CardContent>
    </Card>
  );
}; 