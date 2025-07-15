'use client'
import Footer from "@/components/Footer";
import FilterDropDown from "@/components/FilterDropDown";
import ProductCard from "@/components/ProductCard";
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
          <button className="bg-[#DF9999] text-lg font-secondary font-semibold px-6 py-2 rounded transition-colors hover:bg-[#DF9999]/70 focus:outline-none focus:ring-2 focus:ring-[#DF9999]/40">
            Ask For Quote
          </button>
          <button className="bg-[#DF9999] text-lg font-secondary font-semibold px-6 py-2 rounded transition-colors hover:bg-[#DF9999]/70 focus:outline-none focus:ring-2 focus:ring-[#DF9999]/40">
            Discovery Call
          </button>
        </div>
      </div>
    </section>
    <div className="w-full bg-[#5E5D5D] p-8">
         <h1 className="text-white text-left text-4xl font-bold">
          Sub Headline
         </h1> 
        <div className="bg-[#D9D9D9] mt-10 mb-20 px-50 py-10">
         <p className="text-left text-xl font-secondary">
         Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s.
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