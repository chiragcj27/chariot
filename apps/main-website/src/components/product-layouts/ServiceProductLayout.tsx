'use client';

import React from 'react';
import Image from 'next/image';
import { IProduct } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Calendar, Shield, Heart, Star } from 'lucide-react';

interface ServiceProductLayoutProps {
  product: IProduct;
}

const ServiceProductLayout: React.FC<ServiceProductLayoutProps> = ({ product }) => {
  const discountedPrice = product.discount 
    ? product.price.amount * (1 - product.discount.percentage / 100)
    : product.price.amount;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      {/* Service Preview */}
      <div className="space-y-4">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-50">
          <Image
            src={product.images[0]?.url || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover"
          />
          {product.discount && (
            <Badge className="absolute top-4 right-4 bg-red-500 text-white">
              -{product.discount.percentage}%
            </Badge>
          )}
        </div>
        
        {/* Service Features */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Duration</p>
              <p className="text-sm text-gray-600">2 Hours</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Group Size</p>
              <p className="text-sm text-gray-600">Up to 10 people</p>
            </div>
          </div>
        </div>

        {/* Service Provider Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden">
              <Image
                src="/service-provider.jpg"
                alt="Service Provider"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="font-medium">John Doe</h4>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm">4.9 (120 reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">{product.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center">
              {product.discount ? (
                <>
                  <span className="text-2xl font-bold text-primary">
                    Rs {discountedPrice.toFixed(2)}
                  </span>
                  <span className="ml-2 text-lg text-gray-500 line-through">
                    Rs {product.price.amount.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-primary">
                  Rs {product.price.amount.toFixed(2)}
                </span>
              )}
            </div>
            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
              <Users className="w-4 h-4" />
              Service
            </Badge>
          </div>
        </div>

        <p className="text-gray-600">{product.description}</p>

        {/* Service Features */}
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="text-sm">Flexible Booking</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm">Secure Payment</span>
          </div>
        </div>

        {/* Booking Options */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button className="flex-1">
              <Calendar className="w-5 h-5 mr-2" />
              Book Now
            </Button>
            <Button variant="outline" size="icon">
              <Heart className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Service Tags */}
        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag, index) => (
            <Badge key={index} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">What&apos;s Included</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Professional service provider</li>
            <li>• All necessary equipment</li>
            <li>• Insurance coverage</li>
            <li>• 24/7 customer support</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ServiceProductLayout; 