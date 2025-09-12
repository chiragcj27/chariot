import KitGrid from "@/components/KitGrid";
import CallToAction from "@/components/CallToAction";
import WhoWeAre from "@/components/WhoWeAre";
import SubscriptionCards from "@/components/SubscriptionCards";

export default function Home() {
  return (
    <div>
      <div className="px-5 sm:px-8 md:px-12 lg:px-16 xl:px-24"> {/* Responsive margins: 20px -> 32px -> 48px -> 64px -> 96px */}
      {/* Hero Section */}
      <div className="flex flex-col pt-5 sm:pt-15 md:pt-24 lg:pt-28 xl:pt-32 pb-8 sm:pb-10 md:pb-12 lg:pb-14 xl:pb-16 gap-4 sm:gap-5 md:gap-6 lg:gap-6 xl:gap-7">
        <p className="text-black font-balgin-regular font-medium leading-[1] text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl max-w-full">
          Hi, we are <span className="text-[#FCA17A]">Chariot</span><br />Built for Jewelers,<br/>by Jewelers.
        </p>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-secondary leading-[1] max-w-[90%] lg:max-w-[80%]">Branding, websites, catalogs, campaigns — everything your jewelry business needs to grow, all in one place.</p>
      </div>
      {/* Kits Section */}
      <div className="flex flex-col">
        <KitGrid />
      </div>
      {/* What We Do Section */}
      <div className="flex flex-col lg:flex-row mt-5 sm:mt-12 md:mt-20 lg:mt-28 xl:mt-32 pt-6 sm:pt-8 md:pt-10 lg:pt-11 xl:pt-12 gap-4 sm:gap-5 md:gap-6 lg:gap-6 xl:gap-7">
        <div className="w-full lg:w-[33%] lg:pr-6 xl:pr-12">
          <span className="text-sunrise text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-secondary leading-[1.3]">What we do</span>
        </div>
        <div className="w-full lg:w-[67%] space-y-8 sm:space-y-10 md:space-y-12 lg:space-y-14 xl:space-y-16">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-[1.4] max-w-full">
          End-to-end creative and marketing services for jewelry businesses that launch, grow, and scale worldwide.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-14 xl:gap-16">
            <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-7">
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-sunrise ml-3 sm:ml-4 lg:ml-5 font-medium">1. Branding</h3>
              <div className="border-b-2 border-sunrise" />
              <p className="text-[#8A8A8A] font-secondary text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl leading-[1.5]">Logos, taglines, tone of voice — with deep jewelry industry insight at the core</p>
            </div>
            <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-7">
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-sunrise ml-3 sm:ml-4 lg:ml-5 font-medium">2. Websites</h3>
              <div className="border-b-2 border-sunrise" />
              <p className="text-[#8A8A8A] font-secondary text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl leading-[1.5]">Copy, design, development — everything you need to make your storefront shine</p>
            </div>
            <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-7">
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-sunrise ml-3 sm:ml-4 lg:ml-5 font-medium">3. Social Media</h3>
              <div className="border-b-2 border-sunrise" />
              <p className="text-[#8A8A8A] font-secondary text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl leading-[1.5]">Instagram grids, Reels, captions, hashtags — designed to grow your jewelry brand, not just fill the feed</p>
            </div>
            <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-7">
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-sunrise ml-3 sm:ml-4 lg:ml-5 font-medium">4. Design support</h3>
              <div className="border-b-2 border-sunrise" />
              <p className="text-[#8A8A8A] font-secondary text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl leading-[1.5]">Catalogs, social posts, renders, packaging, POS — if you need it, we&apos;ve probably done it</p>
            </div>
          </div>
        </div>
      </div>
      </div>
      {/* Who we are Section */}
      <WhoWeAre />
      <div className="px-5 sm:px-8 md:px-12 lg:px-16 xl:px-24 flex flex-col lg:flex-row mt-5 sm:mt-12 md:mt-20 lg:mt-28 xl:mt-32 pt-6 sm:pt-8 md:pt-10 lg:pt-11 xl:pt-12 gap-4 sm:gap-5 md:gap-6 lg:gap-6 xl:gap-7">
        <div className="w-full lg:w-[33%] lg:pr-6 xl:pr-12">
          <span className="text-sunrise text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-secondary leading-[1.3]">Real Industry<br/>Experience</span>
        </div>
        <div className="w-full lg:w-[67%] space-y-8 sm:space-y-10 md:space-y-12 lg:space-y-14 xl:space-y-16">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-[1.4] max-w-full">
          Built on real industry experience <br/>Over three decades of first hand knowledge in the jewelry business — across markets, mediums, and formats.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-14 xl:gap-16">
            <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-7">
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-sunrise ml-3 sm:ml-4 lg:ml-5 font-medium">1. 30+ Years</h3>
              <div className="border-b-2 border-sunrise" />
              <p className="text-[#8A8A8A] font-secondary text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl leading-[1.5]">Our team blends experience from creative studios, retail floors, manufacturing units, and global markets</p>
            </div>
            <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-7">
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-sunrise ml-3 sm:ml-4 lg:ml-5 font-medium">2. Global Exposure</h3>
              <div className="border-b-2 border-sunrise" />
              <p className="text-[#8A8A8A] font-secondary text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl leading-[1.5]">We&apos;ve worked with jewelry businesses across the U.S., Europe, the Middle East, and India</p>
            </div>
            <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-7">
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-sunrise ml-3 sm:ml-4 lg:ml-5 font-medium">3. Omnichannel</h3>
              <div className="border-b-2 border-sunrise" />
              <p className="text-[#8A8A8A] font-secondary text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl leading-[1.5]">From e-commerce and branding to packaging and in-store displays, we&apos;ve built solutions across every retail touchpoint</p>
            </div>
            <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-7">
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-sunrise ml-3 sm:ml-4 lg:ml-5 font-medium">4. Creative Hub</h3>
              <div className="border-b-2 border-sunrise" />
              <p className="text-[#8A8A8A] font-secondary text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl leading-[1.5]">From strategy and storytelling to catalogs, campaigns, and content, we help jewelry brands show up and scale up.</p>
            </div>
          </div>
        </div>
      </div>
      {/* Call to Action Section */}
      <CallToAction />
      {/* Subscription Plans Section */}
      <SubscriptionCards />
    
    </div>
  );
}
