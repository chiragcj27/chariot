import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  return (
    <nav className={cn("flex items-center space-x-2 text-sm", className)}>
      <Link 
        href="/" 
        className="text-navy-600 hover:text-navy-900 dark:text-blue-100 dark:hover:text-blue-200 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={item.href}>
          <ChevronRight className="h-4 w-4 text-navy-400 dark:text-blue-100" />
          {index === items.length - 1 ? (
            <span className="text-navy-900 font-medium dark:text-blue-100">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="text-navy-600 hover:text-navy-900 transition-colors"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}; 