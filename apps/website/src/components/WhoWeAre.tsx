"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Marquee from "react-fast-marquee";
import img1 from "../../public/1.png";
import img2 from "../../public/2.jpg";
import img3 from "../../public/3.png";  
import img4 from "../../public/4.png";
import img5 from "../../public/5.jpg";

const images = [
  {
    src: img1,
    alt: "Mark Samuels Jwellers",
    caption: "Mark Samuels Jwellers",
    w: 960,
    h: 540,
  },
  {
    src: img3,
    alt: "what we do",
    caption: "what we do",
    w: 416,
    h: 836,
  },
  {
    src: img2,
    alt: "Mark Samuels Jwellers",
    caption: "Mark Samuels Jwellers",
    w: 675,
    h: 540,
  },
  {
    src: img4,
    alt: "Mother's Day",
    caption: "Mother's Day",
    w: 594,
    h: 844,
  },
  {
    src: img5,
    alt: "Blind Craft",
    caption: "Blind Craft",
    w: 665.06,
    h: 506.25,
  },
];

export default function WhoWeAre() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <section className="w-full pt-[clamp(1.5rem,3.5vw,2.90rem)]">
      {/* Heading */}
      <div className="flex flex-col lg:flex-row mt-[clamp(3rem,8vw,6rem)] px-[clamp(1.25rem,5vw,5rem)]">
        <div className="w-full lg:w-[33%] mb-[clamp(1.25rem,4vw,3rem)] lg:mb-0 lg:pr-[clamp(2rem,4vw,3rem)]">
          <span className="text-sunrise text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-secondary">
            Who we are
          </span>
        </div>
        <div className="w-full lg:w-[67%]">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-[1.4] lg:pl-4 mb-[clamp(2rem,5vw,3rem)]">
            We&apos;re a creative team born out of the jewelry trade, from
            Mumbai to LA. We&apos;ve lived the chaos of exhibitions, product
            drops, and client deadlines — and built Chariot to make it all a
            little easier.
          </h2>
        </div>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden w-full flex justify-center mt-[clamp(2rem,5vw,3rem)]">
        <Marquee autoFill={true}  gradient={false} speed={60} >
          <div className="flex items-start">
            {images.map((img, i) => {
              const scale = isMobile ? 0.75 : 1;
              const minWidth = `clamp(150px, ${img.w * 0.6 * scale}px, ${img.w * scale}px)`;
              const minHeight = `clamp(200px, ${img.h * 0.6 * scale}px, ${img.h * scale}px)`;
              return (
              <div
                key={`img-${i}`}
                className="flex flex-col items-center m-2 flex-shrink-0"
                style={{
                  minWidth,
                  height: minHeight,
                }}
              >
                <div
                  className="group overflow-hidden shadow-lg bg-white"
                  style={{
                    width: minWidth,
                    height: minHeight,
                  }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={img.w}
                    height={img.h}
                    className="object-cover w-full h-full transition-all duration-300 sm:grayscale sm:group-hover:grayscale-0"
                    draggable={false}
                  />
                </div>
                <span className="text-gray-400 text-[clamp(0.75rem,1.8vw,0.875rem)] mt-[clamp(0.5rem,1.5vw,0.75rem)] text-center w-full px-1">
                  {img.caption}
                </span>
              </div>
              );
            })}
          </div>
        </Marquee>
      </div>
    </section>
  );
}
