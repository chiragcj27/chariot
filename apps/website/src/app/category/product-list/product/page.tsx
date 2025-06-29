'use client';
import React, { useState } from "react";
import Image from "next/image";
// Dummy product data
const product = {
  title: "unearth",
  subcategory: "Squarespace Template",
  price: 297,
  description:
    "The Unearth Squarespace Template is a modern and artistic template with an interactive collage–style layout. Perfect for small businesses, artists, and bloggers, this template draws attention to your most important information and guides visitors around your site with ease.",
  images: [
    "https://placehold.co/600x600?text=Image+1",
    "https://placehold.co/600x600?text=Image+2",
    "https://placehold.co/600x600?text=Image+3",
  ],
  rating: 5,
  reviews: 12,
};

function Carousel({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
  return (
    <div className="relative  rounded-lg overflow-hidden flex items-center justify-center">
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white z-10"
        aria-label="Previous image"
      >
        <span className="text-2xl">&#8592;</span>
      </button> 
      <Image
        src={images[current]}
        alt={`Product image ${current + 1}`}
        className="object-contain w-full h-full transition-all duration-300"
        width={1000}
        height={1000}
      />
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white z-10"
        aria-label="Next image"
      >
        <span className="text-2xl">&#8594;</span>
      </button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            className={`w-2 h-2 rounded-full ${i === current ? "bg-black" : "bg-gray-300"}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Product() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 p-8">
        {/* Left: Carousel */}
        <div className="flex flex-col justify-center">
          <Carousel images={product.images} />
        </div>
        {/* Right: Product Details */}
        <div className="flex flex-col justify-center">
          <h1 className="text-5xl font-serif italic mb-2">{product.title}</h1>
          <div className="uppercase tracking-widest text-sm text-gray-600 mb-1">{product.subcategory} — ${product.price}</div>
          <p className="text-gray-700 mb-6">{product.description}</p>
          <div className="flex items-center gap-2 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < product.rating ? "text-black" : "text-gray-300"}>&#9733;</span>
            ))}
            <a href="#reviews" className="ml-2 text-sm underline text-gray-700 hover:text-black">{product.reviews} Reviews</a>
          </div>
          <div className="flex flex-col gap-4 mt-8">
            <button className="bg-seafoam py-3 rounded-md font-semibold text-lg hover:bg-sunrise/50 transition">VIEW LIVE DEMO</button>
            <button className="border border-black text-black py-3 rounded-md font-semibold text-lg hover:bg-sunrise hover:text-white transition">ADD TO CART</button>
          </div>
        </div>
      </div>
    </div>
  );
}