"use client";

import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, Repeat, CheckCircle, MessageSquare } from 'lucide-react';
import { ProductFormData } from '@/types/products/create/product.types';
import { TagInput } from './TagInput';

interface ServiceProductFieldsProps {
  control: Control<ProductFormData>;
  timeUnits: string[];
  currencies: string[];
  deliverables: string[];
  requirements: string[];
  onAddDeliverable: (deliverable: string) => void;
  onRemoveDeliverable: (deliverable: string) => void;
  onAddRequirement: (requirement: string) => void;
  onRemoveRequirement: (requirement: string) => void;
}

export function ServiceProductFields({
  control,
  timeUnits,
  currencies,
  deliverables,
  requirements,
  onAddDeliverable,
  onRemoveDeliverable,
  onAddRequirement,
  onRemoveRequirement
}: ServiceProductFieldsProps) {
  return (
    <Card className="shadow-lg border-2 border-orange-100">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-600" />
          Service Details
        </CardTitle>
        <CardDescription>
          Configure service delivery and requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Delivery Time */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Delivery Time
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryTimeMin">Minimum *</Label>
              <Controller
                name="deliveryTime.min"
                control={control}
                render={({ field }) => (
                  <Input 
                    type="number" 
                    placeholder="1"
                    value={field.value ?? 1}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryTimeMax">Maximum *</Label>
              <Controller
                name="deliveryTime.max"
                control={control}
                render={({ field }) => (
                  <Input 
                    type="number" 
                    placeholder="7"
                    value={field.value ?? 7}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 7)}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryTimeUnit">Unit *</Label>
              <Controller
                name="deliveryTime.unit"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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
                )}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Revisions */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            Revisions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revisionsAllowed">Allowed Revisions *</Label>
              <Controller
                name="revisions.allowed"
                control={control}
                render={({ field }) => (
                  <Input 
                    type="number" 
                    placeholder="3"
                    value={field.value ?? 0}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="revisionsCost">Additional Cost *</Label>
              <Controller
                name="revisions.cost"
                control={control}
                render={({ field }) => (
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={field.value ?? 0}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="revisionsUnit">Currency *</Label>
              <Controller
                name="revisions.unit"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
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
        </div>

        <Separator />

        {/* Deliverables */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Deliverables *
          </h4>
          <TagInput
            items={deliverables}
            onAdd={onAddDeliverable}
            onRemove={onRemoveDeliverable}
            placeholder="Add a deliverable"
          />
        </div>

        <Separator />

        {/* Requirements */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Requirements *
          </h4>
          <TagInput
            items={requirements}
            onAdd={onAddRequirement}
            onRemove={onRemoveRequirement}
            placeholder="Add a requirement"
          />
        </div>

        <Separator />

        {/* Consultation Required */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Consultation Required
            <Controller
              name="consultationRequired"
              control={control}
              render={({ field }) => (
                <Switch 
                  checked={field.value} 
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </Label>
          <p className="text-sm text-gray-500">
            Enable if this service requires a consultation before starting work
          </p>
        </div>
      </CardContent>
    </Card>
  );
}