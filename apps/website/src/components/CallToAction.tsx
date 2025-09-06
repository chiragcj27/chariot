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
    <section className="w-full flex flex-col items-center justify-center relative px-5 md:px-10 lg:px-20 mb-10">
      <div className="flex flex-col w-[1/3] items-center justify-center mt-12">
        <h1 className="text-[32px] md:text-[40px] font-balgin-regular">
          Let us create
          <br />
          something<span className="text-sunrise"> exceptional</span>
        </h1>
        <p className="mt-8 px-13 font-secondary text-[20px] max-w-xl">
        Whether you&apos;re refining a vision or starting from scratch — we&apos;re here to bring it to life.
        </p>
        <div className="flex flex-col md:flex-row gap-6 mt-10 -translate-x-3">
          <button 
            onClick={handleSendMessage}
            className="bg-[#FFC1A0] hover:bg-[#FFC1A0]/20 border-2 border-[#D94506] text-black px-5 py-2 rounded-4xl text-xl font-medium transition"
          >
            Send us a message
          </button>
          <button 
            onClick={handleBookConsultation}
            className="bg-[#FFC1A0] hover:bg-[#FFC1A0]/20 border-2 border-[#D94506] text-black px-5 py-2 rounded-4xl text-xl font-medium transition"
          >
            Book a consultation
          </button>
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