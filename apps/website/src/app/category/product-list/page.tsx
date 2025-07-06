import Footer from "@/components/Footer";
import FilterDropDown from "@/components/FilterDropDown";
import ProductCard from "@/components/ProductCard";

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

export default function ProductListPage() {
  return (
    <>
      <div className="min-h-screen bg-[#fdfbf6]">
        <div className="container mx-auto flex flex-col md:flex-row gap-12 pt-12 pb-8">
          {/* Sidebar: Heading + Filter */}
          <aside className="md:w-80 w-full md:shrink-0 mb-8 md:mb-0 flex flex-col items-start">
            <h1 className="text-5xl font-secondary font-bold mb-8 leading-tight">
              Shop our <span className="italic text-sunrise font-primary">Catalogs</span>
            </h1>
            <div className="w-full">
              <FilterDropDown />
            </div>
          </aside>
          {/* Main Content: Product Grid */}
          <main className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
              {mockProducts.map((product, idx) => (
                <ProductCard
                  key={idx}
                  title={product.title}
                  subtitle={product.subtitle}
                  image={product.image}
                  onHoverImage={product.onHoverImage}
                />
              ))}
            </div>
          </main>
        </div>
        <Footer />
      </div>
    </>
  );
}