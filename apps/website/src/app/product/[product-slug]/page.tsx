"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, PlayIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useCart } from "@/contexts/CartContext";
import ProductCard from "@/components/ProductCard";
import { useProductPurchase } from "@/hooks/useProductPurchase";
import { Download } from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ProductImage {
  _id: string;
  url: string;
  originalname?: string;
  filename?: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  slug: string;
  sku: string; // Added SKU field
  price?: {
    amount: number;
    currency: string;
  };
  creditsCost?: number;
  images: ProductImage[];
  flipbookUrl?: string;
  category?: string;
  subcategory?: string;
  relatedProducts?: RelatedProduct[];
  type?: string; // Product type: 'digital', 'physical', 'service', 'kitProduct'
  isKitProduct?: boolean; // Whether this is a kit product
}

interface RelatedProduct {
  _id: string;
  name: string;
  description: string;
  slug: string;
  price?: {
    amount: number;
    currency: string;
  };
  creditsCost?: number;
  images: ProductImage[];
  category?: string;
  subcategory?: string;
}

interface ApiRelatedProduct {
  _id: string;
  name: string;
  description: string;
  slug: string;
  price?: {
    amount: number;
    currency: string;
  };
  creditsCost?: number;
  images?: ProductImage[];
  categoryId?: { slug: string };
  itemId?: { slug: string };
  category?: string;
  subcategory?: string;
}



interface ProductPageProps {
  params: Promise<{ "product-slug": string }>;
}

const includedItems = [
  "logo","photography","brand tone","stationery","instagram starter kit"
];
// Flipbook Embed Component
const FlipbookEmbed = ({
  flipbookUrl,
  title = "Product Catalog",
}: {
  flipbookUrl: string;
  title?: string;
}) => {
  return (
    <div className="w-full h-full">
      <iframe
        src={flipbookUrl}
        width="100%"
        height="100%"
        allowFullScreen
        className="w-full h-full rounded-lg"
        title={title}
      />
    </div>
  );
};



