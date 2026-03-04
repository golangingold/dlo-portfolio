"use client";

import { useState } from "react";
import PhotoGrid from "@/components/public/PhotoGrid";
import CategoryFilter from "@/components/public/CategoryFilter";

interface Photo {
  id: string;
  title: string | null;
  url: string;
  thumbnailUrl: string | null;
  blurDataUrl: string | null;
  width: number;
  height: number;
  category: { name: string; slug: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function GalleryClient({
  photos,
  categories,
}: {
  photos: Photo[];
  categories: Category[];
}) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const filtered = activeSlug
    ? photos.filter((p) => p.category?.slug === activeSlug)
    : photos;

  return (
    <>
      <CategoryFilter
        categories={categories}
        activeSlug={activeSlug}
        onSelect={setActiveSlug}
      />
      <PhotoGrid photos={filtered} columns={3} />
    </>
  );
}
