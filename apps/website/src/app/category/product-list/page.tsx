'use client'
import Footer from "@/components/Footer";
import FilterDropDown from "@/components/FilterDropDown";
import ProductCard from "@/components/ProductCard";
import DiscoveryCallButton from "@/components/DiscoveryCallButton";
import AskForQuoteButton from "@/components/AskForQuoteButton";
import { useRouter } from "next/navigation";
import Link from "next/link";

const mockProducts = [
  {
    title: "Unearth",
    subtitle: "7.1 Fluid Engine ✶ $297",
    image: "https://placehold.co/400x350/FFEAEA/000000?text=Unearth",
    onHoverImage: "https://placehold.co/400x350/FFEAEA/000000?text=Unearth+Hover",
  },
  {
    title: "Shelley",
    subtitle: "7.1 Fluid Engine ✶ $297",
    image: "https://placehold.co/400x350/FFEAEA/000000?text=Shelley",
    onHoverImage: "https://placehold.co/400x350/FFEAEA/000000?text=Shelley+Hover",
  },
  {
    title: "Verano",
    subtitle: "7.1 Fluid Engine ✶ $297",
    image: "https://placehold.co/400x350/FFEAEA/000000?text=Verano",
  },
  {
    title: "Noire",
    subtitle: "7.1 Fluid Engine ✶ $297",
    image: "https://placehold.co/400x350/FFEAEA/000000?text=Noire",
    onHoverImage: "https://placehold.co/400x350/FFEAEA/000000?text=Noire+Hover",
  },
  {
    title: "Ann Grand",
    subtitle: "7.1 Fluid Engine ✶ $297",
    image: "https://placehold.co/400x350/FFEAEA/000000?text=Ann Grand",
  },
  {
    title: "Michi",
    subtitle: "7.1 Fluid Engine ✶ $297",
    image: "https://placehold.co/400x350/FFEAEA/000000?text=Michi",
    onHoverImage: "https://placehold.co/400x350/FFEAEA/000000?text=Michi+Hover",
  },
];

export default function ProductListPage() {
  const router = useRouter();
  return (
    <>
      <div className="min-h-screen bg-[#fdfbf6]">
        <div className="container mx-auto flex flex-col md:flex-row gap-12 pt-12 pb-8">
          {/* Sidebar: Heading + Filter */}
          <aside className="md:w-80 w-full md:shrink-0 mb-8 md:mb-0 flex flex-col items-start">
            <h1 className="text-5xl font-secondary font-bold mb-8 leading-tight">
                Catalogs
            </h1>
            <div className="w-full">
              <FilterDropDown />
            </div>
          </aside>
          {/* Main Content: Product Grid */}
          <main className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
              {mockProducts.map((product, idx) => (
                <Link href="/category/product-list/product" key={idx}>
                <ProductCard
                  key={idx}
                  title={product.title}
                  image={product.image}
                    onHoverImage={product.onHoverImage}
                  />
                </Link>
              ))}
            </div>
          </main>
        </div>
    {/* Customise Section */}
    <section className="px-8 py-18 pb-16">
      <h2 className="text-3xl font-bold font-secondary mb-6">CUSTOMIZE</h2>
      <div className="bg-[#F0C8C8] rounded-lg p-8 flex flex-col items-center">
        <h3 className="text-2xl md:text-3xl font-bold mb-4 text-center">Make It Yours — Custom Kits, Tailored to You</h3>
        <p className="text-lg font-secondary md:text-xl text-center mb-8 max-w-2xl">
          Need something tailored to your brand? We offer customization across templates, color palettes, messaging, and layouts. Whether it’s a full kit revamp or small tweaks, we’ll deliver a ready-to-use version that fits perfectly.
        </p>
        <div className="flex flex-row gap-8">
          <AskForQuoteButton 
            productType="custom products"
          />
          <DiscoveryCallButton 
            title="Book a Discovery Call"
            subtitle="Let&apos;s explore how we can help you find the perfect solution"
          />
        </div>
      </div>
    </section>
    <div className="w-full bg-[#5E5D5D] p-8">
         <h1 className="text-white text-left font-balgin-regular text-4xl">
          Tailor It to Your Brand
         </h1>  
        <div className="bg-[#D9D9D9] mt-10 mb-20 px-30 py-10 rounded-lg">
         <p className="text-left text-[24px] font-secondary">
         Personalize any design to match your brand, from logo placement and color palette to layout and size. Whether it&apos;s packaging, print, or digital, we&apos;ll adapt it for your store so you stand out with marketing that&apos;s distinctly yours.
         </p>
         </div>
    </div>
    <div className="flex px-8 mt-10 mb-10">
        <button
          className="bg-[#DF9999] hover:bg-[#DF9999]/90 text-black font-secondary font-semibold px-8 py-3 rounded-lg transition-colors shadow text-lg"
          onClick={() => router.push('/')}
        >
          Back to Home
        </button>
      </div>
        <Footer />
      </div>
    </>
  );
}