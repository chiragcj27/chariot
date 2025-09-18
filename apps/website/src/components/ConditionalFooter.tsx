'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  const noFooterPaths = ['/login', '/signup', '/auth'];

  // Check if the current path is a kit page (starts with /kit/)
  const isKitPage = pathname.startsWith('/kit/');

  if (noFooterPaths.includes(pathname) || isKitPage) {
    return null;
  }

  return <Footer />;
}
