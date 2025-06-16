'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { IProduct } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, Shield, Heart } from 'lucide-react';

interface PhysicalProductLayoutProps {
  product: IProduct;
}

const PhysicalProductLayout: React.FC<PhysicalProductLayoutProps> = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const discountedPrice = product.discount 
    ? product.price.amount * (1 - product.discount.percentage / 100)
    : product.price.amount;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="relative aspect-square rounded-lg overflow-hidden">
          <Image
            src={product.images[selectedImage]?.url || '/placeholder.jpg'}
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
        <div className="grid grid-cols-4 gap-4">
          {product.images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative aspect-square rounded-md overflow-hidden border-2 ${
                selectedImage === index ? 'border-primary' : 'border-transparent'
              }`}
            >
              <Image
                src={image.url}
                alt={`${product.name} - Image ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
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
            <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
              <Package className="w-4 h-4" />
              Physical Product
            </Badge>
          </div>
        </div>

        <p className="text-gray-600">{product.description}</p>

        {/* Product Features */}
        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            <span className="text-sm">Free Shipping</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm">Secure Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <span className="text-sm">Easy Returns</span>
          </div>
        </div>

        {/* Purchase Options */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-4 py-2">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100"
              >
                +
              </button>
            </div>
            <Button className="flex-1">Add to Cart</Button>
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

export default PhysicalProductLayout; 