export default function ProductPage({ params }: ProductPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const router = useRouter();
  const { addItem } = useCart();
  
  // Check if the product is purchased
  const { isPurchased, isLoading: purchaseLoading } = useProductPurchase(product?._id || '');

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      try {
        setLoading(true);

        const resolvedParams = await params;
        const slug = resolvedParams["product-slug"];
        if (!slug) {
          console.error("Slug is undefined or empty");
          throw new Error("Product slug is required");
        }
        
        const productResponse = await fetch(`${API_URL}/api/products/slug/${slug}`);
        
        if (!productResponse.ok) {
          if (productResponse.status === 404) {
            throw new Error("Product not found");
          }
          throw new Error("Failed to fetch product");
        }
        
        const productData = await productResponse.json();
        const fetchedProduct = productData.product;
        const fetchedRelatedProducts = productData.relatedProducts || [];
        
        // Transform the API response to match our interface
        const transformedProduct: Product = {
          _id: fetchedProduct._id,
          name: fetchedProduct.name,
          description: fetchedProduct.description,
          slug: fetchedProduct.slug,
          sku: fetchedProduct.sku || "", // Ensure sku is included
          price: fetchedProduct.price,
          creditsCost: fetchedProduct.creditsCost,
          images: fetchedProduct.images || [],
          flipbookUrl: fetchedProduct.flipbookUrl,
          category: fetchedProduct.categoryId?.slug || fetchedProduct.category,
          subcategory: fetchedProduct.itemId?.slug || fetchedProduct.subcategory,
          relatedProducts: fetchedRelatedProducts,
          type: fetchedProduct.type,
          isKitProduct: fetchedProduct.isKitProduct
        };
        
        console.log('Product data from API:', fetchedProduct);
        console.log('Transformed product:', transformedProduct);
        setProduct(transformedProduct);

        // Transform related products from API response
        const transformedRelatedProducts: RelatedProduct[] = fetchedRelatedProducts.map((p: ApiRelatedProduct) => ({
          _id: p._id,
          name: p.name,
          description: p.description,
          slug: p.slug,
          price: p.price,
          creditsCost: p.creditsCost,
          images: p.images || [],
          category: p.categoryId?.slug || p.category,
          subcategory: p.itemId?.slug || p.subcategory
        }));
        
        setRelatedProducts(transformedRelatedProducts);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndRelated();
  }, [params]);

  // Use product images or fallback to placeholder
  const images = product?.images?.map(img => img.url) || [
    "https://placehold.co/600x400/87CEEB/FFFFFF?text=Product+Image+1",
    "https://placehold.co/600x400/87CEEB/FFFFFF?text=Product+Image+2",
    "https://placehold.co/600x400/87CEEB/FFFFFF?text=Product+Image+3",
  ];

  // Check if we should show flipbook or images
  const showFlipbook = !!product?.flipbookUrl;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      
      addItem({
        productId: product._id,
        productName: product.name,
        productSlug: product.slug,
        price: product.price?.amount || 0,
        creditsCost: product.creditsCost || 0,
        imageUrl: product.images?.[0]?.url,
        category: product.category,
      });
      
      toast.success('Added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleRelatedProductClick = (productSlug: string) => {
    router.push(`/product/${productSlug}`);
  };

  const handleDownloadProduct = async () => {
    if (!product) return;
    
    try {
      setDownloading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please log in to download your digital products');
        return;
      }
      
      // Get the download URL from our frontend API
      const response = await fetch(`/api/assets/digital-product/${product._id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 401) {
          toast.error('Please log in to download this product');
          return;
        }
        
        if (response.status === 403) {
          toast.error('You need to purchase this product to download it');
          return;
        }
        
        throw new Error(errorData.message || 'Failed to get download URL');
      }

      const { downloadUrl } = await response.json();

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${product.name}.zip`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Download started! The link will expire in 5 minutes.');
    } catch (error) {
      console.error('Error downloading product:', error);
      toast.error('Failed to download the file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sunrise"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">Error: {error || "Product not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFCFB]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mt-8 sm:mt-12 lg:mt-16 xl:mt-20 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Left Section - Image Carousel or Flipbook */}
          <div className="relative w-full">
            <div
              className="relative overflow-hidden rounded-lg bg-gray-100 w-full"
              style={{ aspectRatio: "3/2" }}
            >
              {showFlipbook ? (
                // Flipbook Display
                <FlipbookEmbed
                  flipbookUrl={product.flipbookUrl!}
                  title={product.name}
                />
              ) : (
                // Image Carousel
                <>
                  {/* Image Container */}
                  <div
                    className="flex transition-transform duration-500 ease-in-out h-full"
                    style={{
                      transform: `translateX(-${currentImageIndex * 100}%)`,
                      width: `${images.length * 100}%`,
                    }}
                  >
                    {images.map((image: string, index: number) => (
                      <div
                        key={index}
                        className="relative w-full h-full"
                        style={{ width: `${100 / images.length}%` }}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} image ${index + 1}`}
                          className="object-cover"
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 45vw"
                          priority={index === 0}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Navigation Arrows - Only show for images */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center transition-all duration-200 hover:scale-110 bg-white/20 backdrop-blur-sm rounded-full"
                        aria-label="Previous image"
                      >
                        <ChevronLeft
                          className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-orange-500 font-bold"
                          strokeWidth={3}
                        />
                      </button>

                      <button
                        onClick={nextImage}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center transition-all duration-200 hover:scale-110 bg-white/20 backdrop-blur-sm rounded-full"
                        aria-label="Next image"
                      >
                        <ChevronRight
                          className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-orange-500 font-bold"
                          strokeWidth={3}
                        />
                      </button>

                      {/* Image Indicators - Only show for images */}
                      <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-1 sm:space-x-2">
                        {images.map((_: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                              index === currentImageIndex
                                ? "bg-orange-500 w-4 sm:w-6"
                                : "bg-white/60 hover:bg-white"
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Section - Product Information */}
          <div className="flex flex-col justify-center mt-6 lg:mt-0">
            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[32px] font-balgin-regular text-[#FA7035] leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="text-xl sm:text-2xl lg:text-[24px] text-gray-900 mt-2 sm:mt-3">
              {product.price ? `$${product.price.amount}` : "Contact for pricing"}
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg mt-4 sm:mt-5 text-gray-700 leading-relaxed w-full sm:max-w-md">
              {product.description}
            </p>

            {/* Call-to-Action Buttons */}
            <div className="flex mt-6 sm:mt-8 lg:mt-10 flex-row sm:flex-col gap-2 sm:gap-4 w-full lg:max-w-[30%]">
              {/* Show download button if user has purchased this digital/kit product */}
              {(() => {
                return isPurchased && (product.type === 'digital' || product.isKitProduct);
              })() ? (
                <Button
                  onClick={handleDownloadProduct}
                  disabled={downloading}
                  className="flex-1 sm:w-full border-[#D94506] border-2 sm:border-3 bg-[#FFC1A0] text-black font-avenir text-xs sm:text-sm lg:text-base px-2 sm:px-4 py-2 sm:py-3 hover:bg-orange-600 transition-all duration-200 min-w-0"
                >
                  {downloading ? (
                    'Downloading...'
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 sm:w-full border-[#FCA17A] border-2 sm:border-2 text-gray-900 font-avenir text-xs sm:text-sm lg:text-base px-2 sm:px-4 py-2 sm:py-3 hover:bg-orange-50 hover:border-orange-600 transition-all duration-200 min-w-0"
                  >
                    Buy Now
                  </Button>

                  <Button 
                    className="flex-1 sm:w-full border-[#FCA17A] border-2 sm:border-2 bg-[#FFC1A0] text-black font-avenir text-xs sm:text-sm lg:text-base px-2 sm:px-4 py-2 sm:py-3 hover:bg-[#FCA17A]/50 transition-all duration-200 min-w-0"
                    onClick={handleAddToCart}
                    disabled={addingToCart || purchaseLoading}
                  >
                    {addingToCart ? 'Adding...' : 'Add To Cart'}
                  </Button>
                </>
              )}  
            </div>
          </div>
        </div>
      </div>

      {/* What's Included Points Section */}
      <section className="relative px-4 sm:px-6 md:px-10 lg:px-16 xl:px-18 pb-12 sm:pb-16 mt-12 sm:mt-16 lg:mt-20">
        {/* Background color using product.kitColorHex (fallback to theme color) */}
        <div
          className="absolute bg-[#CFDAE9] inset-0"
        />

        {/* Content */}
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl pt-8 sm:pt-10 font-bold mb-4 sm:mb-5">
            What&apos;s Included?
          </h2>
          <div className="w-full max-w-2xl">
            <ul className="space-y-3 sm:space-y-4 pt-2">
              {includedItems.map((item, idx) => (
                <li key={idx} className="flex items-center py-2">
                  <span className=" mr-4 sm:mr-6 flex-shrink-0"><PlayIcon fill="black" className="w-4 h-4 sm:w-5 sm:h-5" /></span>
                  <span className="text-base sm:text-lg font-semibold uppercase leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="w-full flex flex-col py-8 sm:py-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl px-4 sm:px-6 md:px-10 lg:px-16 xl:px-18 pt-6 sm:pt-8 lg:pt-10 font-balgin-regular mb-6 sm:mb-8 text-black">
            Related Products
          </h2>
          <div className="w-full overflow-hidden">
            <div className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory px-4 sm:px-6 md:px-10 lg:px-16 xl:px-18 pb-4">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct._id} className="flex-none w-56 border-2 rounded-md border-[#FFC1A0] sm:w-64 lg:w-72 snap-start">
                  <div className="flex flex-col bg-white rounded-lg   duration-300 overflow-hidden h-full">
                    <div 
                      className="w-full cursor-pointer relative"
                      onClick={() => handleRelatedProductClick(relatedProduct.slug)}
                    >
                      <ProductCard
                        image={relatedProduct.images?.[0]?.url || "https://placehold.co/400x500?text=Product"}
                        className="w-full"
                      />
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-3 sm:p-4 flex-1 flex flex-col">
                      <h3 
                        className="text-base sm:text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-orange-600 transition-colors line-clamp-2"
                        onClick={() => handleRelatedProductClick(relatedProduct.slug)}
                      >
                        {relatedProduct.name}
                      </h3>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-base sm:text-lg font-bold text-gray-900">
                          {relatedProduct.price ? `$${relatedProduct.price.amount}` : "Contact for pricing"}
                        </span>
                      </div>
                      
                      <button 
                        className="w-full bg-[#FFC1A0] text-black py-2 px-3 sm:px-4 rounded-md font-medium text-sm sm:text-base hover:bg-orange-600 transition-colors duration-200"
                        onClick={() => {
                          addItem({
                            productId: relatedProduct._id,
                            productName: relatedProduct.name,
                            productSlug: relatedProduct.slug,
                            price: relatedProduct.price?.amount || 0,
                            creditsCost: relatedProduct.creditsCost || 0,
                            imageUrl: relatedProduct.images?.[0]?.url,
                            category: relatedProduct.category,
                          });
                          toast.success('Added to cart');
                        }}
                      >
                        Add To Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="flex justify-center sm:justify-start mt-8 sm:mt-12 mb-8 sm:mb-12 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-18">
        <button
          className="border-2 border-[#FCA17A] rounded-xl bg-transparent text-black font-semibold px-6 sm:px-8 py-2 sm:py-3 transition-colors  text-base sm:text-lg hover:bg-white hover:text-black w-full sm:w-auto max-w-xs sm:max-w-none"
          onClick={() => router.push("/")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
