export default function AboutCopyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20 2xl:py-24">
        <div className="max-w-7xl mx-auto">
          <nav className="flex justify-between items-start">
            {/* Left Navigation Links */}
            <div className="flex flex-col space-y-2 sm:space-y-3 md:space-y-4">
              <a href="#about-us" className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-black underline">
                ABOUT US
              </a>
              <a href="#what-we-do" className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-black hover:text-[#E68A4B] transition-colors">
                WHAT WE DO
              </a>
              <a href="#our-approach" className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-black hover:text-[#E68A4B] transition-colors">
                OUR APPROACH
              </a>
              <a href="#why-us" className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-black hover:text-[#E68A4B] transition-colors">
                WHY US
              </a>
            </div>
            
            {/* Right Content */}
            <div className="flex-1 ml-8 sm:ml-12 md:ml-16 lg:ml-20 xl:ml-24">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-[#E68A4B] mb-3 sm:mb-4 md:mb-6 lg:mb-8 leading-tight">
                ABOUT US
              </h1>
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-black mb-4 sm:mb-6 md:mb-8 lg:mb-10 leading-tight">
                Built for exclusively jewelry brands
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-black leading-relaxed max-w-4xl">
                Chariot is a full-service creative agency dedicated to the world of jewelry. We understand the craftsmanship, precision, and pace that define this industry and we bring that same attention to detail to every brand we build. Our work bridges creativity with commerce, helping jewelry businesses strengthen their identity, expand visibility, and accelerate sales through strategic design and marketing.
              </p>
            </div>
          </nav>
        </div>
      </div>

      {/* Hero Image Placeholder */}
      <div id="about-us" className="w-full h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] 2xl:h-[600px] bg-[#E0E0E0] mb-6 sm:mb-8 md:mb-12 lg:mb-16 xl:mb-20 2xl:mb-24">
        {/* Image placeholder - add your image path here */}
      </div>

      {/* What We Do Section */}
      <div id="what-we-do" className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20 2xl:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 lg:gap-16 xl:gap-20 2xl:gap-24 items-center">
            {/* Left Column - Text */}
            <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#E68A4B] leading-tight">
                What We Do
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-black leading-relaxed">
                We create integrated creative and digital solutions designed specifically for jewelry brands, retailers, and manufacturers.
              </p>
              <div className="space-y-3 sm:space-y-4 md:space-y-5">
                <ul className="space-y-2 sm:space-y-3 md:space-y-4">
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
            {/* Right Column - Placeholder Image */}
            <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] 2xl:h-[600px] bg-[#E0E0E0]">
              {/* Image placeholder - add your image path here */}
            </div>
          </div>
        </div>
      </div>

      {/* Our Approach Section */}
      <div id="our-approach" className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20 2xl:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 lg:gap-16 xl:gap-20 2xl:gap-24 items-center">
            {/* Left Column - Placeholder Image */}
            <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] 2xl:h-[600px] bg-[#E0E0E0] order-2 lg:order-1">
              {/* Image placeholder - add your image path here */}
            </div>
            {/* Right Column - Text */}
            <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10 order-1 lg:order-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#E68A4B] leading-tight">
                Our Approach
              </h2>
              <div className="space-y-4 sm:space-y-6 md:space-y-8">
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
      <div id="why-us" className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20 2xl:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 lg:gap-16 xl:gap-20 2xl:gap-24 items-center">
            {/* Left Column - Text */}
            <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#E68A4B] leading-tight">
                Why Us
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-black leading-relaxed">
                Because jewelry deserves specialized expertise. Our team brings together marketing strategists, designers, photographers, and storytellers who understand what drives this industry from consumer emotion to retail presentation.
              </p>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-black">
                We build brands that don&apos;t just compete, they lead.
              </p>
            </div>
            {/* Right Column - Placeholder Image */}
            <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] 2xl:h-[600px] bg-[#E0E0E0]">
              {/* Image placeholder - add your image path here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
