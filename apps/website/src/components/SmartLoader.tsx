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

    // First visit - mark as visited and wait for full load
    sessionStorage.setItem('chariot-has-visited-session', 'true');
    
    const startTime = Date.now();
    const minLoadTime = 3000; // 3 seconds minimum
    let isFullyLoaded = false;
    
    function hideLoader() {
      if (cssLoader) {
        cssLoader.classList.add('hidden');
        // Remove from DOM after transition
        setTimeout(() => {
          cssLoader.remove();
        }, 500);
      }
    }
    
    function tryHideLoader() {
      const elapsedTime = Date.now() - startTime;
      
      if (isFullyLoaded && elapsedTime >= minLoadTime) {
        // Both conditions met: fully loaded AND minimum time passed
        hideLoader();
      } else if (isFullyLoaded) {
        // Website loaded but min time not reached - wait for remaining time
        const remainingTime = minLoadTime - elapsedTime;
        setTimeout(hideLoader, remainingTime);
      } else if (elapsedTime >= minLoadTime) {
        // Min time passed but not fully loaded - keep checking
        setTimeout(tryHideLoader, 100);
      } else {
        // Neither condition met - keep checking
        setTimeout(tryHideLoader, 100);
      }
    }
    
    // Check if website is fully loaded
    function checkIfFullyLoaded() {
      if (document.readyState === 'complete') {
        // Additional delay to ensure React has rendered
        setTimeout(() => {
          isFullyLoaded = true;
          tryHideLoader();
        }, 1000);
      } else {
        // Check again in 100ms
        setTimeout(checkIfFullyLoaded, 100);
      }
    }
    
    // Start checking
    checkIfFullyLoaded();
    
    // Fallback: hide after maximum 10 seconds regardless
    const fallbackTimeout = setTimeout(hideLoader, 10000);
    
    // Cleanup
    return () => {
      clearTimeout(fallbackTimeout);
    };
  }, []);

  return null; // This component doesn't render anything
}
