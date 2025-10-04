'use client';

import { useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import Image from 'next/image';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import ProductCard from '@/components/ProductCard';
import DiscoveryCallButton from '@/components/DiscoveryCallButton';
import AskForQuoteButton from '@/components/AskForQuoteButton';
import Footer from '@/components/Footer';

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

interface KitProduct {
  _id: string;
  name: string;
  description: string;
  slug: string;
  typeOfKit?: 'premium' | 'basic';
  images: KitImage[];
  kitImages: KitImage[];
  kitFiles: KitImage[];
  price?: {
    amount: number;
    currency: string;
  };
  creditsCost?: number;
  discountedCreditsCost?: number;
  kitDescription?: string;
  kitInstructions?: string;
  kitContents?: string[];
}

interface KitPageProps {
  params: Promise<{ slug: string }>;
}

export default function KitPage({ params }: KitPageProps) {
  const [kit, setKit] = useState<Kit | null>(null);
  const [allKitProducts, setAllKitProducts] = useState<KitProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedPack, setSelectedPack] = useState<'premium' | 'basic'>('basic');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();

  const filteredProducts = allKitProducts.filter(
    (product) => product.typeOfKit === selectedPack
  );

  const faqs = [
    {
      question: 'What is included in a brand kit?',
      answer:
        'A brand kit typically includes logos, color palettes, typography, brand guidelines, templates, and more, depending on your needs.',
    },
    {
      question: 'Can I request custom assets?',
      answer:
        'Absolutely! We offer full customization, including new assets, templates, and brand elements tailored to your requirements.',
    },
    {
      question: 'How long does it take to deliver a custom kit?',
      answer:
        'Delivery time depends on the scope of customization, but most kits are ready within 1-2 weeks.',
    },
    {
      question: 'Do you offer support after delivery?',
      answer:
        'Yes, we provide post-delivery support to ensure your brand kit is implemented smoothly.',
    },
    {
      question: 'Can I update my kit later?',
      answer: 'Of course! You can request updates or new assets at any time.',
    },
  ];

  useEffect(() => {
    const fetchKitAndProducts = async () => {
      try {
        setLoading(true);
        const { slug } = await params;

        const kitResponse = await fetch(`${API_URL}/api/kits/slug/${slug}`);

        if (!kitResponse.ok) {
          if (kitResponse.status === 404) {
            notFound();
          }
          throw new Error('Failed to fetch kit');
        }

        const kitData = await kitResponse.json();
        setKit(kitData);

        const productsResponse = await fetch(
          `${API_URL}/api/products/kit/${slug}`
        );

        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setAllKitProducts(productsData.products || []);
        }
      } catch (err) {
        console.error('Error fetching kit and products:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch kit and products'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchKitAndProducts();
  }, [params]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [kit]);

  useEffect(() => {
    if (!kit?.carouselImages || kit.carouselImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prev) => (prev + 1) % kit.carouselImages!.length
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [kit?.carouselImages]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sunrise"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!kit) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Kit not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <div className="relative w-full min-h-screen  pb-40 md:pb-0">
        <div className="relative flex flex-col md:flex-row w-full min-h-[85vh] ">
          {/* MainIMG */}
          <div className="absolute left-0 top-0 md:w-[42%] w-[100%] z-10">
            <AspectRatio
              ratio={1 / 1}
              className="bg-pink-100 w-full h-full max-h-[calc(70vw)] md:max-h-full flex items-center justify-center"
            >
              {kit.mainImage && (
                <Image
                  width={1000}
                  height={1000}
                  src={kit.mainImage.url}
                  alt={kit.mainImage.originalname}
                  className="object-cover w-full h-full"
                />
              )}
            </AspectRatio>
          </div>
          {/* Carousel */}
          <div className="absolute left-[calc(5vw)] top-[calc(30vw)] w-[calc(65vw)] md:left-[25%] md:top-[calc(8vw)] md:w-[27%] z-20">
            <AspectRatio ratio={9 / 12} className="relative w-full h-full">
              <div className="relative w-full h-full">
                <Image
                  width={900}
                  height={1200}
                  src={'/frame.png'}
                  alt="frame"
                  className="w-full h-full object-contain"
                />
                {kit.carouselImages && kit.carouselImages.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center p-[7%]">
                    <div className="relative w-full h-full overflow-hidden rounded-lg">
                      <Image
                        src={kit.carouselImages[currentImageIndex].url}
                        alt={
                          kit.carouselImages[currentImageIndex].originalname
                        }
                        className="object-cover w-full h-full transition-opacity duration-500"
                        fill
                      />
                    </div>
                  </div>
                )}
              </div>
            </AspectRatio>
          </div>
          {/* Testimonials */}
          <div className="absolute left-[calc(35vw)] top-[calc(95vw)] w-[calc(55vw)] md:left-[17%] md:top-[calc(34vw)] md:w-[25%] z-30">
            <AspectRatio ratio={16/9} className="w-full h-full">
              <TestimonialsCarousel testimonials={kit.testimonials} />
            </AspectRatio>
          </div>
          {/* Info */}
          <div className="absolute top-[calc(130vw)] px-6 md:px-0 w-full md:left-[calc(57vw)] md:w-[30%] md:top-[calc(10vw)] md:flex flex-col items-start">
            <div className="rounded py-3 w-full mb-[calc(0.5vw)] ">
              <div className="md:text-[calc(3vw)] text-[calc(10vw)] md:leading-[calc(3vw)] leading-[calc(10vw)] text-[#FA7035] font-balgin-regular mb-4">
                {kit.title.split(' ')[0]}
                <br />
                {kit.title.split(' ')[1]}
              </div>
              <div className="md:text-[calc(1.5vw)] text-[calc(4.5vw)] md:leading-[calc(2vw)] leading-[calc(7vw)] w-full font-secondary text-gray-800">
                {kit.description}
              </div>
            </div>
            <button
              onClick={() => {
                const packSection =
                  document.getElementById('pack-selection');
                if (packSection) {
                  packSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="border-2 hidden md:block border-[#FCA17A] mt-10 rounded-md hover:bg-[#FFC1A0] text-[calc(1.2vw)] hover:border-orange-600 text-black px-8 py-1 transition-colors shadow mb-2"
            >
              Explore
            </button>
          </div>
          {/* Bottom Bar */}
          <div className="overflow-hidden w-full">
            <div className="absolute md:left-[calc(35vw)] block w-[calc(65vw)] md:top-[calc(37.7vw)] h-[calc(7vw)] bg-[#B4C6D0] z-0 " />
          </div>
        </div>
      </div>

      {/* Pack Selection */}
      <div className='absolute md:top-[50vw] top-[185vw] w-full'>
        <div id="pack-selection" className=" flex flex-row py-5 items-center justify-center md:justify-start gap-4 px-5 md:px-10 lg:px-18 mt-12 md:mt-16 lg:mt-20"
        >
          <button
            className={`border-2 border-[#FCA17A] rounded-md hover:bg-[#FFC1A0] md:text-[calc(1.2vw)] text-[calc(4vw)] hover:border-orange-600 text-black px-6 py-1 transition-colors shadow mb-2 ${selectedPack === 'premium'
                ? 'bg-[#FFC1A0]'
                : 'text-black'
              }`}
            onClick={() => setSelectedPack('premium')}
          >
            Premium Pack
          </button>
          <button
            className={`border-2 border-[#FCA17A] rounded-md hover:bg-[#FFC1A0] md:text-[calc(1.2vw)] text-[calc(4vw)] hover:border-orange-600 text-black px-8 py-1 transition-colors shadow mb-2 ${selectedPack === 'basic' ? 'bg-[#FFC1A0]' : 'text-black'
              }`}
            onClick={() => setSelectedPack('basic')}
          >
            Basic Pack
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1  w-full sm:grid-cols-2 lg:grid-cols-3  gap-4 sm:gap-6 px-5 md:px-10 lg:px-18 py-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product: KitProduct) => (
              <ProductCard
                key={product._id}
                title={product.name}
                image={
                  product.images[0]?.url ||
                  'https://placehold.co/400x500/CFDAE9/000000?text=Product'
                }
                onHoverImage={
                  product.images[0]?.url ||
                  'https://placehold.co/400x500/CFDAE9/000000?text=Product'
                }
                aspectRatio={4 / 3}
                onClick={() =>
                  router.push(`/kit/${kit?.slug}/${product.slug}`)
                }
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">
                No products available for {selectedPack} pack.
              </p>
            </div>
          )}
        </div>

        {/* Customise Section */}
        <section className="px-5 md:px-10  w-full lg:px-18 py-10 md:py-18 pb-12 md:pb-16">
          <h2 className="text-2xl md:text-3xl font-medium font-balgin-regular mb-6">
            CUSTOMIZE
          </h2>
          <div className="relative p-6 md:p-10 lg:p-15 flex flex-col items-center overflow-hidden">
            {kit.mainImage && (
              <Image
                src={kit.mainImage.url}
                alt={kit.mainImage.originalname}
                fill
                className="object-cover w-full h-full absolute top-0 left-0 opacity-40 pointer-events-none select-none z-0"
                sizes="100vw"
                priority={false}
              />
            )}
            <div className="relative z-10 w-full flex flex-col">
              <h3 className="text-xl sm:text-2xl md:text-[30px] font-medium mb-4 text-center md:text-left">
                Make It Yours — Custom Kits, Tailored to You
              </h3>
              <p className="text-base sm:text-lg md:text-[22px] font-secondary mb-6 md:mb-8 w-full text-center md:text-left ">
                Need something tailored to your brand? We offer customization
                across templates, color palettes, messaging, and layouts.
                Whether it&apos;s a full kit revamp or small tweaks, we&apos;ll
                deliver a ready-to-use version that fits perfectly.
              </p>
              <div className="flex flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8">
                <DiscoveryCallButton
                  className="bg-white text-sm sm:text-base border-2 rounded-md border-[#FCA17A] px-3 sm:px-4 lg:px-8 py-2 transition-colors hover:bg-[#FCA17A]/70 focus:outline-none focus:ring-2 focus:ring-[#FCA17A]/40 whitespace-nowrap"
                  title="Book a Discovery Call"
                  subtitle="Let&apos;s explore how we can customize this kit for your brand"
                />
                <AskForQuoteButton
                  className="bg-white text-sm sm:text-base border-2 rounded-md border-[#FCA17A] px-3 sm:px-4 lg:px-8 py-2 transition-colors hover:bg-[#FCA17A]/70 focus:outline-none focus:ring-2 focus:ring-[#FCA17A]/40 whitespace-nowrap"
                  productName={kit?.title}
                  productType="kit"
                />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-5 md:px-10  w-full lg:px-18 pb-12 md:pb-16 bg-white">
          <h2 className="text-2xl md:text-3xl font-bold font-secondary ">
            FAQ
          </h2>
          <div className="w-full">
            {faqs.map((faq, idx) => (
              <div key={idx} className="mb-2">
                <div
                  className="flex items-start sm:items-center cursor-pointer pt-4 md:pt-6"
                  onClick={() =>
                    setOpenFaq(openFaq === idx ? null : idx)
                  }
                >
                  <span
                    className="text-2xl md:text-3xl text-[#FA7035] font-bold mr-4 md:mr-8 select-none transition-transform flex-shrink-0"
                    style={{
                      minWidth: '24px',
                      textAlign: 'center',
                    }}
                  >
                    {openFaq === idx ? '-' : '+'}
                  </span>
                  <span className="text-base sm:text-lg md:text-xl font-secondary text-black leading-relaxed">
                    {faq.question}
                  </span>
                </div>
                {openFaq === idx && (
                  <div className="pl-8 sm:pl-12 md:pl-16 pb-4 text-sm sm:text-base text-gray-700 font-secondary font-medium">
                    {faq.answer}
                  </div>
                )}
                <div className="border-[1px] border-[#FA7035] w-full" />
              </div>
            ))}
          </div>
          <div className="flex mt-10 md:mt-25">
            <button
              className="border-[#FCA17A] border-2 bg-white hover:bg-[#FCA17A] text-black font-secondary px-6 sm:px-8 py-2 rounded-lg transition-colors text-base sm:text-lg"
              onClick={() => router.push('/')}
            >
              Back to Home
            </button>
          </div>
        </section>
        {/* Footer */}
        <div className="w-full">
          <Footer />
        </div>
      </div>
    </div>
  );
}
