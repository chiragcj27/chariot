"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface SubscriptionCard {
  _id?: string;
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  button: string;
}

const bgMap: Record<string, string> = {
  Starter: "/starter.png",
  Pro: "/Pro.png",
  Elite: "/Elite.png",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function SubscriptionCards() {
  const [cards, setCards] = useState<SubscriptionCard[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/subscription-cards`)
      .then((res) => res.json())
      .then((data) => {
        // Sort cards by price (low to high)
        const sortedCards = data.sort((a: SubscriptionCard, b: SubscriptionCard) => {
          // Extract numeric value from price string (e.g., "$29" -> 29)
          const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
          const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
          return priceA - priceB;
        });
        setCards(sortedCards);
      });
  }, []);

  return (
    <section className="w-full min-h-screen bg-gradient-to-b from-white to-seafoam py-20 px-4">
      <div className="flex flex-col md:flex-row gap-8 items-center justify-center max-w-6xl mx-auto">
        {cards.map((card) => (
          <div
            key={card.title}
            className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-lg min-h-[540px] h-[540px]"
          >
            {/* Background Image */}
            <Image
              src={bgMap[card.title] || "/starter.png"}
              alt={card.title + " background"}
              fill
              className="object-cover z-0"
              priority
            />
            {/* Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col h-full w-full p-8">
              <div className="flex-1 flex flex-col">
                <h2 className="text-3xl font-balgin-regular mt-3 font-bold mb-2">{card.title}</h2>
                <div className="flex items-end mb-2">
                  <span className="text-2xl font-bold text-[#FA7035] font-balgin-regular mr-1">{card.price}</span>
                  <span className="text-base text-gray-500">{card.period}</span>
                </div>
                <div className="font-semibold text-[20px] text-gray-700 mb-4 text-center">{card.description}</div>
                <ul className="mb-8 space-y-2 text-gray-700">
                  {card.features.map((feature, i) => (
                    <li key={i} className="list-disc list-inside">{feature}</li>
                  ))}
                </ul>
              </div>
              <button className="mt-auto py-2 rounded-lg border-2 border-[#FA7035] text-primary font-semibold bg-[#FFC1A0] hover:bg-primary hover:text-white transition">
                {card.button}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
