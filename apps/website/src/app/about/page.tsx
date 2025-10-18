'use client';
import Image from 'next/image';
import { useState } from 'react';

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState('about-us');

  const sections = [
    { id: 'about-us', label: 'ABOUT US' },
    { id: 'what-we-do', label: 'WHAT WE DO' },
    { id: 'our-approach', label: 'OUR APPROACH' },
    { id: 'why-us', label: 'WHY US' }
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <div className="min-h-screen">
      {/* About Us Header Section */}
      <div id="about-us" className="px-5 sm:px-8 md:px-12 lg:px-16 xl:px-24 py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20 2xl:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 lg:gap-16">
          {/* Left Column - Navigation Menu */}
          <div className="hidden lg:block col-span-1 lg:col-span-3">
            <div className="flex flex-col space-y-4 max-w-[200px]">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`text-[16px] font-secondary uppercase text-left transition-colors duration-200 hover:text-[#FA7035] ${
                    activeSection === section.id
                      ? 'font-bold text-black border-b-2 border-black pb-2'
                      : 'font-normal text-gray-500'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Right Column - Main Content */}
          <div className="ml-0 lg:ml-20 col-span-1 lg:col-span-7">
            <div className="space-y-6 ">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FA7035] font-balgin-light uppercase tracking-wide">
                ABOUT US
              </h1>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black">
                Built for exclusively jewelry brands
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-4xl">
                Chariot is a full-service creative agency dedicated to the world of jewelry. We understand the craftsmanship, precision, and pace that define this industry and we bring that same attention to detail to every brand we build. Our work bridges creativity with commerce, helping jewelry businesses strengthen their identity, expand visibility, and accelerate sales through strategic design and marketing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] 2xl:h-[600px] mb-6 sm:mb-8 md:mb-12 lg:mb-16 xl:mb-20 2xl:mb-24 relative">
        <Image 
          src="/hero-about.png" 
          alt="Jewelry design workspace showing hands sketching jewelry designs with diamond rings and tennis bracelet" 
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/* What We Do Section */}
      <div id="what-we-do" className="py-6 sm:py-8">
        <div className="max-w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 lg:gap-16 xl:gap-20 2xl:gap-24 items-center">
            {/* Left Column - Text */}
            <div className="lg:px-20 px-5 md:px-10 space-y-4 sm:space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-[#FA7035] font-balgin-light">
                What We Do
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-black">
                We create integrated creative and digital solutions designed specifically for jewelry brands, retailers, and manufacturers.
              </p>
              <div className="">
                <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-black">
                  Our capabilities include:
                </p>
                <ul className="">
                  <li className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-black">
                    • Branding & Identity Design
                  </li>
                  <li className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-black">
                    • Product Photography & Videography
                  </li>
                  <li className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-black">
                    • Social Media Management & Content Strategy
                  </li>
                  <li className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-black">
                    • Website Design & Development
                  </li>
                  <li className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-black">
                    • Packaging, Displays & Catalog Design
                  </li>
                  <li className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-black">
                    • Campaigns, Copywriting & Marketing Collateral
                  </li>
                </ul>
              </div>
            </div>
            {/* Right Column - What We Do Image */}
            <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] 2xl:h-[600px] relative">
              <Image 
                src="/what-we-do.png" 
                alt="Professional jewelry photography setup showing camera with diamond lion pendant on screen" 
                fill
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Our Approach Section */}
      <div id="our-approach" className="py-6 sm:py-8">
        <div className="max-w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 lg:gap-16 xl:gap-20 2xl:gap-24 items-center">
            {/* Left Column - Our Approach Image */}
            <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] 2xl:h-[600px] relative order-2 lg:order-1">
              <Image 
                src="/our-approach.png" 
                alt="Multi-device showcase of THE ICE CHAMP jewelry website across smartphone, tablet, and laptop" 
                fill
                className="object-contain object-center"
              />
            </div>
            {/* Right Column - Text */}
            <div className="max-w-[600px] space-y-4 order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-[#FA7035] font-balgin-light">
                Our Approach
              </h2>
              <div className="">
                <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-black leading-relaxed">
                  We bring together creative direction, strategy, and storytelling to deliver measurable impact.
                </p>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-black leading-relaxed">
                  At Chariot, design is never just about aesthetics it&apos;s about purpose. We analyze your audience, positioning, and product mix to craft communication that speaks clearly and sells confidently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Us Section */}
      <div id="why-us" className="py-6 sm:py-8">
        <div className="max-w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 lg:gap-16 xl:gap-20 2xl:gap-24 items-center">
            {/* Left Column - Text */}
            <div className="lg:px-20 px-5 md:px-10 max-w-[800px] space-y-4 sm:space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-[#FA7035] font-balgin-light leading-tight">
                Why Us
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-black leading-relaxed">
                Because jewelry deserves specialized expertise. Our team brings together marketing strategists, designers, photographers, and storytellers who understand what drives this industry from consumer emotion to retail presentation.
              </p>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-black">
                We build brands that don&apos;t just compete, they lead.
              </p>
            </div>
             {/* Right Column - Why Us Image */}
             <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] 2xl:h-[600px] relative">
               <Image 
                 src="/why-us.png" 
                 alt="Close-up of a diamond ring on a hand with a ring holder in the background" 
                 fill
                 className="object-contain object-center"
               />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
