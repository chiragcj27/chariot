import Image from "next/image";

interface ProductCardProps {
  title: string;
  subtitle?: string;
  image: string;
  onHoverImage?: string;
  className?: string;
}

export default function ProductCard({ 
  title, 
  subtitle, 
  image, 
  onHoverImage, 
  className = "" 
}: ProductCardProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative w-full h-[350px] rounded shadow-md mb-6 overflow-hidden group">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-opacity duration-300 group-hover:opacity-0"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {onHoverImage && (
          <Image
            src={onHoverImage}
            alt={`${title} on hover`}
            fill
            className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              e.currentTarget.src = image;
            }}
          />
        )}
      </div>
      <div className="w-full text-center">
        <span className="block text-2xl font-secondary font-semibold mb-2">{title}</span>
        {subtitle && (
          <span className="block text-lg font-primary text-black/70">{subtitle}</span>
        )}
      </div>
    </div>
  );
} 