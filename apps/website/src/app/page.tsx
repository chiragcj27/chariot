import KitGrid from "@/components/KitGrid";
import CallToAction from "@/components/CallToAction";
import WhoWeAre from "@/components/WhoWeAre";
import SubscriptionCards from "@/components/SubscriptionCards";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div>
      <div className="px-5 md:px-10 lg:px-20">
      {/* Hero Section */}
      <div className="flex flex-col pt-20 pb-15">
        <p className="text-[#FCA17A] font-balgin-regular font-medium leading-17 text-[64px]">
          Hi, we&apos;re Chariot<br />Built for Jewelrs,<br/>by Jewelrs.
        </p>
        <p className="py-8 text-[32px] font-secondary">Branding, websites, catalogs, campaigns — everything your jewelry business needs to grow, all in one place.</p>
      </div>
      {/* Kits Section */}
      <div className="flex flex-col">
        <KitGrid />
      </div>
      {/* What We Do Section */}
      <div className="flex flex-col md:flex-row mt-24 pt-10">
        <div className="w-full md:w-1/3 mb-8 md:mb-0">
          <span className="text-sunrise text-[36px] font-secondary">What we do</span>
        </div>
        <div className="w-full md:w-2/3">
          <h2 className="text-[32px] md:text-[32px] mb-12">
          End-to-end creative and marketing services for jewelry businesses that launch, grow, and scale worldwide.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="mb-4">
              <h3 className="text-4xl text-sunrise ml-5 mb-2">1. Branding</h3>
              <div className="border-b-2 border-sunrise mb-4" />
              <p className="text-[#8A8A8A] font-secondary text-[20px]">Logos, taglines, tone of voice — with deep jewelry industry insight at the core</p>
            </div>
            <div className="mb-4">
              <h3 className="text-4xl text-sunrise ml-5 mb-2">2. Websites</h3>
              <div className="border-b-2 border-sunrise mb-2" />
              <p className="text-[#8A8A8A] font-secondary text-[20px]">Copy, design, development — everything you need to make your storefront shine</p>
            </div>
            <div className="mb-4">
              <h3 className="text-4xl text-sunrise ml-5 mb-2">3. Social Media</h3>
              <div className="border-b-2 border-sunrise mb-2" />
              <p className="text-[#8A8A8A] font-secondary text-[20px]">Instagram grids, Reels, captions, hashtags — designed to grow your jewelry brand, not just fill the feed</p>
            </div>
            <div className="mb-4">
              <h3 className="text-4xl text-sunrise ml-5 mb-2">4. Design support</h3>
              <div className="border-b-2 border-sunrise mb-2" />
              <p className="text-[#8A8A8A] font-secondary text-[20px]">Catalogs, social posts, renders, packaging, POS — if you need it, we&apos;ve probably done it</p>
            </div>
          </div>
        </div>
      </div>
      </div>
      {/* Who we are Section */}
      <WhoWeAre />
      <div className="px-5 md:px-10 lg:px-20 flex flex-col md:flex-row mt-24 pt-10">
        <div className="w-full md:w-1/3 mb-8 md:mb-0">
          <span className="text-sunrise text-[36px] font-secondary">Real Industry<br/>Experience</span>
        </div>
        <div className="w-full md:w-2/3">
          <h2 className="text-[32px] md:text-[32px] mb-12">
          Built on real industry experience <br/>Over three decades of first hand knowledge in the jewelry business — across markets, mediums, and formats.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="mb-4">
              <h3 className="text-4xl text-sunrise ml-5 mb-2">1. 30+ Years</h3>
              <div className="border-b-2 border-sunrise mb-4" />
              <p className="text-[#8A8A8A] font-secondary text-[20px]">Our team blends experience from creative studios, retail floors, manufacturing units, and global markets</p>
            </div>
            <div className="mb-4">
              <h3 className="text-4xl text-sunrise ml-5 mb-2">2. Global Exposure</h3>
              <div className="border-b-2 border-sunrise mb-4" />
              <p className="text-[#8A8A8A] font-secondary text-[20px]">We&apos;ve worked with jewelry businesses across the U.S., Europe, the Middle East, and India</p>
            </div>
            <div className="mb-4">
              <h3 className="text-4xl text-sunrise ml-5 mb-2">3. Omnichannel</h3>
              <div className="border-b-2 border-sunrise mb-4" />
              <p className="text-[#8A8A8A] font-secondary text-[20px]">From e-commerce and branding to packaging and in-store displays, we&apos;ve built solutions across every retail touchpoint</p>
            </div>
            <div className="mb-4">
              <h3 className="text-4xl text-sunrise ml-5 mb-2">4. Creative Hub</h3>
              <div className="border-b-2 border-sunrise mb-4" />
              <p className="text-[#8A8A8A] font-secondary text-[20px]">From strategy and storytelling to catalogs, campaigns, and content, we help jewelry brands show up and scale up.</p>
            </div>
          </div>
        </div>
      </div>
      {/* Call to Action Section */}
      <CallToAction />
      {/* Subscription Plans Section */}
      <SubscriptionCards />
      {/* Footer Section */}
      <Footer />
    </div>
  );
}
