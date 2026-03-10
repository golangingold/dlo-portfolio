"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

interface HeroSectionProps {
  title: string;
  featuredPhoto?: string | null;
  blurDataUrl?: string | null;
}

export default function HeroSection({
  title,
  featuredPhoto,
  blurDataUrl,
}: HeroSectionProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  const characters = title.split("");

  return (
    <section
      ref={ref}
      className="relative h-screen w-full overflow-hidden flex items-center justify-center"
    >
      {/* Background image with parallax */}
      {featuredPhoto ? (
        <motion.div style={{ y: imageY }} className="absolute inset-0 -top-[10%] h-[120%]">
          <Image
            src={featuredPhoto}
            alt={title}
            fill
            className="object-cover object-top"
            sizes="100vw"
            priority
            placeholder={blurDataUrl ? "blur" : undefined}
            blurDataURL={blurDataUrl || undefined}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-background to-background" />
      )}

      {/* Hero text */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 text-center px-6"
      >
        <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.1em] sm:tracking-[0.2em] text-foreground mb-4 whitespace-nowrap">
          {characters.map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.3 + i * 0.04,
                ease: "easeOut",
              }}
              className="inline-block"
              style={{ whiteSpace: char === " " ? "pre" : undefined }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </h1>
        {/* Gold accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mx-auto mt-8 h-px w-20 bg-accent origin-center"
        />
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={20} className="text-muted" />
        </motion.div>
      </motion.div>
    </section>
  );
}
