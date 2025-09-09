"use client";
import React from "react";
import Image from "next/image";

const images = [
  {
    src: "https://placehold.co/250x350",
    alt: "Co-working in Yerevan, 2022",
    caption: "Co-working in Yerevan, 2022",
    w: 250,
    h: 350,
  },
  {
    src: "https://placehold.co/300x400",
    alt: "Teamwork",
    caption: "Teamwork",
    w: 300,
    h: 400,
  },
  {
    src: "https://placehold.co/350x250",
    alt: "Workshop",
    caption: "Workshop",
    w: 350,
    h: 250,
  },
  {
    src: "https://placehold.co/600x800",
    alt: "Our Fall Party, 2021",
    caption: "Our Fall Party, 2021",
    w: 250,
    h: 350,
  },
];

export default function WhoWeAre() {
  return (
    <section className="w-full pt-[clamp(2.5rem,5vw,3rem)]">
      <div className="flex flex-col lg:flex-row mt-[clamp(3rem,8vw,6rem)] px-[clamp(1.25rem,5vw,5rem)]">
        <div className="w-full lg:w-[33%] mb-[clamp(2rem,4vw,3rem)] lg:mb-0 lg:pr-[clamp(2rem,4vw,3rem)]">
          <span className="text-sunrise text-[clamp(1.5rem,4vw,2.25rem)] font-secondary">
            Who we are
          </span>
        </div>
        <div className="w-full lg:w-[67%]">
          <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] leading-[1.3] mb-[clamp(2rem,5vw,3rem)]">
            We&apos;re a creative team born out of the jewelry trade, from
            Mumbai to LA. We&apos;ve lived the chaos of exhibitions, product
            drops, and client deadlines — and built Chariot to make it all a
            little easier.
          </h2>
        </div>
      </div>
      <div className="overflow-hidden w-full flex justify-center mt-[clamp(2rem,5vw,3rem)]">
        <div className="relative">
          <div className="carousel-track flex items-end gap-[clamp(1rem,3vw,2rem)]">
            {[...images, ...images, ...images].map((img, i) => (
              <div
                key={i}
                className="flex flex-col items-center flex-shrink-0"
                style={{ 
                  minWidth: `clamp(150px, ${img.w * 0.6}px, ${img.w}px)`,
                  height: `clamp(200px, ${img.h * 0.6}px, ${img.h}px)`
                }}
              >
                <div
                  className="rounded-lg overflow-hidden shadow-lg bg-white"
                  style={{ 
                    width: `clamp(150px, ${img.w * 0.6}px, ${img.w}px)`,
                    height: `clamp(200px, ${img.h * 0.6}px, ${img.h}px)`
                  }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={img.w}
                    height={img.h}
                    className="object-cover w-full h-full"
                    draggable={false}
                  />
                </div>
                <span className="text-gray-400 text-[clamp(0.75rem,1.8vw,0.875rem)] mt-[clamp(0.5rem,1.5vw,0.75rem)] text-center w-full px-1">
                  {img.caption}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .carousel-track {
          animation: scroll-x 20s linear infinite;
        }
        .carousel-track:hover {
          animation-play-state: paused;
        }
        @keyframes scroll-x {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        
        @media (max-width: 768px) {
          .carousel-track {
            animation-duration: 15s;
          }
        }
        
        @media (max-width: 480px) {
          .carousel-track {
            animation-duration: 12s;
          }
        }
      `}</style>
    </section>
  );
}
