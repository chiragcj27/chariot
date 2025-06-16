'use client'
import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Package, Download, Users, Eye } from 'lucide-react';
import { IProduct, ProductType } from '@/types/product';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductCardProps {
  product?: IProduct;
  isLoading?: boolean;
}

const ProductCardSkeleton = () => {
  return (
    <Card className="overflow-hidden border-0 shadow-md bg-white">
      <div className="relative overflow-hidden">
        <Skeleton className="w-full h-48" />
        <div className="absolute top-3 left-3 flex gap-2">
          <Skeleton className="h-6 w-24" />
        </div>
      </div>

      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-3" />
        <div className="flex flex-wrap gap-1 mb-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex flex-col">
          <Skeleton className="h-6 w-20 mb-1" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-9 w-24" />
      </CardFooter>
    </Card>
  );
};

const ProductCard: React.FC<ProductCardProps> = ({ product, isLoading = false }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!product || isLoading) return;
    
    const card = cardRef.current;
    if (!card) return;

    // Initial animation on mount
    gsap.fromTo(card, 
      { 
        opacity: 0, 
        y: 50,
        scale: 0.9
      },
      { 
        opacity: 1, 
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
        delay: Math.random() * 0.3
      }
    );

    // Hover animations
    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -10,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        duration: 0.3,
        ease: "power2.out"
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
        duration: 0.3,
        ease: "power2.out"
      });
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [product, isLoading]);

  if (isLoading || !product) {
    return <ProductCardSkeleton />;
  }

  const getProductIcon = (type: ProductType) => {
    switch (type) {
      case 'physical':
        return <Package className="w-4 h-4" />;
      case 'digital':
        return <Download className="w-4 h-4" />;
      case 'service':
        return <Users className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getProductTypeColor = (type: ProductType) => {
    switch (type) {
      case 'physical':
        return 'bg-blue-100 text-blue-800';
      case 'digital':
        return 'bg-purple-100 text-purple-800';
      case 'service':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleProductClick = () => {
    const basePath = `/product/${product.type}`;
    router.push(`${basePath}/${product.slug}`);
  };

  const discountedPrice = product.discount 
    ? product.price.amount * (1 - product.discount.percentage / 100)
    : product.price.amount;

  return (
    <Card 
      ref={cardRef}
      className="group cursor-pointer overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white"
      onClick={handleProductClick}
    >
      <div className="relative overflow-hidden">
        <Image
          src={product.images[0]?.url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDUwMCAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSIxOTIiIGZpbGw9IiNFNUU3RUIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY0NjQ2NCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjRweCI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg=='}
          alt={product.name}
          width={500}
          height={192}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
          
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={`${getProductTypeColor(product.type)} flex items-center gap-1`}>
            {getProductIcon(product.type)}
            {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
          </Badge>
          {product.featured && (
            <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </Badge>
          )}
        </div>
        {product.discount && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-red-500 text-white">
              -{product.discount.percentage}%
            </Badge>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <Button
            variant="secondary"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors duration-200">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex flex-wrap gap-1 mb-3">
          {product.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {product.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{product.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {product.discount ? (
              <>
                <span className="text-lg font-bold text-primary">
                  Rs {discountedPrice.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  Rs {product.price.amount.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary">
                Rs {product.price.amount.toFixed(2)}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">{product.price.currency}</span>
        </div>
        <Button variant="outline" size="sm" className="hover:bg-primary hover:text-white transition-colors duration-200">
          View Product
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
