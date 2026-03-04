"use client";

import RevealOnScroll from "./RevealOnScroll";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center";
}

export default function SectionHeading({
  title,
  subtitle,
  className,
  align = "center",
}: SectionHeadingProps) {
  return (
    <RevealOnScroll className={cn("mb-12 md:mb-16", className)}>
      <div className={align === "center" ? "text-center" : ""}>
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-[0.15em] uppercase text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-muted text-sm md:text-base tracking-wider uppercase">
            {subtitle}
          </p>
        )}
        <div
          className={cn(
            "mt-6 h-px w-16 bg-accent",
            align === "center" ? "mx-auto" : ""
          )}
        />
      </div>
    </RevealOnScroll>
  );
}
