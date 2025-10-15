import { useState, useEffect } from 'react';

export function useScrollDetection(threshold: number = 100) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const getScrollTop = () => {
      if (typeof window === 'undefined') return 0;
      // Support different scroll containers/environments
      return (
        (document.scrollingElement ? document.scrollingElement.scrollTop : 0) ||
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0
      );
    };

    const update = () => {
      ticking = false;
      const scrollTop = getScrollTop();
      setIsScrolled(scrollTop > threshold);
    };

    const onScrollOrResize = () => {
      if (!ticking) {
        ticking = true;
        // Use rAF to coalesce rapid events
        requestAnimationFrame(update);
      }
    };

    // Initialize immediately on mount
    update();

    // Listen to multiple targets to handle custom scroll containers
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    document.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });
    window.addEventListener('orientationchange', onScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      document.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('orientationchange', onScrollOrResize);
    };
  }, [threshold]);

  return isScrolled;
}
