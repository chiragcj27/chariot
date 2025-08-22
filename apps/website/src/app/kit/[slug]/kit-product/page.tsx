"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface KitImage {
  _id: string;
  url: string;
  originalname: string;
  filename: string;
}

interface Kit {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: KitImage;
  onHoverImage?: KitImage;
  mainImage?: KitImage;
  carouselImages?: KitImage[];
  testimonials?: string[];
  createdAt: string;
  updatedAt: string;
}

interface KitProductPageProps {
  params: Promise<{ slug: string }>;
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
    question: "What is included in a brand kit?",
    answer:
      "A brand kit typically includes logos, color palettes, typography, brand guidelines, templates, and more, depending on your needs.",
  },
  {
    question: "Can I request custom assets?",
    answer:
      "Absolutely! We offer full customization, including new assets, templates, and brand elements tailored to your requirements.",
  },
  {
    question: "How long does it take to deliver a custom kit?",
    answer:
      "Delivery time depends on the scope of customization, but most kits are ready within 1-2 weeks.",
  },
  {
    question: "Do you offer support after delivery?",
    answer:
      "Yes, we provide post-delivery support to ensure your brand kit is implemented smoothly.",
  },
  {
    question: "Can I update my kit later?",
    answer: "Of course! You can request updates or new assets at any time.",
  },
];

// Product data - can have either images or flipbook
const productData = {
  // For image carousel
  images: [
    "https://placehold.co/600x400/87CEEB/FFFFFF?text=Product+Image+1",
    "https://placehold.co/600x400/87CEEB/FFFFFF?text=Product+Image+2",
    "https://placehold.co/600x400/87CEEB/FFFFFF?text=Product+Image+3",
    "https://placehold.co/600x400/87CEEB/FFFFFF?text=Product+Image+4",
  ],
  // For flipbook (set this to enable flipbook instead of images)
  flipbookUrl: "https://heyzine.com/flip-book/9ed613b90d.html", // "https://heyzine.com/flip-book/9ed613b90d.html"
};

// Sample products data - replace with actual data from your API
const sampleProducts = [
  {
    id: 1,
    name: "Maroon Velvet Packaging",
    type: "image",
    url: "https://placehold.co/600x800/8B0000/FFFFFF?text=Maroon+Velvet+Packaging",
    description: "Luxurious maroon velvet boxes and pouches for jewelry",
  },
  {
    id: 2,
    name: "Branding & Stationery",
    type: "image",
    url: "https://placehold.co/600x800/F5DEB3/000000?text=Branding+Stationery",
    description: "Elegant branding materials with gold accents",
  },
  {
    id: 3,
    name: "Logo & Branding Concepts",
    type: "image",
    url: "https://placehold.co/600x800/2F4F4F/FFFFFF?text=Logo+Concepts",
    description: "Professional logo designs and branding elements",
  },
  {
    id: 4,
    name: "Product Photography Guide",
    type: "pdf",
    flipbookUrl: "https://heyzine.com/flip-book/9ed613b90d.html",
    description: "Complete guide to product photography setup",
  },
  {
    id: 5,
    name: "Marketing Materials",
    type: "image",
    url: "https://placehold.co/600x800/4682B4/FFFFFF?text=Marketing+Materials",
    description: "Comprehensive marketing toolkit",
  },
  {
    id: 6,
    name: "Brand Guidelines",
    type: "pdf",
    flipbookUrl: "https://heyzine.com/flip-book/9ed613b90d.html",
    description: "Complete brand guidelines and standards",
  },
];

export default function KitProductPage({ params }: KitProductPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null); // For FAQ accordion
  const [kit, setKit] = useState<Kit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if we should show flipbook or images
  const showFlipbook = !!productData.flipbookUrl;
  const images = productData.images;

  useEffect(() => {
    const fetchKit = async () => {
      try {
        setLoading(true);
        const { slug } = await params;
        const response = await fetch(`${API_URL}/api/kits/slug/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error("Failed to fetch kit");
        }

        const data = await response.json();
        setKit(data);
      } catch (err) {
        console.error("Error fetching kit:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch kit");
      } finally {
        setLoading(false);
      }
    };

    fetchKit();
  }, [params]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sunrise"></div>
      </div>
    );
  }

  if (error || !kit) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">Error: {error || "Kit not found"}</p>
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
                  flipbookUrl={productData.flipbookUrl!}
                  title="Product Catalog"
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
                          alt={`Product image ${index + 1}`}
                          className="object-cover"
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Navigation Arrows - Only show for images */}
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
            </div>
          </div>

          {/* Right Section - Product Information */}
          <div className="flex flex-col justify-center">
            {/* Product Title */}
            <h1 className="text-4xl font-balgin-regular lg:text-[32px] text-[#FA7035]">
              Product, Service Name
            </h1>

            {/* Price */}
            <div className="text-[24px] text-gray-900">Price</div>

            {/* Description */}
            <p className="text-lg mt-5 text-gray-700 leading-relaxed">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry&apos;s standard dummy
              text ever since the 1500s, when an unknown printer took a galley
              of type and scrambled it to make a type specimen book.
            </p>

            {/* Call-to-Action Buttons */}
            <div className="flex mr-150 mt-10 flex-col gap-4 pt-4">
              <Button
                variant="outline"
                className="flex-1 border-[#D94506] border-3 text-gray-900 font-avenir text-[16px] w-[150] hover:bg-orange-50 hover:border-orange-600 transition-all duration-200"
              >
                Buy Now
              </Button>

              <Button className="flex-1 border-[#D94506] border-3 bg-[#FFC1A0] text-black font-avenir text-[16px] w-[150] hover:bg-orange-600 transition-all duration-200">
                Add To Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
      <section className="relative px-5 md:px-10 lg:px-18 pb-16 mt-20">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{
            backgroundImage: kit.mainImage
              ? `url(${kit.mainImage.url})`
              : "none",
            backgroundColor: kit.mainImage ? "transparent" : "#FA7035",
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0"></div>
        </div>

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
      {/* kit products section*/}
      <section>
        <h2 className="text-4xl px-5 md:px-10 lg:px-18 pt-10 font-balgin-regular mb-5 text-black">
          Products
        </h2>
        <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 px-5 md:px-10 lg:px-18 scrollbar-hide">
          {sampleProducts.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-48 sm:w-56 md:w-80 h-64 sm:h-72 md:h-120 bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl"
              style={{ aspectRatio: "2/3" }}
            >
              <div className="relative w-full h-full group">
                {product.type === "image" ? (
                  <>
                    <Image
                      src={product.url || ""}
                      alt={product.name}
                      fill
                      className="object-cover transition-all duration-300 group-hover:scale-105"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center">
                      <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 px-4">
                        <h3 className="text-lg sm:text-xl font-semibold mb-2 leading-tight">
                          {product.name}
                        </h3>
                        <p className="text-xs sm:text-sm leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full">
                    <FlipbookEmbed
                      flipbookUrl={product.flipbookUrl || ""}
                      title={product.name}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
      <div className="flex mt-12">
        <button
          className="border-2 border-white rounded-full bg-transparent text-black font-semibold px-8 py-3 transition-colors shadow-lg text-lg hover:bg-white hover:text-black"
          onClick={() => router.push("/")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
