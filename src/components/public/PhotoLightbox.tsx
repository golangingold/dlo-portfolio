"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Photo {
  id: string;
  title?: string | null;
  url: string;
  width: number;
  height: number;
  category?: { name: string } | null;
}

interface PhotoLightboxProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function PhotoLightbox({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}: PhotoLightboxProps) {
  const photo = photos[currentIndex];

  const goNext = useCallback(() => {
    onNavigate((currentIndex + 1) % photos.length);
  }, [currentIndex, photos.length, onNavigate]);

  const goPrev = useCallback(() => {
    onNavigate((currentIndex - 1 + photos.length) % photos.length);
  }, [currentIndex, photos.length, onNavigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, goNext, goPrev]);

  if (!photo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X size={28} />
        </button>

        {/* Counter */}
        <div className="absolute top-6 left-6 text-white/50 text-sm tracking-wider">
          {currentIndex + 1} / {photos.length}
        </div>

        {/* Previous */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-10 p-2"
          aria-label="Previous"
        >
          <ChevronLeft size={36} />
        </button>

        {/* Image */}
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-[90vw] max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={photo.url}
            alt={photo.title || "Portfolio photo"}
            width={photo.width}
            height={photo.height}
            className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
            sizes="90vw"
            priority
          />
          {photo.title && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-white text-sm">{photo.title}</p>
              {photo.category && (
                <p className="text-accent text-xs uppercase tracking-wider mt-1">
                  {photo.category.name}
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Next */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-10 p-2"
          aria-label="Next"
        >
          <ChevronRight size={36} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
