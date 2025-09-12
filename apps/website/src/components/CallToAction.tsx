"use client";

import React, { useState } from "react";
import CalendlyModal from "./CalendlyModal";

export default function CallToAction() {
  const [showCalendly, setShowCalendly] = useState(false);

  const handleSendMessage = () => {
    const email = process.env.NEXT_PUBLIC_MAIL_AT || 'contact@chariot.com';
    const subject = encodeURIComponent('Message from Chariot Website');
    const body = encodeURIComponent('Hello,\n\nI would like to get in touch with you.\n\nBest regards,');
    
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_self');
  };

  const handleBookConsultation = () => {
    setShowCalendly(true);
  };

  const closeCalendly = () => {
    setShowCalendly(false);
  };

  return (
    <section className="w-full lg:ml-3 pt-6 sm:pt-8 md:pt-10 lg:pt-11 xl:pt-12 mb-[clamp(2rem,5vw,4rem)]">
      <div className="px-5 sm:px-8 md:px-12 lg:px-16 xl:px-24 w-full flex">
        {/* Empty left column to match the sidebar width - only on large screens */}
        <div className="hidden [@media(min-width:1179px)]:block [@media(min-width:1179px)]:w-[33%] [@media(min-width:1179px)]:pr-6 xl:pr-12"></div>
        
        {/* Right column matching the content area on large screens, full width on smaller screens */}
        <div className="w-full [@media(min-width:1179px)]:max-w-[calc(33%-0.5rem)] [@media(min-width:1179px)]:w-[33%] ">
          <h1 className="mt-[clamp(2rem,6vw,3rem)] text-[clamp(1.5rem,3.75vw,2.25rem)] [@media(min-width:1179px)]:text-[clamp(1.25rem,2.5vw,2.75rem)] font-balgin-regular leading-[1.2] text-left">
            Let us create
            <br />
            <span className=" lg:whitespace-nowrap">something<span className="text-sunrise"> exceptional</span></span>
          </h1>
          <p className="mt-[clamp(1.5rem,4vw,2rem)] font-secondary text-[clamp(1rem,2.5vw,1.25rem)] leading-relaxed text-left">
          Whether you&apos;re refining a vision or starting from scratch — we&apos;re here to bring it to life.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-10 max-w-full">
            <button 
              onClick={handleSendMessage}
              className=" hover:bg-[#FFC1A0] border-2 hover:border-[#D94506] border-[#FCA17A] text-black px-2 py-2 rounded-md text-sm sm:text-base md:text-lg lg:text-base xl:text-base [@media(min-width:1400px)]:text-xl font-medium transition w-full"
            >
              Send us a message
            </button>
            <button 
              onClick={handleBookConsultation}
              className=" hover:bg-[#FFC1A0] border-2 hover:border-[#D94506] border-[#FCA17A] text-black px-2 py-2 rounded-md text-sm sm:text-base md:text-lg lg:text-base xl:text-base [@media(min-width:1400px)]:text-xl font-medium transition w-full"
            >
              Book a consultation
            </button>
          </div>
        </div>
      </div>

      <CalendlyModal
        isOpen={showCalendly}
        onClose={closeCalendly}
        title="Book a Consultation"
        subtitle="Let&apos;s discuss your jewelry business needs"
      />
    </section>
  );
}