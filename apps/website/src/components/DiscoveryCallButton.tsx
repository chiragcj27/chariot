"use client";

import React, { useState } from "react";
import CalendlyModal from "./CalendlyModal";

interface DiscoveryCallButtonProps {
  className?: string;
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DiscoveryCallButton({ 
  className = "bg-white text-lg  border-2 rounded-md border-[#FCA17A] px-6 py-2 rounded transition-colors hover:bg-[#FCA17A]/70 focus:outline-none focus:ring-2 focus:ring-[#FCA17A]/40",
  children = "Discovery Call",
  title = "Book a Discovery Call",
  subtitle = "Let&apos;s explore how we can help your jewelry business grow"
}: DiscoveryCallButtonProps) {
  const [showCalendly, setShowCalendly] = useState(false);

  const handleClick = () => {
    setShowCalendly(true);
  };

  const closeCalendly = () => {
    setShowCalendly(false);
  };

  return (
    <>
      <button 
        onClick={handleClick}
        className={className}
      >
        {children}
      </button>
      
      <CalendlyModal
        isOpen={showCalendly}
        onClose={closeCalendly}
        title={title}
        subtitle={subtitle}
      />
    </>
  );
}
