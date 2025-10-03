"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import SubscriptionCheckout from "./SubscriptionCheckout";

interface SubscriptionCard {
  _id?: string;
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  button: string;
  paypalPlanId: string;
  planKey: string;
  credits: number;
}

const bgMap: Record<string, string> = {
  Starter: "/starter.png",
  Pro: "/Pro.png",
  Elite: "/Elite.png",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function SubscriptionCards() {
  const { user } = useAuth();
  const [cards, setCards] = useState<SubscriptionCard[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionCard | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/subscription-cards`)
      .then((res) => res.json())
      .then((data) => {
        // Sort cards by price (low to high)
        const sortedCards = data.sort((a: SubscriptionCard, b: SubscriptionCard) => {
          // Extract numeric value from price string (e.g., "$29" -> 29)
          const priceA = parseFloat(String(a.price || "0").replace(/[^0-9.]/g, ''));
          const priceB = parseFloat(String(b.price || "0").replace(/[^0-9.]/g, ''));
          return priceA - priceB;
        });
        setCards(sortedCards);
      });
  }, []);

  const handleSubscribe = (plan: SubscriptionCard) => {
    if (!user) {
      // Redirect to login page
      window.location.href = '/login';
      return;
    }
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (subscriptionId: string, newCredits: number) => {
    setSuccessMessage(`Successfully subscribed! You now have ${newCredits} credits.`);
    setShowSuccess(true);
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  return (
    <section className="w-full bg-gradient-to-b from-white to-seafoam px-4 pt-14 sm:pt-16 md:pt-16 lg:pt-12 xl:pt-10 2xl:pt-8 pb-10 sm:pb-12 md:pb-14 min-h-screen md:min-h-0">
      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successMessage}
          </div>
        </div>
      )}

      <div className="flex flex-col [@media(min-width:1179px)]:flex-row gap-8 items-center justify-center max-w-8xl [@media(min-width:1179px)]:max-w-6xl px-3 [@media(min-width:420px)]:mx-auto">
        {cards.map((card) => (
          <div
            key={card.title}
            className="relative w-full max-w-sm sm:max-w-md md:max-w-lg rounded-3xl overflow-hidden shadow-lg min-h-[580px] sm:min-h-[540px] h-[540px]"
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
            <div className="absolute inset-0 z-10 flex flex-col h-full p-8">
              <div className="flex-1 flex w-full flex-col">
                <h2 className="text-3xl font-balgin-regular mt-3 font-bold mb-2">{card.title}</h2>
                <div className="flex items-end mb-2">
                  <span className="text-2xl font-bold text-[#FA7035] font-secondary mr-1">${card.price}</span>
                  <span className="text-base text-gray-500">{card.period}</span>
                </div>
                <div className="font-semibold text-[clamp(0.70rem,2vw,1.15rem)] text-gray-700 mb-4 text-center">{card.description}</div>
                <ul className="mb-8 space-y-2 text-gray-700">
                  {card.features.map((feature, i) => (
                    <li key={i} className="list-disc list-inside">{feature}</li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={() => handleSubscribe(card)}
                className="mt-auto w-[50%] mx-auto py-1 rounded-lg border-2 bg-white border-[#FA7035] text-primary  hover:bg-[#FFC1A0] hover:border-3">
                {card.button}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Subscription Checkout Modal */}
      {selectedPlan && (
        <SubscriptionCheckout
          plan={selectedPlan}
          isOpen={showCheckout}
          onClose={() => {
            setShowCheckout(false);
            setSelectedPlan(null);
          }}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </section>
  );
}
