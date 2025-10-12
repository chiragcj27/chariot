"use client"
import ProductCard from "@/components/ProductCard";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCategory } from "@/hooks/useCategories";

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





export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const router = useRouter();

  // Use SWR hook to fetch category data
  const { category, isLoading, error } = useCategory(slug);

  // Calculate full rows and last row from dynamic items
  const productsPerRow = 3;
  const items = category?.items ?? [];
  const fullRows = Math.floor(items.length / productsPerRow);
  const fullRowProducts = items.slice(0, fullRows * productsPerRow);
  const lastRowProducts = items.slice(fullRows * productsPerRow);

  return (
    <>
      <div className="min-h-screen">
        {/* Main content with responsive padding */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8 md:gap-12 pt-8 md:pt-12 pb-8">
          <main className="flex-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[40px] font-extrabold font-secondary mb-6 md:mb-8">
              {category?.title || (slug.charAt(0).toUpperCase() + slug.slice(1))}
            </h1>
            <p className="text-lg sm:text-xl md:text-[36px] font-secondary mb-6 md:mb-8">
              {category?.description || `${slug.charAt(0).toUpperCase() + slug.slice(1)} is a collection of products that are designed to be used in a variety of ways.`}
            </p>
            {isLoading && (
              <p className="text-lg font-secondary mb-8">Loading...</p>
            )}
            {error && (
              <p className="text-red-500 font-secondary mb-8">{error.message || 'Failed to load category'}</p>
            )}
            {/* Product Grid with responsive spacing */}
            {/* Full rows */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-16">
              {fullRowProducts.map((product, idx) => (
                <Link key={idx} href={`/category/${slug}/${product.slug}`} className="block">
                  <ProductCard
                    title={product.title}
                    image={product.image?.url || `https://placehold.co/400x350/FFCCB6/000000?text=${encodeURIComponent(product.title)}`}
                    onHoverImage={product.onHover?.url}
                    aspectRatio={1}
                  />
                </Link>
              ))}
            </div>
            {/* Last row, centered if 1 or 2 items */}
            {lastRowProducts.length > 0 && (
              <div className="flex justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-16 mt-6 sm:mt-8 md:mt-12 w-full">
                {lastRowProducts.map((product, idx) => (
                  <Link
                    key={fullRowProducts.length + idx}
                    href={`/category/${slug}/${product.slug}`}
                    className="block w-full sm:w-1/2 lg:w-[30%]"
                  >
                    <ProductCard
                      title={product.title}
                      subtitle={product.description}
                      image={product.image?.url || `https://placehold.co/400x350/FFCCB6/000000?text=${encodeURIComponent(product.title)}`}
                      onHoverImage={product.onHover?.url}
                      aspectRatio={1}
                    />
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
            {/* FAQ Section */}
            <section className="pb-12 md:pb-16 bg-white">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl sm:text-3xl font-bold font-secondary mb-6">FAQ</h2>
                <div className="w-full">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="mb-2">
                      <div
                        className="flex items-center cursor-pointer pt-4 sm:pt-6"
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      >
                        <span className="text-2xl sm:text-3xl text-[#FA7035] font-bold mr-4 sm:mr-6 md:mr-8 select-none transition-transform flex-shrink-0" style={{ minWidth: '24px', textAlign: 'center' }}>
                          {openFaq === idx ? '-' : '+'}
                        </span>
                        <span className="text-lg sm:text-xl font-secondary text-black">
                          {faq.question}
                        </span>
                      </div>
                      {openFaq === idx && (
                        <div className="pl-8 sm:pl-12 md:pl-16 pb-4 text-gray-700 font-secondary font-semibold text-sm sm:text-base">
                          {faq.answer}
                        </div>
                      )}
                      <div className="border-[1px] border-[#FA7035] w-full" />
                    </div>
                  ))}
                </div>
                <div className="mt-30">
                  <button
                    className=" border-[#FCA17A] border-2 bg-white hover:bg-[#FCA17A] text-black font-secondary  px-6 sm:px-8 py-2 rounded-lg transition-colors text-base sm:text-lg"
                    onClick={() => router.push('/')}
                  >
                    Back To Home
                  </button>
                </div>
              </div>
            </section>
      </div>
    </>
  );
}