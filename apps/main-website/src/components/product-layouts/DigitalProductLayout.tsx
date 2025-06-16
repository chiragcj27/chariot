'use client';

import React from 'react';
import Image from 'next/image';
import { IProduct } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Clock, Shield, Heart } from 'lucide-react';

interface DigitalProductLayoutProps {
  product: IProduct;
}

const DigitalProductLayout: React.FC<DigitalProductLayoutProps> = ({ product }) => {
  const discountedPrice = product.discount 
    ? product.price.amount * (1 - product.discount.percentage / 100)
    : product.price.amount;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      {/* Preview Section */}
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
        
        {/* Preview Features */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Format</p>
              <p className="text-sm text-gray-600">PDF, EPUB, MOBI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Delivery</p>
              <p className="text-sm text-gray-600">Instant Download</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details */}
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
            <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
              <Download className="w-4 h-4" />
              Digital Product
            </Badge>
          </div>
        </div>

        <p className="text-gray-600">{product.description}</p>

        {/* Digital Features */}
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            <span className="text-sm">Instant Download</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm">Secure Payment</span>
          </div>
        </div>

        {/* Purchase Options */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button className="flex-1">
              <Download className="w-5 h-5 mr-2" />
              Buy & Download
            </Button>
            <Button variant="outline" size="icon">
              <Heart className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Product Tags */}
        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag, index) => (
            <Badge key={index} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DigitalProductLayout; 