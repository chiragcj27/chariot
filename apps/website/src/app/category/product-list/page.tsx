import Footer from "@/components/Footer";
import FilterDropDown from "@/components/FilterDropDown";

const mockProducts = [
  {
    title: "Unearth",
    subtitle: "7.1 Fluid Engine ✶ $297",
    image: "https://placehold.co/400x350?text=Unearth",
  },
  {
    title: "Shelley",
    subtitle: "7.1 Fluid Engine ✶ $297",
    image: "https://placehold.co/400x350?text=Shelley",
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
                <div key={idx} className="flex flex-col items-center">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-[350px] object-cover rounded shadow-md mb-6"
                  />
                  <div className="w-full text-center">
                    <span className="block text-2xl font-secondary font-semibold mb-2">{product.title}</span>
                    <span className="block text-lg font-primary text-black/70">{product.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
        <Footer />
      </div>
    </>
  );
}