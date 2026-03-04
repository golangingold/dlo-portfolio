"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
  priority?: boolean;
  blurDataURL?: string;
}

export default function ParallaxImage({
  src,
  alt,
  className,
  speed = 0.15,
  priority = false,
  blurDataURL,
}: ParallaxImageProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-100 * speed, 100 * speed]);

  return (
    <div ref={ref} className={cn("overflow-hidden relative", className)}>
      <motion.div style={{ y }} className="relative w-full h-[115%] -top-[7.5%]">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={priority}
          placeholder={blurDataURL ? "blur" : undefined}
          blurDataURL={blurDataURL}
        />
      </motion.div>
    </div>
  );
}
