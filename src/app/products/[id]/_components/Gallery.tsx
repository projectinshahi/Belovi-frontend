"use client";

import { useState } from "react";
import Image from "next/image";
import { cldOptimize } from "../../../../lib/image";

interface GalleryProps {
  images: string[];
  name: string;
}

export default function Gallery({ images, name }: GalleryProps) {
  const [active, setActive] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <div className="flex flex-col gap-4 lg:max-w-[650px] sticky top-28">
      {/* Main frame */}
      <div 
        className={`relative w-full aspect-square overflow-hidden bg-[#1a1a1a]/5 cursor-${isZoomed ? 'zoom-out' : 'zoom-in'}`}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setIsZoomed(!isZoomed)}
      >
        {images.length === 0 && (
          <div className="flex h-full w-full items-center justify-center">
            <span className="select-none font-display text-sm uppercase tracking-[0.4em] text-[#1a1a1a]/25">
              BELOVI
            </span>
          </div>
        )}
        {images.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
              i === active ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={cldOptimize(src, 1500)}
              alt={i === active ? `${name} — view ${i + 1}` : ""}
              aria-hidden={i !== active}
              fill
              sizes="(max-width: 1024px) 100vw, 650px"
              priority={i === 0}
              unoptimized
              className={`object-cover transition-transform duration-200 ease-out`}
              style={isZoomed && i === active ? {
                transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                transform: 'scale(2.5)'
              } : {}}
            />
          </div>
        ))}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          className="hide-scrollbar flex gap-4 overflow-x-auto pb-2"
          role="group"
          aria-label="Product images"
        >
          {images.map((src, i) => (
            <button
              key={`${src}-thumb-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-current={i === active}
              className={`relative h-[100px] w-[100px] shrink-0 cursor-pointer overflow-hidden bg-[#1a1a1a]/5 transition-all duration-300 ${
                i === active
                  ? "border border-[#1a1a1a] opacity-100 ring-1 ring-[#1a1a1a]/20 ring-offset-2"
                  : "border border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={cldOptimize(src, 300)}
                alt=""
                aria-hidden
                fill
                sizes="100px"
                unoptimized
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
