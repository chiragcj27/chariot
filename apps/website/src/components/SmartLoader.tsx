'use client';

import { useEffect } from 'react';

export default function SmartLoader() {
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('chariot-has-visited-session');
    const cssLoader = document.getElementById('css-loader');
    
    if (hasVisited) {
      // Hide loader immediately for returning visitors
      if (cssLoader) {
        cssLoader.style.display = 'none';
      }
      return;
    }

    // First visit - mark as visited
    sessionStorage.setItem('chariot-has-visited-session', 'true');
    
    function hideLoader() {
      if (cssLoader) {
        cssLoader.classList.add('hidden');
        setTimeout(() => {
          if (cssLoader && cssLoader.parentNode) {
            cssLoader.remove();
          }
        }, 500);
      }
    }
    
    // Check if website is fully loaded
    function checkIfFullyLoaded() {
      if (document.readyState === 'complete') {
        // Hide immediately when loaded - no artificial delays
        setTimeout(() => {
          hideLoader();
        }, 300); // Just enough for smooth transition
      } else {
        setTimeout(checkIfFullyLoaded, 50);
      }
    }
    
    // Start checking
    checkIfFullyLoaded();
    
    // Fallback: hide after maximum 5 seconds regardless
    setTimeout(hideLoader, 5000);
  }, []);

  return null;
}