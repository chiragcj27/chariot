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
      // Redirect to login or show login modal
      alert('Please log in to subscribe');
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
    <section className="w-full min-h-screen bg-gradient-to-b from-white to-seafoam py-20 px-4">
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
              <button 
                onClick={() => handleSubscribe(card)}
                className="mt-auto py-2 rounded-lg border-2 border-[#FA7035] text-primary font-semibold bg-[#FFC1A0] hover:bg-primary hover:text-white transition"
              >
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
