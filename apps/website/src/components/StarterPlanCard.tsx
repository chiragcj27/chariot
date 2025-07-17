"use client";
import React from "react";

interface StarterPlanCardProps {
  title: string;
  price: string;
  features: string[];
  buttonText: string;
  onButtonClick?: () => void;
}

const StarterPlanCard: React.FC<StarterPlanCardProps> = ({
  title,
  price,
  features,
  buttonText,
  onButtonClick,
}) => {
  return (
    <div className="w-80 h-[500px] rounded-3xl bg-[#fde4db] relative overflow-hidden shadow-lg p-6 flex flex-col justify-between">
      {/* Background Decorations */}
      <div className="absolute z-1 -top-50 -right-33 w-[450px] h-[450px] rounded-full bg-gradient-to-b from-[#FCA17A] to-[#F6D1C2] pointer-events-none" />
      <div className="absolute z-1 -bottom-50 -right-33 w-[450px] h-[450px] rounded-full bg-gradient-to-t from-[#FCA17A] to-[#F6D1C2] pointer-events-none" />
      <div className="absolute  -top-50 -right-40 w-[250px] h-[500px] bg-[#F6D1C2] pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none z-0"></div>

      {/* Content */}
      <div className="relative hidden z-10 text-center text-white">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-5xl font-extrabold mt-2">{price}</p>
        <p className="text-sm mt-1">per month</p>
      </div>

      <ul className="relative hidden z-10 text-white text-sm mt-4 space-y-2">
        {features.map((feature, index) => (
          <li key={index}>✔ {feature}</li>
        ))}
      </ul>

      <button
        className="relative hidden z-10 bg-purple-600 hover:bg-purple-700 text-white mt-6 py-2 rounded-xl font-semibold"
        onClick={onButtonClick}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default StarterPlanCard;
