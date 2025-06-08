import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Info } from 'lucide-react';
import { Control } from 'react-hook-form';
import { ProductFormData } from '@/types/products/create/product.types';

interface AdditionalInformationProps {
  control: Control<ProductFormData>;
  errors: any;
}

export const AdditionalInformation: React.FC<AdditionalInformationProps> = ({
  control,
  errors
}) => {
  return (
    <Card className="shadow-lg border-2 border-green-100">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-green-600" />
          Additional Information
        </CardTitle>
        <CardDescription>
          Add extra details about your product
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <Label htmlFor="features">Key Features</Label>
          <Textarea
            placeholder="List the main features of your product..."
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-4">
          <Label htmlFor="specifications">Specifications</Label>
          <Textarea
            placeholder="Add technical specifications or requirements..."
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-4">
          <Label htmlFor="tags">Tags</Label>
          <Input
            placeholder="Enter tags separated by commas"
          />
          <p className="text-sm text-gray-500">
            Add relevant tags to help customers find your product
          </p>
        </div>

        <div className="space-y-4">
          <Label htmlFor="warranty">Warranty Information</Label>
          <Textarea
            placeholder="Describe warranty terms and conditions..."
            className="min-h-[100px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}; 