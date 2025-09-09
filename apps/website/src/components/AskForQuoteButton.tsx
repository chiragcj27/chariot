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
  className = "bg-[#DF9999] text-[clamp(1rem,2.2vw,1.125rem)] font-secondary font-semibold px-[clamp(1rem,3vw,1.5rem)] py-[clamp(0.5rem,1.5vw,0.75rem)] rounded transition-colors hover:bg-[#DF9999]/70 focus:outline-none focus:ring-2 focus:ring-[#DF9999]/40 w-full sm:w-auto min-w-[120px]",
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
