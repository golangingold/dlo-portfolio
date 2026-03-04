"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeSlug: string | null;
  onSelect: (slug: string | null) => void;
}

export default function CategoryFilter({
  categories,
  activeSlug,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-10">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "relative px-5 py-2 text-xs uppercase tracking-[0.15em] rounded-full transition-colors",
          activeSlug === null
            ? "text-background"
            : "text-muted hover:text-foreground"
        )}
      >
        {activeSlug === null && (
          <motion.span
            layoutId="category-bg"
            className="absolute inset-0 bg-accent rounded-full"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <span className="relative z-10">All</span>
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.slug)}
          className={cn(
            "relative px-5 py-2 text-xs uppercase tracking-[0.15em] rounded-full transition-colors",
            activeSlug === cat.slug
              ? "text-background"
              : "text-muted hover:text-foreground"
          )}
        >
          {activeSlug === cat.slug && (
            <motion.span
              layoutId="category-bg"
              className="absolute inset-0 bg-accent rounded-full"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{cat.name}</span>
        </button>
      ))}
    </div>
  );
}
