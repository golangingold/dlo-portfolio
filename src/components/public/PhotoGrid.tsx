"use client";

import { useState } from "react";
import Masonry from "react-masonry-css";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import PhotoLightbox from "./PhotoLightbox";

interface Photo {
  id: string;
  title?: string | null;
  description?: string | null;
  url: string;
  thumbnailUrl?: string | null;
  blurDataUrl?: string | null;
  width: number;
  height: number;
  category?: { name: string; slug: string } | null;
}

interface PhotoGridProps {
  photos: Photo[];
  className?: string;
  columns?: 2 | 3 | 4;
}

const breakpointCols = {
  2: { default: 2, 640: 1 },
  3: { default: 3, 1024: 3, 640: 2, 0: 1 },
  4: { default: 4, 1280: 4, 1024: 3, 640: 2, 0: 1 },
};

export default function PhotoGrid({
  photos,
  className,
  columns = 3,
}: PhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <Masonry
        breakpointCols={breakpointCols[columns]}
        className={cn("flex gap-4", className)}
        columnClassName="flex flex-col gap-4"
      >
        <AnimatePresence mode="popLayout">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group cursor-pointer"
              onClick={() => setLightboxIndex(index)}
            >
              <div className="relative overflow-hidden rounded-sm">
                <Image
                  src={photo.thumbnailUrl || photo.url}
                  alt={photo.description || photo.title || "Portfolio photo"}
                  width={photo.width}
                  height={photo.height}
                  className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  placeholder={photo.blurDataUrl ? "blur" : undefined}
                  blurDataURL={photo.blurDataUrl || undefined}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div>
                    {photo.title && (
                      <p className="text-foreground text-sm font-medium">
                        {photo.title}
                      </p>
                    )}
                    {photo.category && (
                      <p className="text-accent text-xs uppercase tracking-wider">
                        {photo.category.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </Masonry>

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
