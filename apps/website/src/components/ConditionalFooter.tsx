'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  const noFooterPaths = ['/login', '/signup', '/auth'];

  if (noFooterPaths.includes(pathname)) {
    return null;
  }

  return <Footer />;
}
