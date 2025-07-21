'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import Image from 'next/image';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';

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

interface KitPageProps {
  params: Promise<{ slug: string }>;
}

export default function KitPage({ params }: KitPageProps) {
  const [kit, setKit] = useState<Kit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null); // For FAQ accordion
  const router = useRouter(); // Removed as per edit hint

  const faqs = [
    {
      question: 'What is included in a brand kit?',
      answer: 'A brand kit typically includes logos, color palettes, typography, brand guidelines, templates, and more, depending on your needs.'
    },
    {
      question: 'Can I request custom assets?',
      answer: 'Absolutely! We offer full customization, including new assets, templates, and brand elements tailored to your requirements.'
    },
    {
      question: 'How long does it take to deliver a custom kit?',
      answer: 'Delivery time depends on the scope of customization, but most kits are ready within 1-2 weeks.'
    },
    {
      question: 'Do you offer support after delivery?',
      answer: 'Yes, we provide post-delivery support to ensure your brand kit is implemented smoothly.'
    },
    {
      question: 'Can I update my kit later?',
      answer: 'Of course! You can request updates or new assets at any time.'
    },
  ];

  useEffect(() => {
    const fetchKit = async () => {
      try {
        setLoading(true);
        const { slug } = await params;
        const response = await fetch(`/api/kits/slug/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error('Failed to fetch kit');
        }
        
        const data = await response.json();
        setKit(data);
      } catch (err) {
        console.error('Error fetching kit:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch kit');
      } finally {
        setLoading(false);
      }
    };

    fetchKit();
  }, [params]);

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
    <div>
    <div className="relative w-full h-[100vh]">
      {/* Main layout area, fixed height for demo, adjust as needed */}
      <div className="relative flex flex-col md:flex-row w-full h-[600px] ">
        {/* MainIMG */}
        <div className="absolute left-0 top-0 md:w-[50%] lg:w-[45%] w-[100%] z-10">
          <AspectRatio ratio={1/1} className="bg-pink-100 w-full h-full flex items-center justify-center">
            {kit.mainImage && (
              <Image
                width={1000}
                height={800}
                src={kit.mainImage.url}
                alt={kit.mainImage.originalname} 
                className="object-cover w-full h-full"
              />
            )}
          </AspectRatio>
        </div>
        {/* Carousel */}
        <div className="absolute sm:top-[50%] sm:left-[10%] sm:w-[50%] lg:left-[25%] lg:top-[20%] md:left-[30%] md:top-[25%] md:w-[35%] left-[10%] top-[40%] lg:w-[30%] w-[60%] lg:h-[20%] h-[40%] z-20">
          <AspectRatio ratio={9/12} className="bg-opacity-70 rounded-3xl w-full h-full flex flex-col items-center justify-center">
            {kit.carouselImages && kit.carouselImages[0] && (
              <Image
                width={800}
                height={1200}
                src={kit.carouselImages[0].url}
                alt={kit.carouselImages[0].originalname}
                className="object-cover w-full h-full rounded-3xl"
              />
            )}
            {/* Optionally, add carousel controls or thumbnails here */}
          </AspectRatio>
        </div>
        {/* Testimonials */}
        <div className="absolute sm:top-[90%] sm:left-[50%] sm:w-[40%] lg:left-[15%] md:left-[20%] md:w-[30%] md:top-[70%] right-[5%] lg:top-[95%] top-[80%] lg:w-[25%] w-[60%] lg:h-[15%] h-[20%] z-30">
          <AspectRatio ratio={16/9} className="w-full h-full">
            <TestimonialsCarousel testimonials={kit.testimonials} />
          </AspectRatio>
        </div>
        {/* Right Side: Info */}
        <div className="absolute sm:top-[125%] lg:right-0 md:right-5 md:w-[30%] md:top-[10%] lg:top-[20%] top-[105%] w-full lg:flex lg:w-[38%] flex-col items-start">
          <div className="rounded py-3 mb-4 -ml-12">
            <div className="text-[42px] text-[#FA7035] leading-10 font-balgin-regular mb-2">{kit.title.split(' ')[0]}<br/>{kit.title.split(' ')[1]}</div>
            <div className="text-[28px] mr-30 font-secondary text-gray-800">{kit.description}</div>
          </div>
          <button className="border-2 border-[#D94506] rounded-4xl bg-[#FFC1A0] text-lg text-black font-semibold -ml-12 px-10 py-1 transition-colors shadow mb-2">
            Explore
          </button>
        </div>
        {/* Bottom Bar */}
        <div className="absolute md:top-[95%] md:w-full md:h-[100px] lg:block lg:top-[100%] lg:left-[40%] lg:w-[60%] lg:h-[110px] bg-gray-700 z-0" />
      </div>
    </div>
    <div className="flex flex-row py-5 mt-20 items-center justify-start px-5 md:px-10 lg:px-18">
      <button className="border-2 border-[#D94506] rounded-4xl  text-black font-semibold px-4 py-1 transition-colors shadow mb-2 text-lg">
        Premium Pack
      </button>
      <button className="border-2 border-[#D94506] rounded-4xl bg-[#FFC1A0] font-semibold mx-4 px-8 py-1 transition-colors shadow mb-2 text-lg font-secondary">
        Basic Pack
      </button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-5 md:px-10 lg:px-18 py-6">
      <ProductCard
        title="Logos"
        image="https://placehold.co/400x500/CFDAE9/000000?text=Logos"
        onHoverImage="https://placehold.co/400x500/4ECDC4/FFFFFF?text=Logos+Hover"
        aspectRatio={4/3}
      />
      <ProductCard
        title="Brand Tone"
        image="https://placehold.co/400x500/CFDAE9/000000?text=Brand+Tone"
        onHoverImage="https://placehold.co/400x500/96CEB4/FFFFFF?text=Brand+Tone+Hover"
        aspectRatio={4/3}
      />
      <ProductCard
        title="Photography"
        image="https://placehold.co/400x500/CFDAE9/000000?text=Photography"
        onHoverImage="https://placehold.co/400x500/DDA0DD/FFFFFF?text=Photography+Hover"
        aspectRatio={4/3}
      />
      <ProductCard
        title="Stationary"
        image="https://placehold.co/400x500/CFDAE9/000000?text=Stationary"
        onHoverImage="https://placehold.co/400x500/FFB6C1/FFFFFF?text=Stationary+Hover"
        aspectRatio={4/3}
      />
      <ProductCard
        title="Brand Guide"
        image="https://placehold.co/400x500/CFDAE9/000000?text=Brand+Guide"
        onHoverImage="https://placehold.co/400x500/87CEEB/000000?text=Brand+Guide+Hover"
        aspectRatio={4/3}
      />
      <ProductCard
        title="Instagram Starter Kit"
        image="https://placehold.co/400x500/CFDAE9/000000?text=Instagram+Kit"
        onHoverImage="https://placehold.co/400x500/B8E6B8/000000?text=Instagram+Kit+Hover"
        aspectRatio={4/3}
      />
    </div>
    {/* Customise Section */}
    <section className="px-5 md:px-10 lg:px-18 py-18 pb-16">
      <h2 className="text-3xl font-medium font-balgin-regular mb-6">CUSTOMIZE</h2>
      <div className="relative p-15 flex flex-col items-center overflow-hidden">
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
          <h3 className="text-2xl md:text-[30px] font-medium mb-4">Make It Yours — Custom Kits, Tailored to You</h3>
          <p className="text-lg font-secondary md:text-[22px] mb-8 mr-80">
            Need something tailored to your brand? We offer customization across templates, color palettes, messaging, and layouts. Whether it&apos;s a full kit revamp or small tweaks, we&apos;ll deliver a ready-to-use version that fits perfectly.
          </p>
          <div className="flex flex-row items-center justify-center gap-8">
            <button className="border-2 border-[#D94506] rounded-4xl bg-[#FFC1A0] text-lg font-semibold px-6 py-2 transition-colors hover:bg-[#FFC1A0]/70 focus:outline-none focus:ring-2 focus:ring-[#FFC1A0]/40">
                Discovery Call
            </button>
            <button className="border-2 border-[#D94506] rounded-4xl bg-[#FFC1A0] text-lg font-semibold px-6 py-2 transition-colors hover:bg-[#FFC1A0]/70 focus:outline-none focus:ring-2 focus:ring-[#FFC1A0]/40">
              Ask For Quote
            </button>
          </div>
        </div>
      </div>
    </section>
    {/* FAQ Section */}
    <section className="px-5 md:px-10 lg:px-18 pb-16 bg-white">
      <h2 className="text-3xl font-bold font-secondary mb-6">FAQ</h2>
      <div className="w-full">
        {faqs.map((faq, idx) => (
          <div key={idx} className="mb-2">
            <div
              className="flex items-center cursor-pointer pt-6"
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <span className="text-3xl text-[#FA7035] font-bold mr-8 select-none transition-transform" style={{ minWidth: '32px', textAlign: 'center' }}>
                {openFaq === idx ? '-' : '+'}
              </span>
              <span className="text-xl font-secondary text-black">
                {faq.question}
              </span>
            </div>
            {openFaq === idx && (
              <div className="pl-16 pb-4 text-gray-700 font-secondary font-semibold">
                {faq.answer}
              </div>
            )}
            <div className="border-[1px] border-[#FA7035] w-full" />
          </div>
        ))}
      </div>
      <div className="flex mt-10">
        <button
          className="border-2 border-[#D94506] rounded-4xl bg-[#FFC1A0] text-black font-semibold px-8 py-1 transition-colors shadow text-lg"
          onClick={() => router.push('/')}
        >
          Back to Home
        </button>
      </div>
    </section>
    {/* Footer */}
    <Footer />
    
    </div>
  );
}
