import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign } from 'lucide-react';
import { Control } from 'react-hook-form';
import { ProductFormData, currencies } from '@/types/products/create/product.types';

interface PricingSectionProps {
  control: Control<ProductFormData>;
  errors: Record<string, { message: string }>;
}

export const PricingSection: React.FC<PricingSectionProps> = () => {
  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-amber-600" />
          Pricing & Discount
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Price</h4>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input 
                  type="number" 
                  step="0.1"
                  placeholder="0.0"
                />
              </div>
              <Select>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Discount (%)</h4>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input 
                  type="number" 
                  step="0.1"
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 