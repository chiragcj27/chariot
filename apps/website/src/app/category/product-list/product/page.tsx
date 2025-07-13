'use client';
import React from "react";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";

// Flipbook Embed Component
const FlipbookEmbed = ({ 
  flipbookUrl, 
  width = "100%", 
  height = "600px",
  title = "Product Catalog"
}: {
  flipbookUrl: string;
  width?: string;
  height?: string;
  title?: string;
}) => {
  return (
    <div className="w-full bg-sunrise/30 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="relative w-full rounded-lg overflow-hidden shadow-lg">
          <iframe
            src={flipbookUrl}
            width={width}
            height={height}
            frameBorder="0"
            allowFullScreen
            className="w-full"
            title={title}
          />
        </div>
      </div>
    </div>
  );
};

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
  // Add flipbook URL to product data
  flipbookUrl: "https://heyzine.com/flipbook/your-flipbook-id", // Replace with actual Heyzine URL
};

export default function Product() {
  return (
    <>
      <div className="min-h-screen  flex items-center justify-center py-12 px-4">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 p-8">
          {/* Left: Flipbook (replacing Carousel) */}
          <div className="flex flex-col justify-center">
            <FlipbookEmbed 
              flipbookUrl={"https://heyzine.com/flip-book/9ed613b90d.html"}
              title={`${product.title} - Interactive Catalog`}
              height="600px"
            />
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
              <button className="bg-seafoam py-3 rounded-md font-semibold text-lg hover:bg-sunrise/50 transition font-secondary">Call for Enquiry</button>
              <button className="border border-black text-black py-3 rounded-md font-semibold text-lg hover:bg-sunrise hover:text-white transition font-secondary">Add to Cart</button>
            </div>
          </div>
        </div>
      </div>
      {/* What's Included Section */}
      <div className="w-full bg-seafoam py-10 flex flex-col items-center">
        <div className="w-full max-w-5xl">
          <div className="px-4 py-2 rounded mb-6 text-3xl font-medium text-left w-fit">What&apos;s Included ?</div>
          <div className="bg-gray-200 px-8 py-8 rounded text-lg font-secondary text-gray-800">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s.
          </div>
        </div>
      </div>
      {/* Flipbook Section - Moved to main product area */}
      {/* <FlipbookEmbed 
        flipbookUrl={"https://heyzine.com/flip-book/b80a5cee1b.html"}
        title={`${product.title} - Interactive Catalog`}
        height="700px"
      /> */}
      {/* Related Products Section */}
      <div className="w-full flex flex-col items-center py-10">
        <div className="w-full max-w-5xl">
          <div className="px-4 py-2 rounded mb-6 text-4xl text-sunrise font-bold text-center w-fit mx-auto">Related Products</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[1,2,3,4].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <ProductCard
                  image={`https://placehold.co/400x500?text=Product+${i+1}`}
                  className="w-full"
                />
                <button className="bg-sunrise/50 mt-2 py-3 w-full rounded text-center font-medium">Add To Cart</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}