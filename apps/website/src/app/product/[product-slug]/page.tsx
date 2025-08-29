"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useCart } from "@/contexts/CartContext";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

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

const faqs = [
  {
    question: "What is included in this product?",
    answer:
      "This product includes comprehensive features, detailed documentation, and full support to help you get started quickly.",
  },
  {
    question: "Can I request custom modifications?",
    answer:
      "Absolutely! We offer full customization, including new features, modifications, and enhancements tailored to your requirements.",
  },
  {
    question: "How long does it take to deliver?",
    answer:
      "Delivery time depends on the scope of customization, but most products are ready within 1-2 weeks.",
  },
  {
    question: "Do you offer support after purchase?",
    answer:
      "Yes, we provide post-purchase support to ensure your product is implemented smoothly.",
  },
  {
    question: "Can I update my product later?",
    answer: "Of course! You can request updates or new features at any time.",
  },
];

export default function ProductPage({ params }: ProductPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const router = useRouter();
  const { addItem } = useCart();

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
          relatedProducts: fetchedRelatedProducts
        };
        
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
      });
      
      alert('Product added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleRelatedProductClick = (productSlug: string) => {
    router.push(`/product/${productSlug}`);
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
      <div className="container mx-auto px-4 py-8">
        <div className="mt-30 mx-15 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Section - Image Carousel or Flipbook */}
          <div className="relative">
            <div
              className="relative overflow-hidden rounded-lg bg-gray-100"
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
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Navigation Arrows - Only show for images */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center transition-all duration-200 hover:scale-110"
                        aria-label="Previous image"
                      >
                        <ChevronLeft
                          className="w-10 h-10 text-orange-500 font-bold"
                          strokeWidth={3}
                        />
                      </button>

                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center transition-all duration-200 hover:scale-110"
                        aria-label="Next image"
                      >
                        <ChevronRight
                          className="w-10 h-10 text-orange-500 font-bold"
                          strokeWidth={3}
                        />
                      </button>

                      {/* Image Indicators - Only show for images */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        {images.map((_: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                              index === currentImageIndex
                                ? "bg-orange-500 w-6"
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
          <div className="flex flex-col justify-center">
            {/* Product Title */}
            <h1 className="text-4xl font-balgin-regular lg:text-[32px] text-[#FA7035]">
              {product.name}
            </h1>

            {/* Price */}
            <div className="text-[24px] text-gray-900">
              {product.price ? `$${product.price.amount}` : "Contact for pricing"}
            </div>

            {/* Description */}
            <p className="text-lg mt-5 text-gray-700 leading-relaxed">
              {product.description}
            </p>

            {/* Call-to-Action Buttons */}
            <div className="flex mr-150 mt-10 flex-col gap-4 pt-4">
              <Button
                variant="outline"
                className="flex-1 border-[#D94506] border-3 text-gray-900 font-avenir text-[16px] w-[150] hover:bg-orange-50 hover:border-orange-600 transition-all duration-200"
              >
                Buy Now
              </Button>

              <Button 
                className="flex-1 border-[#D94506] border-3 bg-[#FFC1A0] text-black font-avenir text-[16px] w-[150] hover:bg-orange-600 transition-all duration-200"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? 'Adding...' : 'Add To Cart'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* What's Included FAQ Section */}
      <section className="relative px-5 md:px-10 lg:px-18 pb-16 mt-20 bg-orange-50">
        {/* Content */}
        <div className="relative z-10">
          <h2 className="text-4xl pt-10 font-bold mb-5 text-black">
            What&apos;s Included?
          </h2>
          <div className="w-full">
            {faqs.map((faq, idx) => (
              <div key={idx} className="mb-1">
                <div
                  className="flex items-center cursor-pointer py-4 group"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  {/* Orange Plus/Minus Icon */}
                  <span
                    className="text-2xl text-[#FA7035] font-bold mr-6 select-none transition-transform duration-200 group-hover:scale-110"
                    style={{ minWidth: "24px", textAlign: "center" }}
                  >
                    {openFaq === idx ? "−" : "+"}
                  </span>

                  {/* Question Text */}
                  <span className="text-lg font-semibold text-black flex-1">
                    {faq.question}
                  </span>
                </div>

                {/* Answer */}
                {openFaq === idx && (
                  <div className="pl-10 pb-4 text-black font-medium">
                    {faq.answer}
                  </div>
                )}

                {/* Orange Separator Line */}
                <div className="border-1 border-[#FA7035] w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="w-full flex flex-col items-center py-10">
          <h2 className="text-4xl px-5 md:px-10 lg:px-18 pt-10 font-balgin-regular mb-8 text-black">
            Related Products
          </h2>
          <div className="w-full max-w-6xl px-5 md:px-10 lg:px-18">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct._id} className="flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
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
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 
                      className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-orange-600 transition-colors"
                      onClick={() => handleRelatedProductClick(relatedProduct.slug)}
                    >
                      {relatedProduct.name}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-gray-900">
                        {relatedProduct.price ? `$${relatedProduct.price.amount}` : "Contact for pricing"}
                      </span>
                    </div>
                    
                    <button 
                      className="w-full bg-[#FFC1A0] text-black py-2 px-4 rounded-md font-medium hover:bg-orange-600 transition-colors duration-200"
                      onClick={() => {
                        addItem({
                          productId: relatedProduct._id,
                          productName: relatedProduct.name,
                          productSlug: relatedProduct.slug,
                          price: relatedProduct.price?.amount || 0,
                          creditsCost: relatedProduct.creditsCost || 0,
                          imageUrl: relatedProduct.images?.[0]?.url,
                        });
                        alert('Related product added to cart!');
                      }}
                    >
                      Add To Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="flex mt-12 mb-12 px-18">
        <button
          className="border-2 border-[#D94506] rounded-xl bg-transparent text-black font-semibold px-8 py-3 transition-colors shadow-lg text-lg hover:bg-white hover:text-black"
          onClick={() => router.push("/")}
        >
          Back to Home
        </button>
      </div>
      <Footer/>
    </div>
  );
}
