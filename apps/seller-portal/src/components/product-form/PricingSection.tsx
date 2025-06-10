"use client";

import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { ProductFormData } from '@/types/products/create/product.types';

interface PricingSectionProps {
  control: Control<ProductFormData>;
  currencies: string[];
}

export function PricingSection({ control, currencies }: PricingSectionProps) {
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
                <Controller
                  name="price.amount"
                  control={control}
                  render={({ field }) => (
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      value={field.value}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </div>
              <Controller
                name="price.currency"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Discount</h4>
            <div className="flex gap-2">
              <div className="flex-1">
                <Controller
                  name="discount.percentage"
                  control={control}
                  render={({ field }) => (
                    <Input 
                      type="number" 
                      step="1"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={field.value}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </div>
              <div className="flex items-center px-3 bg-gray-100 rounded-md">
                %
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}