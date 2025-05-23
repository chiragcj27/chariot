import React from 'react';
import Image from 'next/image';

export const MainContent: React.FC = () => {
  return (
    <main>
      {/* Hero section */}
      <section className="relative h-[80vh] bg-navy-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image 
            src="https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
            alt="Luxury jewelry collection" 
            fill
            className="object-cover opacity-70"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-cream mb-4 tracking-wide">
            Timeless Elegance
          </h1>
          <p className="text-lg md:text-xl text-beige-100 mb-8 max-w-2xl mx-auto">
            Discover our exquisite collection of handcrafted jewelry designed to captivate for generations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#shop" className="bg-cream text-navy-900 px-8 py-3 rounded-md font-medium hover:bg-beige-200 transition-colors">
              Shop Collection
            </a>
            <a href="#about" className="border border-cream text-cream px-8 py-3 rounded-md font-medium hover:bg-navy-800 transition-colors">
              Our Story
            </a>
          </div>
        </div>
      </section>

      {/* Featured categories section */}
      <section className="py-16 px-4 bg-cream">
        <div className="container mx-auto">
          <h2 className="text-3xl font-serif text-navy-900 text-center mb-12">Exquisite Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredCategories.map((category) => (
              <div key={category.id} className="group">
                <div className="aspect-square relative overflow-hidden rounded-lg mb-4">
                  <Image 
                    src={category.image} 
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 to-transparent flex items-end">
                    <div className="p-6">
                      <h3 className="text-xl font-serif text-cream">{category.name}</h3>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

const featuredCategories = [
  {
    id: 'rings',
    name: 'Rings',
    image: 'https://images.pexels.com/photos/10017559/pexels-photo-10017559.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 'necklaces',
    name: 'Necklaces',
    image: 'https://images.pexels.com/photos/11656901/pexels-photo-11656901.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 'earrings',
    name: 'Earrings',
    image: 'https://images.pexels.com/photos/12929510/pexels-photo-12929510.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 'bracelets',
    name: 'Bracelets',
    image: 'https://images.pexels.com/photos/9428868/pexels-photo-9428868.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  }
];