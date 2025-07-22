"use client"
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

const mockProducts = [
  {
    title: "Catalogs",
    subtitle: "7.1 Fluid Engine ✶ $297",
    image: "https://placehold.co/400x350/FFEAEA/000000?text=Catalogs",
    onHoverImage: "https://placehold.co/400x350?text=Unearth+Hover",
  },
  {
    title: "Flyers",
    subtitle: "7.1 Fluid Engine ✶ $297",
    image: "https://placehold.co/400x350/FFEAEA/000000?text=Flyers",
    onHoverImage: "https://placehold.co/400x350?text=Shelley+Hover",
  },
  {
    title: "Gift Guides",
    subtitle: "7.1 Fluid Engine ✶ $297",
    image: "https://placehold.co/400x350/FFEAEA/000000?text=Gift Guides",
  },
  {
    title: "Pamphlets",
    subtitle: "7.1 Fluid Engine ✶ $297",
    image: "https://placehold.co/400x350/FFEAEA/000000?text=Pamphlets",
    onHoverImage: "https://placehold.co/400x350?text=Noire+Hover",
  },
  {
    title: "Leaflets",
    subtitle: "7.1 Fluid Engine ✶ $297",
    image: "https://placehold.co/400x350/FFEAEA/000000?text=Leaflets",
  },
  {
    title: "Post Cards",
    subtitle: "7.1 Fluid Engine ✶ $297",
    image: "https://placehold.co/400x350/FFEAEA/000000?text=Post Cards",
    onHoverImage: "https://placehold.co/400x350?text=Michi+Hover",
  },
  {
    title: "Gift Certificates",
    subtitle: "7.1 Fluid Engine ✶ $297",
    image: "https://placehold.co/400x350/FFEAEA/000000?text=Gift Certificates",
    onHoverImage: "https://placehold.co/400x350?text=Michi+Hover",
  },
  {
    title: "Billboards",
    subtitle: "7.1 Fluid Engine ✶ $297",
    image: "https://placehold.co/400x350/FFEAEA/000000?text=Billboards",
    onHoverImage: "https://placehold.co/400x350?text=Michi+Hover",
  },
];

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const router = useRouter();

  // Calculate full rows and last row
  const productsPerRow = 3;
  const fullRows = Math.floor(mockProducts.length / productsPerRow);
  const fullRowProducts = mockProducts.slice(0, fullRows * productsPerRow);
  const lastRowProducts = mockProducts.slice(fullRows * productsPerRow);

  return (
    <>
      <div className="min-h-screen ">
        {/* Existing content below */}
        <div className="container mx-auto flex flex-col md:flex-row gap-12 pt-12 pb-8">
          <main className="flex-1">
            <h1 className="text-6xl font-bold font-secondary mb-8">
              {slug.charAt(0).toUpperCase() + slug.slice(1)}
            </h1>
            <p className="text-2xl font-secondary mb-8">
              {slug.charAt(0).toUpperCase() + slug.slice(1)} is a collection of products that are designed to be used in a variety of ways.
            </p>
            {/* Product Grid with centered last row if needed */}
            {/* Full rows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-20 gap-y-16">
              {fullRowProducts.map((product, idx) => (
                <Link key={idx} href="/category/product-list" className="block">
                  <ProductCard
                    title={product.title}
                    subtitle={product.subtitle}
                    image={product.image}
                    onHoverImage={product.onHoverImage}
                    aspectRatio={1}
                  />
                </Link>
              ))}
            </div>
            {/* Last row, centered if 1 or 2 items */}
            {lastRowProducts.length > 0 && (
              <div className="flex justify-center gap-x-20 mt-16 w-full">
                {lastRowProducts.map((product, idx) => (
                  <Link
                    key={fullRowProducts.length + idx}
                    href="/category/product-list"
                    className="block w-full sm:w-1/2 lg:w-[30%]"
                  >
                    <ProductCard
                      title={product.title}
                      subtitle={product.subtitle}
                      image={product.image}
                      onHoverImage={product.onHoverImage}
                      aspectRatio={1}
                    />
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
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
        <Footer />
      </div>
    </>
  );
}