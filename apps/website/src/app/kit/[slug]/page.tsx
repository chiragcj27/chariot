'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import Image from 'next/image';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import ProductCard from '@/components/ProductCard';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';

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
  const router = useRouter();

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
        <div className="absolute sm:top-[125%] lg:right-0 md:right-5 md:w-[30%] md:top-[10%] lg:top-[20%] top-[105%] w-full lg:flex lg:w-[38%] flex-col items-start z-40">
          <div className="rounded px-4 py-3 mb-4 w-full">
            <div className="text-7xl font-bold mb-2">{kit.title}</div>
            <div className="text-2xl font-secondary text-gray-800">{kit.description}</div>
          </div>
          <button className="bg-[#CFDAE9] hover:bg-[#CFDAE9]/70 border-2 border-[#012F71] text-black font-semibold mx-4 px-8 py-2 rounded-lg transition-colors shadow mb-2 text-lg">
            Explore
          </button>
        </div>
        {/* Bottom Bar */}
        <div className="absolute md:top-[95%] md:w-full md:h-[100px] lg:block lg:top-[100%] lg:left-[40%] lg:w-[60%] lg:h-[110px] bg-gray-700 z-0" />
      </div>
    </div>
    <div className="flex flex-row py-5 mt-20 items-center justify-start px-8">
      <button className="bg-[#F8F9FA] font-secondary  hover:bg-[#F8F9FA]/70 border-2 border-[#3981E3] text-black font-semibold mx-4 px-4 py-2 rounded-sm transition-colors shadow mb-2 text-lg">
        Premium Pack
      </button>
      <button className="border-2 bg-[#042C65] border-[#3981E3] hover:bg-[#042C65]/50 text-white font-semibold mx-4 px-8 py-2 rounded-sm transition-colors shadow mb-2 text-lg font-secondary">
        Basic Pack
      </button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-8 py-6">
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
      <ProductCard
        title="Typography"
        image="https://placehold.co/400x500/CFDAE9/000000?text=Typography"
        onHoverImage="https://placehold.co/400x500/F39C12/FFFFFF?text=Typography+Hover"
        aspectRatio={4/3}
      />
      <ProductCard
        title="Color Palette"
        image="https://placehold.co/400x500/CFDAE9/000000?text=Color+Palette"
        onHoverImage="https://placehold.co/400x500/E74C3C/FFFFFF?text=Color+Palette+Hover"
        aspectRatio={4/3}
      />
      <ProductCard
        title="Marketing Materials"
        image="https://placehold.co/400x500/CFDAE9/000000?text=Marketing+Materials"
        onHoverImage="https://placehold.co/400x500/F1C40F/000000?text=Marketing+Materials+Hover"
        aspectRatio={4/3}
      />
    </div>
    {/* Customise Section */}
    <section className="px-8 py-18 pb-16">
      <h2 className="text-3xl font-bold font-secondary mb-6">CUSTOMIZE</h2>
      <div className="bg-[#A4BDDE] rounded-lg p-8 flex flex-col items-center">
        <h3 className="text-2xl md:text-3xl font-bold mb-4 text-center">Make It Yours — Custom Kits, Tailored to You</h3>
        <p className="text-lg font-secondary md:text-xl text-center mb-8 max-w-2xl">
          Need something tailored to your brand? We offer customization across templates, color palettes, messaging, and layouts. Whether it’s a full kit revamp or small tweaks, we’ll deliver a ready-to-use version that fits perfectly.
        </p>
        <div className="flex flex-row gap-8">
          <button className="border-2 border-[#1876F6] bg-[#CFDAE9] text-lg font-semibold px-6 py-2 rounded transition-colors hover:bg-[#CFDAE9]/70 focus:outline-none focus:ring-2 focus:ring-[#1876F6]/40">
            Ask For Quote
          </button>
          <button className="border-2 border-[#1876F6] bg-[#CFDAE9] text-lg font-semibold px-6 py-2 rounded transition-colors hover:bg-[#CFDAE9]/70 focus:outline-none focus:ring-2 focus:ring-[#1876F6]/40">
            Discovery Call
          </button>
        </div>
      </div>
    </section>
    {/* FAQ Section */}
    <section className="px-8 pb-16">
      <h2 className="text-3xl font-bold font-secondary mb-6">FAQs</h2>
      <div className="w-full">
        {faqs.map((faq, idx) => (
          <div key={idx} className="mb-4">
            <button
              className={`w-full flex focus:outline-none transition-colors font-semibold text-lg px-6 py-3 rounded-full shadow-sm border-none
                ${openFaq === idx ? 'bg-[#E2EBF8] text-black' : 'bg-seafoam/50 text-black/80 hover:bg-seafoam/70'}`}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <span>{faq.question}</span>
              <span className="ml-auto">{openFaq === idx ? '-' : '+'}</span>
            </button>
            {openFaq === idx && (
              <div className="pb-4 pt-2 px-4 text-gray-700 font-secondary font-semibold">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex mt-10">
        <button
          className="bg-[#CFDAE9] hover:bg-[#CFDAE9]/90 text-black font-semibold px-8 py-3 rounded-lg transition-colors shadow text-lg"
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
