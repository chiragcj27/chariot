import { useState, useEffect, useRef, useLayoutEffect } from "react";

interface Testimonial {
  text: string;
  author: string;
  role: string;
}

interface TestimonialsCarouselProps {
  testimonials?: string[];
}

// Auto-fit component
const AutoFitGroup: React.FC<{
  children: React.ReactNode;
  maxFontSize?: number;
  minFontSize?: number;
  padding?: number | string;
}> = ({ children, maxFontSize = 28, minFontSize = 8, padding = 8 }) => {
  const groupRef = useRef<HTMLDivElement>(null);

  const resize = () => {
    const el = groupRef.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;

    // Use the full parent dimensions since padding is applied to the element itself
    const availW = parent.clientWidth;
    const availH = parent.clientHeight;

    let low = minFontSize;
    let high = maxFontSize;
    let best = low;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      el.style.fontSize = `${mid}px`;

      // Force reflow
      const fits = el.scrollHeight <= availH && el.scrollWidth <= availW;

      if (fits) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    el.style.fontSize = `${best}px`;
  };

  useLayoutEffect(() => {
    resize();

    const ro = new ResizeObserver(resize);
    if (groupRef.current) ro.observe(groupRef.current);
    if (groupRef.current?.parentElement) ro.observe(groupRef.current.parentElement);

    return () => ro.disconnect();
  }, [children, maxFontSize, minFontSize, padding]);

  return (
    <div
      ref={groupRef}
      className="w-full h-full flex flex-col items-center justify-center text-center break-words overflow-hidden"
      style={{
        lineHeight: 1.3,
        padding: typeof padding === 'string' ? padding : `${padding}px`
      }}
    >
      {children}
    </div>
  );
};





const TestimonialsCarousel = ({ testimonials = [] }: TestimonialsCarouselProps) => {
  const formattedTestimonials: Testimonial[] = testimonials.map((text, index) => ({
    text,
    author: `Customer ${index + 1}`,
    role: "Verified Buyer",
  }));

  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formattedTestimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(
        (prevIndex) => (prevIndex + 1) % formattedTestimonials.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [formattedTestimonials.length]);

  if (formattedTestimonials.length === 0) {
    return (
      <div className="bg-white shadow-2xl bg-opacity-80 w-full h-full flex flex-col items-center justify-center rounded-2xl md:rounded-3xl lg:rounded-4xl">
        <div className="font-medium text-base sm:text-lg md:text-xl lg:text-2xl mb-2 sm:mb-3 md:mb-4">
          Testimonials
        </div>
        <div className="flex flex-col items-center justify-center w-full px-4 sm:px-6 md:px-8">
          <span className="italic text-gray-700 text-center text-sm sm:text-base md:text-lg">
            No testimonials available
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-white bg-opacity-80 w-full h-full flex flex-col items-center justify-center relative overflow-hidden border-2 sm:border-3 md:border-4 rounded-2xl md:rounded-3xl lg:rounded-4xl"
      style={{ borderColor: "#CFDAE9" }}
    >
      {formattedTestimonials.map((testimonial, index) => {
        let slideClass = "";

        if (index === currentIndex) {
          // Current slide → center
          slideClass = "opacity-100 transform translate-x-0 z-10";
        } else if (
          index === (currentIndex - 1 + formattedTestimonials.length) % formattedTestimonials.length
        ) {
          // Previous slide → exit left
          slideClass = "opacity-0 transform -translate-x-full z-0";
        } else {
          // All other slides → wait on the right
          slideClass = "opacity-0 transform translate-x-full z-0";
        }

        return (
          <div
            key={index}
            className={`absolute inset-0 transition-transform transition-opacity duration-700 ease-in-out ${slideClass}`}
          >
            <AutoFitGroup maxFontSize={20} minFontSize={10}>
              <blockquote className="text-gray-700 italic mb-[0.6em]">
                &quot;{testimonial.text}&quot;
              </blockquote>
              <div className="font-semibold text-gray-800 text-sm lg:text-base">
                {testimonial.author}
              </div>
              <div className="text-gray-600 text-xs lg:text-base">
                {testimonial.role}
              </div>
            </AutoFitGroup>
          </div>
        );
      })}


    </div>
  );
};

export default TestimonialsCarousel; 