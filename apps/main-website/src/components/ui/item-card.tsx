"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ItemCardProps {
  imageUrl: string;
  title: string;
  description: string;
  href: string;
}

export function ItemCard({ imageUrl, title, description, href }: ItemCardProps) {
  return (
    <Link href={href} className="max-w-xs w-full group/card">
      <div
        className={cn(
          "cursor-pointer overflow-hidden relative card h-96 rounded-md shadow-xl max-w-sm mx-auto backgroundImage flex flex-col justify-end p-4"
        )}
        style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-black opacity-60"></div>
        <div className="text content opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
          <h1 className="font-bold text-xl md:text-2xl text-gray-50 relative z-10">
            {title}
          </h1>
          <p className="font-normal text-sm text-gray-50 relative z-10 my-4">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
