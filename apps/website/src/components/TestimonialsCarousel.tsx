import { useState, useEffect } from "react";

interface Testimonial {
  text: string;
  author: string;
  role: string;
}

interface TestimonialsCarouselProps {
  testimonials?: string[];
}

const TestimonialsCarousel = ({ testimonials = [] }: TestimonialsCarouselProps) => {
  // Convert string testimonials to the format expected by the carousel
  const formattedTestimonials: Testimonial[] = testimonials.map((text, index) => ({
    text,
    author: `Customer ${index + 1}`,
    role: "Verified Buyer"
  }));

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (formattedTestimonials.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % formattedTestimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [formattedTestimonials.length]);

  if (formattedTestimonials.length === 0) {
    return (
      <div className="bg-white shadow-2xl bg-opacity-80 rounded-3xl w-full h-full flex flex-col items-center justify-center">
        <div className="text-lg font-medium mb-1">Testimonials</div>
        <div className="flex flex-col items-center justify-center w-full px-2">
          <span className="italic text-gray-700 text-center text-xs sm:text-sm md:text-xs lg:text-xs">No testimonials available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-gray-300 bg-opacity-80 rounded-3xl w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
      
      {formattedTestimonials.map((testimonial, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentIndex 
              ? "opacity-100 transform translate-y-0" 
              : "opacity-0 transform translate-y-4"
          }`}
        >
          {/* Responsive padding and text sizing */}
          <div className="pt-8 px-2 sm:pt-10 sm:px-3 md:pt-8 md:px-2 lg:pt-6 lg:px-2">
            <blockquote className="text-gray-700 mb-1 sm:mb-2 italic leading-relaxed text-center text-xs sm:text-sm md:text-2xl lg:text-2xl">
              &quot;{testimonial.text}&quot;
            </blockquote>
            <div className="text-center">
              <div className="font-semibold text-gray-800 text-xs sm:text-xs md:text-xs lg:text-sm">{testimonial.author}</div>
              <div className="text-gray-600 text-xs sm:text-xs md:text-xs lg:text-sm">{testimonial.role}</div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Progress indicator - responsive positioning */}
      {formattedTestimonials.length > 1 && (
        <div className="absolute bottom-1 sm:bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {formattedTestimonials.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-gray-800 w-3 sm:w-4" : "bg-gray-400 w-1 sm:w-2"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TestimonialsCarousel; 