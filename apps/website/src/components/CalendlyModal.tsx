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
  const [widgetInitialized, setWidgetInitialized] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && !widgetInitialized) {
      // Wait for Calendly to be available and then initialize
      const initCalendly = () => {
        const widgetElement = document.getElementById('calendly-widget');
        if (window.Calendly && widgetElement) {
          // Check if widget is already initialized to prevent duplicates
          const existingWidget = widgetElement.querySelector('[data-calendly-widget]');
          if (!existingWidget) {
            try {
              window.Calendly.initInlineWidget({
                url: 'https://calendly.com/chiragcj27-work/30min?primary_color=fca17a',
                parentElement: widgetElement,
                prefill: {},
                utm: {}
              });
              setWidgetInitialized(true);
            } catch (error) {
              console.warn('Failed to initialize Calendly widget:', error);
            }
          }
        } else if (!window.Calendly) {
          // If Calendly is not loaded yet, wait a bit and try again
          setTimeout(initCalendly, 100);
        }
      };
      
      initCalendly();
    }
  }, [isOpen, widgetInitialized]);

  // Reset widget initialization when modal closes
  useEffect(() => {
    if (!isOpen) {
      setWidgetInitialized(false);
      // Clean up any existing Calendly widgets
      const widgetElement = document.getElementById('calendly-widget');
      if (widgetElement && typeof window !== 'undefined' && window.Calendly) {
        try {
          // Clear the widget content safely
          const existingWidget = widgetElement.querySelector('[data-calendly-widget]');
          if (existingWidget && existingWidget.parentNode) {
            existingWidget.parentNode.removeChild(existingWidget);
          }
        } catch (error) {
          console.warn('Failed to cleanup Calendly widget:', error);
        }
      }
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-[clamp(0.5rem,2vw,1rem)]" style={{ zIndex: 999999 }}>
      <div className="bg-white rounded-2xl w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] xl:max-w-[75vw] 2xl:max-w-5xl h-[clamp(85vh,90vh,95vh)] flex flex-col relative shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="bg-[#CFDAE9] px-[clamp(1rem,3vw,1.5rem)] py-[clamp(1rem,2.5vw,1.25rem)] flex items-center justify-between flex-shrink-0 rounded-t-2xl">
          <div className="flex-1 min-w-0">
            <h2 className="text-[clamp(1.25rem,3vw,1.5rem)] md:text-[clamp(1.5rem,3.5vw,2rem)] font-balgin-regular text-black truncate">{title}</h2>
            <p className="text-black/80 font-secondary text-[clamp(0.75rem,2vw,0.875rem)] mt-1 line-clamp-2">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 rounded-full p-[clamp(0.5rem,1.5vw,0.75rem)] text-black hover:text-black/80 transition-all duration-200 backdrop-blur-sm ml-[clamp(0.5rem,2vw,1rem)] flex-shrink-0"
          >
            <svg className="w-[clamp(1.25rem,2.5vw,1.5rem)] h-[clamp(1.25rem,2.5vw,1.5rem)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Widget Container */}
        <div className="flex-1 p-[clamp(0.75rem,2.5vw,1.5rem)] overflow-hidden">
          <div 
            id="calendly-widget"
            className="rounded-xl overflow-hidden shadow-lg border border-gray-100 w-full h-full"
            style={{ 
              minWidth: '280px', 
              minHeight: 'clamp(400px, 60vh, 600px)',
              height: '100%'
            }}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
