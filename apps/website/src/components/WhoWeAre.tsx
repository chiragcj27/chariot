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
    <section className="w-full pt-10">
      <div className="flex flex-col md:flex-row mt-24 px-5 md:px-10 lg:px-20">
        <div className="w-full md:w-1/3 mb-8 md:mb-0">
          <span className="text-sunrise text-[36px] font-secondary">
            Who we are
          </span>
        </div>
        <div className="w-full md:w-2/3">
          <h2 className="text-[32px] md:text-[32px] mb-12">
            We&apos;re a creative team born out of the jewelry trade, from
            Mumbai to LA. We&apos;ve lived the chaos of exhibitions, product
            drops, and client deadlines — and built Chariot to make it all a
            little easier.
          </h2>
        </div>
      </div>
      <div className="overflow-hidden w-full flex justify-center">
        <div className="relative">
          <div className="carousel-track flex items-end gap-8">
            {[...images, ...images, ...images].map((img, i) => (
              <div
                key={i}
                className="flex flex-col items-center"
                style={{ minWidth: img.w, height: img.h }}
              >
                <div
                  className="rounded-lg overflow-hidden shadow-lg bg-white"
                  style={{ width: img.w, height: img.h }}
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
                <span className="text-gray-400 text-sm mt-2 text-center w-full">
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
      `}</style>
    </section>
  );
}
