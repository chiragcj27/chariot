"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight,PlayIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useKitProducts, type ProductImage, type ProductFile, type KitImageMetadataItem, type KitFileMetadataItem } from "@/hooks/useKits";

// Removed unused Kit interface

interface PageProps {
  params: Promise<{ slug: string; product: string }>;
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

const includedItems = [
    "logo","photography","brand tone","stationery","instagram starter kit"
];

export default function KitProductDetailPage({ params }: PageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [kitSlug, setKitSlug] = useState<string>("");
  const [productSlug, setProductSlug] = useState<string>("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; title?: string; description?: string } | null>(null);
  
  const router = useRouter();
  const { addItem, setBuyNowItem } = useCart();
  
  // Use SWR hook for fetching kit products
  const { products, isLoading, isError, error } = useKitProducts(kitSlug);
  

  // Extract params and set kit slug for SWR
  useEffect(() => {
    const extractParams = async () => {
      const { slug, product } = await params;
      setKitSlug(slug);
      setProductSlug(product);
    };
    extractParams();
  }, [params]);

  // Find the specific product from the cached products
  const product = useMemo(() => {
    if (!products.length || !productSlug) return null;
    const found = products.find((p) => p.slug === productSlug);
    if (!found) {
      notFound();
    }
    return found;
  }, [products, productSlug]);

  const images = useMemo(() => (product?.images || []).map((img) => img.url), [product]);
  const imageUrls = useMemo(() => images.filter((u) => !!u), [images]);
  const imageKey = useMemo(() => imageUrls.join("|"), [imageUrls]);

  useEffect(() => {
    // reset index when the image set changes
    setCurrentImageIndex(0);
  }, [imageKey]);



  const kitImageMetaMap = useMemo(() => {
    const map = new Map<string, KitImageMetadataItem>();
    (product?.kitImageMetadata || []).forEach((m) => {
      map.set(String(m.imageId), m);
    });
    return map;
  }, [product]);

  const kitFileMetaMap = useMemo(() => {
    const map = new Map<string, KitFileMetadataItem>();
    (product?.kitFileMetadata || []).forEach((m) => {
      map.set(String(m.fileId), m);
    });
    return map;
  }, [product]);

  const flipbookUrlMap = useMemo(() => {
    const map = new Map<string, string>();
    (product?.flipbookUrls || []).forEach((f) => {
      map.set(String(f.fileId), f.url);
    });
    return map;
  }, [product]);

  // Build alternating sequence: one kitImage, then one kitFile (as flipbook)
  const alternatingMedia = useMemo(() => {
    const imgs = product?.kitImages || [];
    const files = product?.kitFiles || [];
    const maxLen = Math.max(imgs.length, files.length);
    const seq: Array<
      | { kind: "image"; image: ProductImage; meta?: KitImageMetadataItem }
      | { kind: "file"; file: ProductFile; meta?: KitFileMetadataItem; flipbookUrl?: string }
    > = [];
    for (let i = 0; i < maxLen; i++) {
      if (imgs[i]) {
        const img = imgs[i];
        seq.push({ kind: "image", image: img, meta: kitImageMetaMap.get(String(img._id)) });
      }
      if (files[i]) {
        const file = files[i];
        seq.push({
          kind: "file",
          file,
          meta: kitFileMetaMap.get(String(file._id)),
          flipbookUrl: flipbookUrlMap.get(String(file._id)),
        });
      }
    }
    return seq;
  }, [product, kitImageMetaMap, kitFileMetaMap, flipbookUrlMap]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
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
        category: 'kit',
      });
      toast.success("Added to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    try {
      setBuyingNow(true);
      setBuyNowItem({
        productId: product._id,
        productName: product.name,
        productSlug: product.slug,
        price: product.price?.amount || 0,
        creditsCost: product.creditsCost || 0,
        imageUrl: product.images?.[0]?.url,
        category: 'kit',
      });
      router.push('/checkout');
    } catch (error) {
      console.error('Error setting up buy now:', error);
      toast.error('Failed to proceed to checkout. Please try again.');
    } finally {
      setBuyingNow(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sunrise"></div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">Error: {error?.message || "Product not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFCFB]">
      <div className="container mx-auto px-4 py-8">
        <div className="lg:mt-5 lg:mx-15 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Section - Image Carousel */}
          <div className="relative">
            <div
              className="relative overflow-hidden  bg-gray-100"
              style={{ aspectRatio: "1/1" }}
            >
              {/* Image Container */}
              {imageUrls.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No images available
                </div>
              ) : (
                <div
                  className="flex transition-transform duration-500 ease-in-out h-full"
                  style={{
                    transform: `translateX(-${currentImageIndex * 100}%)`,
                  }}
                >
                  {imageUrls.map((image: string, index: number) => (
                    <div
                      key={index}
                      className="relative w-full h-full flex-none"
                    >
                      <Image
                        src={image}
                        alt={`Product image ${index + 1}`}
                        className="object-cover"
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Navigation Arrows */}
              {imageUrls.length > 1 && (
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

                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {imageUrls.map((_: string, index: number) => (
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
            </div>
          </div>

          {/* Right Section - Product Information */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-balgin-regular lg:text-[32px] text-black">
              {product.name}
            </h1>
            <div className="text-[20px] 2xl:text-[24px] text-gray-900">
              {product.price?.amount ? `$${product.price.amount}` : ""}
            </div>
            <p className="text-lg mt-5 text-gray-700 leading-relaxed">
              {product.description}
            </p>
            <div className="flex mr-150 mt-10 flex-row w-full lg:flex-col gap-4 pt-4">
              <Button
                variant="outline"
                className="flex-1 border-black border-2 text-gray-900 font-avenir text-[16px] py-2 w-[160] hover:bg-gray-900 hover:text-white transition-all duration-200"
                onClick={handleBuyNow}
                disabled={buyingNow}
              >
                {buyingNow ? 'Processing...' : 'Buy Now'}
              </Button>

              <Button 
                className="flex-1 border-black border-2 bg-gray-900 text-white font-avenir text-[16px] py-2 w-[160] hover:bg-gray-900 transition-all duration-200"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? 'Adding...' : 'Add To Cart'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* What's Included Points Section */}
      <section className="relative px-5 md:px-10 lg:px-18 pb-16 mt-5">
        {/* Background color using product.kitColorHex (fallback to theme color) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: (product?.kitColorHex && /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(product.kitColorHex)) ? product.kitColorHex : '#FA7035'
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <h2 className="text-4xl pt-10 font-bold mb-5 text-white">
            What&apos;s Included?
          </h2>
          <div className="w-full">
            <ul className="space-y-2 pt-2">
              {includedItems.map((item, idx) => (
                <li key={idx} className="flex items-center py-2">
                  <span className="text-white mr-6 "><PlayIcon fill="white" className=" w-4 h-4 " /></span>
                  <span className="text-lg font-semibold text-white uppercase">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Alternating kit media section */}
      <section>
        <h2 className="text-4xl px-5 md:px-10 lg:px-18 pt-10 font-balgin-regular mb-5 text-black">
          Products
        </h2>
        <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 px-5 md:px-10 lg:px-18 scrollbar-hide">
          {alternatingMedia.length === 0 && (
            <div className="text-gray-500 py-8">No kit media available.</div>
          )}
          {alternatingMedia.map((entry, idx) => (
              <div
              key={idx}
              className="flex-shrink-0 w-48 sm:w-56 md:w-70 h-64 sm:h-72 md:h-100 bg-white shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl"
              style={{ aspectRatio: "2/3" }}
            >
              <div className="relative w-full h-full group">
                                                {entry.kind === "image" ? (
                  <>
                    <div 
                      className="w-full h-full cursor-pointer"
                      onClick={() => {
                        setSelectedImage({
                          url: entry.image.url,
                          title: entry.meta?.title,
                          description: entry.meta?.description
                        });
                      }}
                    >
                      <Image
                        src={entry.image.url}
                        alt={entry.meta?.title || entry.image.originalname || "Kit Image"}
                        fill
                        className="object-cover transition-all duration-300 group-hover:scale-105"
                      />
                    </div>
                    {(entry.meta?.title || entry.meta?.description) && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-all duration-300 flex items-center justify-center pointer-events-none">
                        <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 px-4">
                          {entry.meta?.title && (
                            <h3 className="text-lg sm:text-xl mb-2 leading-tight">
                              {entry.meta.title}
                            </h3>
                          )}
                          {entry.meta?.description && (
                            <p className="text-xs sm:text-sm leading-relaxed">
                              {entry.meta.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full">
                    {entry.flipbookUrl ? (
                      <FlipbookEmbed
                        flipbookUrl={entry.flipbookUrl}
                        title={entry.meta?.title || entry.file.originalname || "Flipbook"}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                        No flipbook available
                      </div>
                    )}
                    {(entry.meta?.title || entry.meta?.description) && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-center">
                        {entry.meta?.title && (
                          <div className="text-sm font-semibold">{entry.meta.title}</div>
                        )}
                        {entry.meta?.description && (
                          <div className="text-xs">{entry.meta.description}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Full Screen Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-[90vw] h-[90vh] max-w-[90vw] max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-300 transition-colors"
              aria-label="Close modal"
            >
              ×
            </button>
            <Image
              src={selectedImage.url}
              alt={selectedImage.title || "Kit Image"}
              fill
              className="object-contain w-full h-full"
            />
          </div>
        </div>
      )}

      <div className="flex mt-12 mb-12 px-18">
        <button
          className="border-2 border-sunrise bg-white rounded-xl hover:bg-sunrise text-black px-8 py-2 transition-colors shadow-lg text-lg hover:text-black"
          onClick={() => router.push("/")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
