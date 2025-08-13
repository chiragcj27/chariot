'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import router from 'next/router'

// Flipbook Embed Component
const FlipbookEmbed = ({ 
  flipbookUrl, 
  title = "Product Catalog"
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

// Product data - can have either images or flipbook
const productData = {
  // For image carousel
  images: [
    'https://placehold.co/600x400/87CEEB/FFFFFF?text=Product+Image+1',
    'https://placehold.co/600x400/87CEEB/FFFFFF?text=Product+Image+2',
    'https://placehold.co/600x400/87CEEB/FFFFFF?text=Product+Image+3',
    'https://placehold.co/600x400/87CEEB/FFFFFF?text=Product+Image+4',
  ],
  // For flipbook (set this to enable flipbook instead of images)
  flipbookUrl: "https://heyzine.com/flip-book/9ed613b90d.html", // "https://heyzine.com/flip-book/9ed613b90d.html"
}

export default function KitProductPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null); // For FAQ accordion
  // Check if we should show flipbook or images
  const showFlipbook = !!productData.flipbookUrl
  const images = productData.images

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    )
  }

  return (
    <div className="min-h-screen bg-[#FEFCFB]">
      <div className="container mx-auto px-4 py-8">
        <div className="mt-30 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Section - Image Carousel or Flipbook */}
          <div className="relative">
            <div 
              className="relative overflow-hidden rounded-lg bg-gray-100"
              style={{ aspectRatio: '3/2' }}
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
                      width: `${images.length * 100}%`
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
                    <ChevronLeft className="w-10 h-10 text-orange-500 font-bold" strokeWidth={3} />
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center transition-all duration-200 hover:scale-110"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-10 h-10 text-orange-500 font-bold" strokeWidth={3} />
                  </button>

                  {/* Image Indicators - Only show for images */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {images.map((_: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          index === currentImageIndex 
                            ? 'bg-orange-500 w-6' 
                            : 'bg-white/60 hover:bg-white'
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
            <div className="text-[24px] text-gray-900">
              Price
            </div>

            {/* Description */}
            <p className="text-lg mt-5 text-gray-700 leading-relaxed">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
              Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s, 
              when an unknown printer took a galley of type and scrambled it to make a type specimen book.
            </p>

            {/* Call-to-Action Buttons */}
            <div className="flex mr-150 mt-10 flex-col gap-4 pt-4">
              <Button
                variant="outline"
                className="flex-1 border-[#D94506] border-3 text-gray-900 font-avenir text-[16px] hover:bg-orange-50 hover:border-orange-600 transition-all duration-200"
              >
                Buy Now
              </Button>
              
              <Button
                className="flex-1 border-[#D94506] border-3 bg-[#FFC1A0] text-black font-avenir text-[16px] hover:bg-orange-600 transition-all duration-200"
              >
                Add To Cart
              </Button>
            </div>
          </div>
        </div>
                 <section className="relative px-5 md:px-10 lg:px-18 pb-16 mt-20">
           {/* Background Image with Overlay */}
           <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-white to-orange-50">
             {/* Background Pattern - Wireframes and Mockups */}
             <div className="absolute inset-0 opacity-10">
               {/* Mobile phone outlines */}
               <div className="absolute top-20 left-10 w-32 h-48 border-2 border-gray-300 rounded-3xl"></div>
               <div className="absolute top-32 right-20 w-28 h-40 border-2 border-orange-200 rounded-3xl"></div>
               <div className="absolute bottom-20 left-1/4 w-24 h-36 border-2 border-gray-300 rounded-2xl"></div>
               
               {/* Studio text */}
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl font-bold text-gray-200 opacity-20">
                 CO™ STUDIO
               </div>
               <div className="absolute bottom-1/4 right-1/4 text-6xl font-bold text-gray-200 opacity-20">
                 STUDIO
               </div>
             </div>
           </div>
           
           {/* Content */}
           <div className="relative z-10">
             <h2 className="text-4xl font-bold text-black mb-8">What&apos;s Included?</h2>
             <div className="w-full max-w-4xl">
               {faqs.map((faq, idx) => (
                 <div key={idx} className="mb-1">
                   <div
                     className="flex items-center cursor-pointer py-4 group"
                     onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                   >
                     {/* Orange Plus/Minus Icon */}
                     <span className="text-2xl text-[#FA7035] font-bold mr-6 select-none transition-transform duration-200 group-hover:scale-110" style={{ minWidth: '24px', textAlign: 'center' }}>
                       {openFaq === idx ? '−' : '+'}
                     </span>
                     
                     {/* Question Text */}
                     <span className="text-lg font-medium text-black flex-1">
                       {faq.question}
                     </span>
                   </div>
                   
                   {/* Answer */}
                   {openFaq === idx && (
                     <div className="pl-10 pb-4 text-gray-700 font-medium">
                       {faq.answer}
                     </div>
                   )}
                   
                   {/* Orange Separator Line */}
                   <div className="border-t border-[#FA7035] w-full opacity-60" />
                 </div>
               ))}
             </div>
             
             <div className="flex mt-12">
               <button
                 className="border-2 border-[#D94506] rounded-full bg-[#FFC1A0] text-black font-semibold px-8 py-3 transition-colors shadow-lg text-lg hover:bg-[#FA7035] hover:text-white"
                 onClick={() => router.push('/')}
               >
                 Back to Home
               </button>
             </div>
           </div>
         </section>
      </div>
    </div>
  )
}
