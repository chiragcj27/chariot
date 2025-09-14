"use client";

import React from "react";

interface AskForQuoteButtonProps {
  className?: string;
  children?: React.ReactNode;
  productName?: string;
  productType?: string;
  customSubject?: string;
  customBody?: string;
}

export default function AskForQuoteButton({ 
  className = "bg-white text-lg  border-2 rounded-md border-[#FCA17A] px-6 py-2 rounded transition-colors hover:bg-[#FCA17A]/70 focus:outline-none focus:ring-2 focus:ring-[#FCA17A]/40",
  children = "Ask For Quote",
  productName = "",
  productType = "product",
  customSubject,
  customBody
}: AskForQuoteButtonProps) {
  
  const handleAskForQuote = () => {
    const email = process.env.NEXT_PUBLIC_MAIL_AT || 'contact@chariot.com';
    
    // Default subject and body
    const defaultSubject = `Quote Request for ${productName ? `${productName} ` : ''}${productType}`;
    const defaultBody = `Hello Chariot Team,

I'm interested in getting a quote for ${productName ? `the ${productName} ` : `a ${productType}`}.

Please provide me with:
- Pricing details
- Timeline for delivery
- Customization options available
- Any additional information I should know

Thank you for your time.

Best regards,
[Your Name]`;

    const subject = customSubject || defaultSubject;
    const body = customBody || defaultBody;
    
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    
    window.open(`mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`, '_self');
  };

  return (
    <button 
      onClick={handleAskForQuote}
      className={className}
    >
      {children}
    </button>
  );
}
