'use client'
import Footer from "@/components/Footer";
import FilterDropDown from "@/components/FilterDropDown";
import ProductCard from "@/components/ProductCard";
import DiscoveryCallButton from "@/components/DiscoveryCallButton";
import AskForQuoteButton from "@/components/AskForQuoteButton";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type ProductImage = {
  url: string;
  isMain?: boolean;
};

type Product = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  images?: ProductImage[];
  filterValues?: Record<string, string[]>;
};

type ProductsResponse = {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export default function ProductListPage({ params }: { params: Promise<{ slug: string; 'item-slug': string }> }) {
  const router = useRouter();
  const { slug, 'item-slug': itemSlug } = use(params);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Array<{ id: string; name: string; values: Array<{ id: string; value: string; isDefault?: boolean }> }>>([]);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}/api/products/category/${slug}/item/${itemSlug}?page=1&limit=12`);
        if (!res.ok) {
          throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
        }
        const data: ProductsResponse = await res.json();
        if (isMounted) setProducts(data.products || []);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [slug, itemSlug]);

  // Fetch dynamic filters for the current item from menu structure
  useEffect(() => {
    let isMounted = true;
    const fetchFilters = async () => {
      try {
        const res = await fetch(`${API_URL}/api/menu/structure`);
        if (!res.ok) {
          throw new Error(`Failed to fetch menu structure: ${res.status} ${res.statusText}`);
        }
        const data: Array<{
          slug: string;
          items?: Array<{
            slug: string;
            filters?: Array<{ id: string; name: string; values: Array<{ id: string; value: string; isDefault?: boolean }> }>;
          }>;
        }> = await res.json();
        const category = data.find((c) => c.slug === slug);
        const item = category?.items?.find((i) => i.slug === itemSlug);
        if (isMounted) {
          setFilters(item?.filters || []);
        }
      } catch (err) {
        // Silently ignore filter load errors so page still works
        if (isMounted) {
          setFilters([]);
        }
      }
    };
    fetchFilters();
    return () => { isMounted = false; };
  }, [slug, itemSlug]);

  // Filter products based on selected filter values
  const filteredProducts = useMemo(() => {
    if (!selectedFilters || Object.keys(selectedFilters).length === 0) {
      return products;
    }

    return products.filter(product => {
      // If product has no filterValues, exclude it when filters are selected
      if (!product.filterValues) {
        return false;
      }

      // Check if product matches all selected filters
      for (const [filterId, selectedValues] of Object.entries(selectedFilters)) {
        if (selectedValues.length === 0) continue; // Skip empty filter selections

        const productFilterValues = product.filterValues[filterId];
        if (!productFilterValues) {
          return false; // Product doesn't have this filter, exclude it
        }

        // Check if any of the selected values match the product's filter values
        const hasMatch = selectedValues.some(selectedValue => 
          productFilterValues.includes(selectedValue)
        );

        if (!hasMatch) {
          return false; // Product doesn't match this filter, exclude it
        }
      }

      return true; // Product matches all filters
    });
  }, [products, selectedFilters]);

  const getDisplayImage = useMemo(() => (p: Product) => {
    const imgs = p.images || [];
    const main = imgs.find(i => i.isMain) || imgs[0];
    return main?.url || `https://placehold.co/400x350/FFEAEA/000000?text=${encodeURIComponent(p.name)}`;
  }, []);

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
              <FilterDropDown 
                filters={filters} 
                onChange={setSelectedFilters}
              />
            </div>
          </aside>
          {/* Main Content: Product Grid */}
          <main className="flex-1">
            {loading && (
              <p className="text-lg font-secondary mb-8">Loading...</p>
            )}
            {error && (
              <p className="text-red-500 font-secondary mb-8">{error}</p>
            )}
            {!loading && !error && products.length === 0 && (
              <p className="text-lg font-secondary mb-8">No products found.</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  title={product.name}
                  image={getDisplayImage(product)}
                  aspectRatio={3/4}
                  onClick={() => router.push(`/product/${product.slug}`)}
                />
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
          Need something tailored to your brand? We offer customization across templates, color palettes, messaging, and layouts. Whether it&apos;s a full kit revamp or small tweaks, we&apos;ll deliver a ready-to-use version that fits perfectly.
        </p>
        <div className="flex flex-row gap-8">
          <AskForQuoteButton 
            productName={products[0]?.name}
            productType="product"
          />
          <DiscoveryCallButton 
            title="Book a Discovery Call"
            subtitle="Let&apos;s discuss how we can customize this product for your brand"
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
      </div>
    </>
  );
}