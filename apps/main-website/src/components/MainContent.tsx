import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface Banner {
  _id: string;
  url: string;
  redirectUrl: string;
  deviceType: 'desktop' | 'mobile' | 'both';
  rotationOrder: number;
  isActive: boolean;
  filename: string;
  originalName: string;
}

export const MainContent: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:3001/api/landing/banners?deviceType=both');
        const data = await response.json();

        // Check if data is an array directly
        if (Array.isArray(data)) {
          setBanners(data);
        }
        // Check if data has a banners property that's an array
        else if (data.banners && Array.isArray(data.banners)) {
          setBanners(data.banners);
        }
        // Check if data has a data property that's an array
        else if (data.data && Array.isArray(data.data)) {
          setBanners(data.data);
        }
        else {
          console.error('Unexpected API response format:', data);
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching hero images:', error);
        // Fallback to a default image if API fails
        setBanners([{
          _id: 'default',
          url: 'https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          redirectUrl: 'https://www.google.com',
          deviceType: 'desktop',
          rotationOrder: 1,
          isActive: true,
          filename: 'default.jpg',
          originalName: 'default.jpg'
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroImages();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const startRotation = () => {
      intervalRef.current = setInterval(() => {
        if (!isPaused) {
          setCurrentImageIndex((prevIndex) => 
            prevIndex === banners.length - 1 ? 0 : prevIndex + 1
          );
        }
      }, 5000); // Change image every 5 seconds
    };

    startRotation();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [banners, isPaused]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <main>
      {/* Hero section */}
      <section className="relative h-[80vh] bg-navy-900 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {!isLoading && banners.length > 0 && (
            <div className="relative w-full h-full">
              {banners.map((banner, index) => (
                <div
                  key={banner._id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentImageIndex ? 'opacity-70' : 'opacity-0'
                  }`}
                >
                  <Image 
                    src={banner.url}
                    alt={banner.originalName || 'Banner image'}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}
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