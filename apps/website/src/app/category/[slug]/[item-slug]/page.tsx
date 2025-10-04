'use client'
import FilterDropDown from "@/components/FilterDropDown";
import ProductCard from "@/components/ProductCard";
import DiscoveryCallButton from "@/components/DiscoveryCallButton";
import AskForQuoteButton from "@/components/AskForQuoteButton";
import { use, useEffect, useMemo, useState, useCallback } from "react";
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

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Array<{ id: string; name: string; values: Array<{ id: string; value: string; isDefault?: boolean }> }>>([]);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [productsPerPage, setProductsPerPage] = useState<number>(6);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/products/category/${slug}/item/${itemSlug}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
      }
      const data: ProductsResponse = await res.json();
      setAllProducts(data.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [slug, itemSlug]);

  useEffect(() => {
    fetchProducts();
    setCurrentPage(1); // Reset to first page when category/item changes
  }, [slug, itemSlug, fetchProducts]);

  // Handle responsive products per page
  useEffect(() => {
    const updateProductsPerPage = () => {
      if (window.innerWidth < 1024) { // lg breakpoint
        setProductsPerPage(6); // Mobile/tablet
      } else {
        setProductsPerPage(12); // Laptop/desktop
      }
    };

    // Set initial value
    updateProductsPerPage();

    // Add event listener for window resize
    window.addEventListener('resize', updateProductsPerPage);

    // Cleanup event listener
    return () => window.removeEventListener('resize', updateProductsPerPage);
  }, []);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

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
      return allProducts;
    }

    return allProducts.filter(product => {
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
  }, [allProducts, selectedFilters]);

  // Calculate pagination for filtered products
  const pagination = useMemo(() => {
    const total = filteredProducts.length;
    const totalPages = Math.ceil(total / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      total,
      totalPages,
      currentPage,
      hasMore: currentPage < totalPages,
      products: paginatedProducts
    };
  }, [filteredProducts, currentPage, productsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilters]);

  // Reset to first page when products per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [productsPerPage]);

  const getDisplayImage = useMemo(() => (p: Product) => {
    const imgs = p.images || [];
    const main = imgs.find(i => i.isMain) || imgs[0];
    return main?.url || `https://placehold.co/400x350/FFEAEA/000000?text=${encodeURIComponent(p.name)}`;
  }, []);

  return (
    <>
      <div className="min-h-screen bg-[#fdfbf6]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section with Catalogs */}
          <div className="pt-8 sm:pt-12 pb-6 sm:pb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-secondary font-bold mb-4 sm:mb-6 leading-tight">
              {itemSlug.charAt(0).toUpperCase() + itemSlug.slice(1)}
            </h1>
          </div>

          {/* Filter and Products Layout */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Filter Section */}
            <div className="lg:w-1/4">
              <FilterDropDown
                filters={filters}
                onChange={setSelectedFilters}
              />
            </div>

            {/* Main Content: Product Grid */}
            <div className="lg:w-3/4">
              <div className="grid grid-cols-2 w-full sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4 lg:gap-6 xl:gap-8">

                {loading && (
                  <p className="text-lg font-secondary mb-8">Loading...</p>
                )}
                {error && (
                  <p className="text-red-500 font-secondary mb-8">{error}</p>
                )}
                {!loading && !error && allProducts.length === 0 && (
                  <p className="text-lg text-center w-fullfont-secondary mb-8">No products found.</p>
                )}
                {!loading && !error && filteredProducts.length === 0 && allProducts.length > 0 && (
                  <p className="text-lg font-secondary mb-8">No products match the selected filters.</p>
                )}
                {pagination.products.map((product) => (
                  <ProductCard
                    key={product._id}
                    title={product.name}
                    image={getDisplayImage(product)}
                    aspectRatio={3 / 4}
                    onClick={() => router.push(`/product/${product.slug}`)}
                    className=""
                  />
                 ))}
               </div>
               
               {/* Pagination */}
               {pagination.totalPages > 1 && (
                 <div className="flex justify-center items-center mt-8 space-x-2">
                   <button
                     onClick={() => handlePageChange(pagination.currentPage - 1)}
                     disabled={pagination.currentPage === 1}
                     className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     Previous
                   </button>
                   
                   <div className="flex space-x-1">
                     {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                       let pageNum;
                       if (pagination.totalPages <= 5) {
                         pageNum = i + 1;
                       } else if (pagination.currentPage <= 3) {
                         pageNum = i + 1;
                       } else if (pagination.currentPage >= pagination.totalPages - 2) {
                         pageNum = pagination.totalPages - 4 + i;
                       } else {
                         pageNum = pagination.currentPage - 2 + i;
                       }
                       
                       return (
                         <button
                           key={pageNum}
                           onClick={() => handlePageChange(pageNum)}
                           className={`px-3 py-2 text-sm font-medium rounded-md ${
                             pageNum === pagination.currentPage
                               ? 'bg-[#FCA17A] text-white'
                               : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                           }`}
                         >
                           {pageNum}
                         </button>
                       );
                     })}
                   </div>
                   
                   <button
                     onClick={() => handlePageChange(pagination.currentPage + 1)}
                     disabled={pagination.currentPage === pagination.totalPages}
                     className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     Next
                   </button>
                 </div>
               )}
             </div>
           </div>
         </div>
        {/* Customise Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="container mx-auto">
            {/* <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-secondary mb-3 sm:mb-4 lg:mb-6">Customize</h2> */}
            <div className="bg-[#CFDAE9] p-3  sm:p-4 lg:p-6 lg:py-18">
              <h3 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3">Make It Yours - Custom Kits, Tailored to You</h3>
              <p className="text-sm sm:text-base md:text-lg lg:text-2xl font-secondary mb-4 sm:mb-6">
                Need something tailored to your brand? We offer customization across templates, color palettes, messaging, and layouts. Whether it&apos;s a full kit revamp or small tweaks, we&apos;ll deliver a ready-to-use version that fits perfectly.
              </p>
              <div className="flex flex-row justify-center gap-2 sm:gap-4">
                <DiscoveryCallButton
                  className="bg-white text-sm sm:text-base border-2 rounded-md border-[#FCA17A] px-3 sm:px-4 lg:px-8 py-2 transition-colors hover:bg-[#FCA17A]/70 focus:outline-none focus:ring-2 focus:ring-[#FCA17A]/40 whitespace-nowrap"
                  title="Discovery Call"
                  subtitle="Let&apos;s discuss how we can customize this product for your brand"
                >
                  Discovery Call
                </DiscoveryCallButton>
                <AskForQuoteButton
                  className="bg-white text-sm sm:text-base border-2 rounded-md border-[#FCA17A] px-3 sm:px-4 lg:px-8 py-2 transition-colors hover:bg-[#FCA17A]/70 focus:outline-none focus:ring-2 focus:ring-[#FCA17A]/40 whitespace-nowrap"
                  productName={allProducts[0]?.name}
                  productType="product"
                >
                  Ask For Quote
                </AskForQuoteButton>
              </div>
            </div>
          </div>
        </section>
         <div className="w-full relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("/Rectangle%20122%20(1).png")', backgroundColor: '#f5f5f5' }}>
           <div className="absolute inset-0 bg-white opacity-60"></div>
           <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
             <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black mb-3 sm:mb-4">
               Tailor It to Your Brand
             </h1>
             <p className="text-sm sm:text-base md:text-lg lg:text-2xl font-secondary text-black max-w-4xl">
               Personalize any design to match your brand from logo placement and color palette to layout and size. Whether it&apos;s packaging, print or digital, we&apos;ll adapt it for your store so you stand out with marketing that&apos;s distinctly yours.
             </p>
           </div>
         </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <button
            className="border-[#FCA17A] border-2 bg-white hover:bg-[#FCA17A] text-black font-secondary font-semibold px-6 sm:px-8 py-2 rounded-lg transition-colors text-base sm:text-lg"
            onClick={() => router.push('/')}
          >
            Back To Home
          </button>
        </div>
      </div>
    </>
  );
}