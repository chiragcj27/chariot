import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Control, UseFormSetValue, FieldErrors, useWatch } from 'react-hook-form';
import { ProductFormData, ServiceProductFormData, timeUnits } from '@/types/products/create/product.types';

interface ServiceProductDetailsProps {
  control: Control<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
  errors: FieldErrors<ServiceProductFormData>;
}

export const ServiceProductDetails: React.FC<ServiceProductDetailsProps> = ({
  control,
  setValue,
  errors
}) => {
  const type = useWatch({ control, name: 'type' });
  
  if (type !== 'SERVICE') {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Service Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="deliveryTime.min">Minimum Delivery Time *</Label>
            <Input
              type="number"
              min="1"
              placeholder="Enter minimum delivery time"
              onChange={(e) => setValue('deliveryTime.min', parseInt(e.target.value))}
            />
            {errors.deliveryTime?.min && (
              <p className="text-sm text-red-500">{errors.deliveryTime.min.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryTime.max">Maximum Delivery Time *</Label>
            <Input
              type="number"
              min="1"
              placeholder="Enter maximum delivery time"
              onChange={(e) => setValue('deliveryTime.max', parseInt(e.target.value))}
            />
            {errors.deliveryTime?.max && (
              <p className="text-sm text-red-500">{errors.deliveryTime.max.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deliveryTime.unit">Time Unit *</Label>
          <Select onValueChange={(value) => setValue('deliveryTime.unit', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeUnits.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit.charAt(0).toUpperCase() + unit.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.deliveryTime?.unit && (
            <p className="text-sm text-red-500">{errors.deliveryTime.unit.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="revisions.allowed">Number of Revisions *</Label>
            <Input
              type="number"
              min="0"
              placeholder="Enter number of revisions"
              onChange={(e) => setValue('revisions.allowed', parseInt(e.target.value))}
            />
            {errors.revisions?.allowed && (
              <p className="text-sm text-red-500">{errors.revisions.allowed.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="revisions.cost">Revision Cost *</Label>
            <Input
              type="number"
              min="0"
              placeholder="Enter revision cost"
              onChange={(e) => setValue('revisions.cost', parseInt(e.target.value))}
            />
            {errors.revisions?.cost && (
              <p className="text-sm text-red-500">{errors.revisions.cost.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Consultation Required
            <Switch onCheckedChange={(checked) => setValue('consultationRequired', checked)} />
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}; 