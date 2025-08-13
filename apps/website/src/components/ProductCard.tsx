'use client'
import Image from "next/image";

interface ProductCardProps {
  title?: string;
  subtitle?: string;
  image: string;
  onHoverImage?: string;
  className?: string;
  aspectRatio?: number; // New prop for aspect ratio (width/height)
  onClick?: () => void; // New prop for click handler
}

export default function ProductCard({ 
  title, 
  subtitle, 
  image, 
  onHoverImage, 
  className = "",
  aspectRatio = 4/5, // Default aspect ratio (slightly taller than wide)
  onClick
}: ProductCardProps) {
  return (
    <div 
      className={`flex flex-col items-center ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div 
        className="relative w-full rounded shadow-md overflow-hidden group"
        style={{ 
          aspectRatio: aspectRatio,
          height: 'auto'
        }}
      >
        <Image
          src={image}
          alt={title || 'Product Image'}
          fill
          className="object-cover transition-opacity duration-300 group-hover:opacity-0"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {onHoverImage && (
          <Image
            src={onHoverImage}
            alt={`${title || 'Product Image'} on hover`}
            fill
            className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              e.currentTarget.src = image;
            }}
          />
        )}
      </div>
      {(title || subtitle) && (
        <div className="w-full text-center mt-6">
          <span className="block text-2xl font-secondary font-semibold mb-2">{title}</span>
          {subtitle && (
            <span className="block text-lg font-primary text-black/70">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
} 