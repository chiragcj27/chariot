'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ShoppingCart, DollarSign, Star, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: {
    amount: number;
    currency: string;
  };
  creditsCost: number;
  images: Array<{
    url: string;
    alt: string;
  }>;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
}

interface ProductPageProps {
  params: Promise<{ 'product-slug': string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { user } = useAuth();
  const { addItem, getTotalItems } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { 'product-slug': slug } = await params;
      
      // For now, create mock product data using real product ID from database
      // In real implementation, fetch from API
      const mockProduct: Product = {
        _id: '68a09e3d02e200cf66399517', // Real product ID from database
        name: 'Premium Brand Kit',
        slug: slug,
        description: 'A comprehensive brand kit that includes logos, color palettes, typography, brand guidelines, templates, and more. Perfect for businesses looking to establish a strong brand identity.',
        price: {
          amount: 232.99, // Real price from database
          currency: 'USD'
        },
        creditsCost: 2443, // Real credits cost from database
        images: [
          {
            url: 'https://placehold.co/600x400/87CEEB/FFFFFF?text=Product+Image+1',
            alt: 'Product Image 1'
          },
          {
            url: 'https://placehold.co/600x400/98D8C8/FFFFFF?text=Product+Image+2',
            alt: 'Product Image 2'
          },
          {
            url: 'https://placehold.co/600x400/F7DC6F/FFFFFF?text=Product+Image+3',
            alt: 'Product Image 3'
          },
          {
            url: 'https://placehold.co/600x400/BB8FCE/FFFFFF?text=Product+Image+4',
            alt: 'Product Image 4'
          }
        ],
        category: 'Brand Kits',
        rating: 4.8,
        reviews: 127,
        inStock: true
      };

      setProduct(mockProduct);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      
      // Add the product to cart multiple times based on quantity
      for (let i = 0; i < quantity; i++) {
        addItem({
          productId: product._id,
          productName: product.name,
          productSlug: product.slug,
          price: product.price.amount,
          creditsCost: product.creditsCost,
          imageUrl: product.images[0]?.url,
        });
      }
      
      // Show success message
      alert(`${quantity} item${quantity > 1 ? 's' : ''} added to cart successfully!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Product not found</p>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Products
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link href="/checkout" className="relative text-gray-600 hover:text-orange-500 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            {user && (
              <div className="flex items-center space-x-2 text-sm">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-medium">{user.credits} credits</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              <Image
                src={product.images[selectedImage]?.url || product.images[0]?.url || 'https://placehold.co/600x600'}
                alt={product.images[selectedImage]?.alt || product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index 
                      ? 'border-orange-500 shadow-md' 
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 25vw, 12.5vw"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Product Info */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-gray-500">{product.category}</span>
                <span className="text-gray-300">•</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              <p className="text-gray-600 leading-relaxed mb-6">
                {product.description}
              </p>
            </div>

            {/* Pricing */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      ${product.price.amount}
                    </span>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-medium">
                        {product.creditsCost} credits
                      </span>
                    </div>
                  </div>
                  
                  {user && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">Your Credits:</span>
                        <span className="font-medium text-blue-600">{user.credits}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-700">Can pay with credits:</span>
                        <span className={`font-medium ${user.credits >= product.creditsCost ? 'text-green-600' : 'text-red-600'}`}>
                          {user.credits >= product.creditsCost ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-gray-900 font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    disabled={quantity >= 10}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={addingToCart || !product.inStock}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  size="lg"
                >
                  {addingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="px-4"
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>

              {!product.inStock && (
                <p className="text-red-600 text-sm">This product is currently out of stock.</p>
              )}
            </div>

            {/* Product Features */}
            <Card>
              <CardHeader>
                                 <CardTitle className="text-lg">What&apos;s Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    High-resolution logo files (PNG, SVG, AI)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Complete color palette with hex codes
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Typography guidelines and font files
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Brand style guide and usage examples
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Social media templates and assets
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Business card and letterhead designs
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}