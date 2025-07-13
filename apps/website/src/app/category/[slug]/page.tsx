"use client"
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useState } from "react";
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
    title: "Unearth",
    subtitle: "7.1 Fluid Engine ✶ $297",
    image: "https://placehold.co/400x350?text=Unearth",
    onHoverImage: "https://placehold.co/400x350?text=Unearth+Hover",
  },
  {
    title: "Shelley",
    subtitle: "7.1 Fluid Engine ✶ $297",
    image: "https://placehold.co/400x350?text=Shelley",
    onHoverImage: "https://placehold.co/400x350?text=Shelley+Hover",
  },
  {
    title: "Verano",
    subtitle: "7.1 Fluid Engine ✶ $297",
    image: "https://placehold.co/400x350?text=Verano",
  },
  {
    title: "Noire",
    subtitle: "7.1 Fluid Engine ✶ $297",
    image: "https://placehold.co/400x350?text=Noire",
    onHoverImage: "https://placehold.co/400x350?text=Noire+Hover",
  },
  {
    title: "Ann Grand",
    subtitle: "7.1 Fluid Engine ✶ $297",
    image: "https://placehold.co/400x350?text=Ann Grand",
  },
  {
    title: "Michi",
    subtitle: "7.1 Fluid Engine ✶ $297",
    image: "https://placehold.co/400x350?text=Michi",
    onHoverImage: "https://placehold.co/400x350?text=Michi+Hover",
  },
];

export default function CategoryPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const router = useRouter();

  return (
    <>
      <div className="min-h-screen bg-[#fdfbf6]">
        {/* Banner Section */}
        <section className="relative w-full h-[340px] md:h-[420px] flex items-center justify-center mb-8">
          {/* Banner Image */}
          <img
            src="https://placehold.co/1600x420/cfdae9/FFFFFF?text=Prints"
            alt="Banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30" />
          {/* Banner Content */}
          <div className="relative z-10 flex flex-col items-center text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 font-secondary drop-shadow">
              PRINT
            </h1>
            <p className="text-lg md:text-2xl mb-6 max-w-2xl drop-shadow">
              Insanely simple. Surprisingly affordable. Wildly empowering. The website solution your resourceful, entrepreneurial self has been looking for.
            </p>
            <button className="px-8 py-4 rounded-full border border-white text-lg font-medium bg-white/80 text-black hover:bg-white transition">
              Explore Prints
            </button>
          </div>
        </section>
        {/* Existing content below */}
        <div className="container mx-auto flex flex-col md:flex-row gap-12 pt-12 pb-8">
          {/* Main Content: Product Grid */}
          <main className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
              {mockProducts.map((product, idx) => (
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
          </main>
        </div>
            {/* FAQ Section */}
    <section className="px-8 pb-16">
      <h2 className="text-3xl font-bold font-secondary mb-6">FAQs</h2>
      <div className="max-w-2xl mx-auto">
        {faqs.map((faq, idx) => (
          <div key={idx} className="mb-4">
            <button
              className={`w-full flex justify-between items-center focus:outline-none transition-colors font-semibold text-lg px-6 py-3 rounded-full shadow-sm border-none
                ${openFaq === idx ? 'bg-seafoam text-black' : 'bg-seafoam/50 text-black/80 hover:bg-seafoam/70'}`}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <span>{faq.question}</span>
              <span className="ml-4">{openFaq === idx ? '-' : '+'}</span>
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
          className="bg-sunrise/50 hover:bg-sunrise/90 text-black font-semibold px-8 py-3 rounded-lg transition-colors shadow text-lg"
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