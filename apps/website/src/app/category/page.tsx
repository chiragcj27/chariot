'use client';

import { useState } from "react";
import Footer from "@/components/Footer";

const subcategories = [
  "All",
  "Print Marketing",
  "Digital Marketing",
  "Promotional Materials",
  "Visual Production",
];

const cards = [
  {
    id: 1,
    title: "How To Pick The Right Typeface For Your Digital Product",
    subcategory: "Print Marketing",
    image: "https://placehold.co/600x400?text=Image+1",
  },
  {
    id: 2,
    title: "Why You Need a Brandbook Before Making a Website",
    subcategory: "Digital Marketing",
    image: "https://placehold.co/600x400?text=Image+2",
  },
  {
    id: 3,
    title: "How To Design A Website For Your Startup or Early Stage Digital Product",
    subcategory: "Promotional Materials",
    image: "https://placehold.co/600x400?text=Image+3",
  },
  {
    id: 4,
    title: "Motion Design in Modern Web Projects",
    subcategory: "Visual Production",
    image: "https://placehold.co/600x400?text=Image+4",
  },
  {
    id: 5,
    title: "Curious Case of Color Theory",
    subcategory: "Visual Production",
    image: "https://placehold.co/600x400?text=Image+5",
  },
  {
    id: 6,
    title: "Branding for Startups: What Matters?",
    subcategory: "Visual Production",
    image: "https://placehold.co/600x400?text=Image+6",
  },
];

export default function Category() {
  const [selected, setSelected] = useState("All");
  const filteredCards = selected === "All"
    ? cards
    : cards.filter(card => card.subcategory === selected);

  return (
    <div>
    <div className="px-8 py-12">
        {/* Category Description */}
        <div className="flex flex-col py-30">
            <h1 className="text-6xl font-secondary font-bold">We feature longreads on Marketing Service , <br /> <span className="text-sunrise">branding, and a lot more.</span></h1>
        </div>
      {/* Tabs */}
      {/* Dropdown for mobile */}
      <div className="mb-10 md:hidden">
        <select
          className="w-full border rounded px-3 py-2 text-lg"
          value={selected}
          onChange={e => setSelected(e.target.value)}
        >
          {subcategories.map(sub => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </div>
      {/* Horizontal tabs for desktop */}
      <div className="hidden md:flex space-x-8 border-b mb-10">
        {subcategories.map(sub => (
          <button
            key={sub}
            className={`pb-2 text-lg font-medium transition-colors duration-150 ${selected === sub ? "border-b-2 border-orange-500 text-orange-500" : "text-black hover:text-orange-500"}`}
            onClick={() => setSelected(sub)}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {filteredCards.map(card => (
          <div key={card.id} className="flex flex-col items-center">
            <img src={card.image} alt={card.title} className="w-full h-60 object-cover" />
            <div className="mt-2 w-full text-center">
              <span className="block font-semibold  truncate font-secondary">{card.title}</span>
            </div>
          </div>
        ))}
      </div>
      {/* TODO : Pagination */}

      {/* Footer */}
      </div>
      <Footer />
    </div>
  );
}