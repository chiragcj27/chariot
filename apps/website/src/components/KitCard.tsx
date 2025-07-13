"use client";

import { useState } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import Image from 'next/image';
import Link from 'next/link';

interface KitImage {
  _id: string;
  url: string;
  originalname: string;
}

interface Kit {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: KitImage;
  onHoverImage?: KitImage;
  mainImage?: KitImage;
  carouselImages?: KitImage[];
}

interface KitCardProps {
  kit: Kit;
}

export default function KitCard({ kit }: KitCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const thumbnailUrl = kit.thumbnail?.url || kit.mainImage?.url || '/temp.png';
  const hoverUrl = kit.onHoverImage?.url || kit.mainImage?.url || thumbnailUrl;

  return (
    <Link href={`/kit/${kit.slug}`} className="block" prefetch={false}>
      <div 
        className="group cursor-pointer transition-all duration-300 hover:scale-105"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden bg-gray-100">
          <AspectRatio ratio={16 / 10} className="bg-gray-100">
            <Image
              src={isHovered ? hoverUrl : thumbnailUrl}
              alt={kit.title}
              className="h-full w-full object-cover transition-all duration-300"
              width={1000}
              height={1000}
            />
          </AspectRatio>
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
        </div>
        
        <div className="mt-4 space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-sunrise transition-colors duration-300">
            {kit.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {kit.description}
          </p>
        </div>
      </div>
    </Link>
  );
} 