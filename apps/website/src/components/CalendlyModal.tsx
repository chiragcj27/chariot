"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

// Declare Calendly global
declare global {
  interface Window {
    Calendly: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement | null;
        prefill: Record<string, unknown>;
        utm: Record<string, unknown>;
      }) => void;
    };
  }
}

interface CalendlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export default function CalendlyModal({ 
  isOpen, 
  onClose, 
  title = "Book a Consultation",
  subtitle = "Let&apos;s discuss your jewelry business needs"
}: CalendlyModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      // Wait for Calendly to be available and then initialize
      const initCalendly = () => {
        if (window.Calendly) {
          window.Calendly.initInlineWidget({
            url: 'https://calendly.com/chiragcj27-work/30min?primary_color=fca17a',
            parentElement: document.getElementById('calendly-widget'),
            prefill: {},
            utm: {}
          });
        } else {
          // If Calendly is not loaded yet, wait a bit and try again
          setTimeout(initCalendly, 100);
        }
      };
      
      initCalendly();
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
      <div className="bg-white rounded-2xl max-w-5xl w-full h-[95vh] flex flex-col relative shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FFC1A0] to-[#FCA17A] px-6 py-4 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-balgin-regular text-black">{title}</h2>
            <p className="text-black/80 font-secondary text-sm mt-1">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 text-black hover:text-black/80 transition-all duration-200 backdrop-blur-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Widget Container */}
        <div className="flex-1 p-6 overflow-hidden">
          <div 
            id="calendly-widget"
            className="rounded-xl overflow-hidden shadow-lg border border-gray-100 w-full h-full"
            style={{ minWidth: '320px', minHeight: '600px' }}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
