import { prisma } from "@/lib/prisma";
import HeroSection from "@/components/public/HeroSection";
import SectionHeading from "@/components/public/SectionHeading";
import RevealOnScroll from "@/components/public/RevealOnScroll";
import PhotoGrid from "@/components/public/PhotoGrid";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import SmoothScroll from "@/components/public/SmoothScroll";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

async function getHomeData() {
  const [settings, about, heroPhoto, featuredPhotos, primaryReel, contactInfo] =
    await Promise.all([
      prisma.siteSettings.findFirst(),
      prisma.about.findFirst(),
      // The one photo used as the full-screen hero background
      prisma.photo.findFirst({
        where: { isHero: true, isPublished: true },
        orderBy: { sortOrder: "asc" },
      }),
      // Photos shown in the "Selected Work" grid
      prisma.photo.findMany({
        where: { isFeatured: true, isPublished: true },
        include: { category: true },
        orderBy: { sortOrder: "asc" },
        take: 6,
      }),
      prisma.demoReel.findFirst({
        where: { isPrimary: true, isPublished: true },
      }),
      prisma.contactInfo.findFirst(),
    ]);

  return { settings, about, heroPhoto, featuredPhotos, primaryReel, contactInfo };
}

export default async function HomePage() {
  const { settings, about, heroPhoto, featuredPhotos, primaryReel, contactInfo } =
    await getHomeData();

  return (
    <SmoothScroll>
      <Navbar />

      {/* Hero Section */}
      <HeroSection
        title={settings?.heroTitle || "DEANGELO"}
        featuredPhoto={heroPhoto?.url}
        blurDataUrl={heroPhoto?.blurDataUrl}
      />

      {/* Featured Work */}
      {featuredPhotos.length > 0 && (
        <section className="py-24 md:py-32 px-6">
          <div className="mx-auto max-w-7xl">
            <SectionHeading title="Selected Work" subtitle="Featured Portfolio" />
            <PhotoGrid photos={featuredPhotos} columns={3} />
            <RevealOnScroll className="text-center mt-12">
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 text-accent text-sm uppercase tracking-[0.15em] hover:text-accent-light transition-colors group"
              >
                View Full Gallery
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </RevealOnScroll>
          </div>
        </section>
      )}

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* About Preview */}
      {about && (
        <section className="py-24 md:py-32 px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              {about.profileImageUrl ? (
                <RevealOnScroll direction="left">
                  <div className="aspect-[3/4] relative overflow-hidden rounded-sm">
                    <img
                      src={about.profileImageUrl}
                      alt="DeAngelo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </RevealOnScroll>
              ) : (
                <RevealOnScroll direction="left">
                  <div className="aspect-[3/4] bg-surface rounded-sm flex items-center justify-center">
                    <span className="font-display text-6xl text-dim tracking-[0.2em]">
                      D
                    </span>
                  </div>
                </RevealOnScroll>
              )}
              <RevealOnScroll direction="right">
                <h3 className="font-display text-sm uppercase tracking-[0.2em] text-accent mb-4">
                  About
                </h3>
                <p className="text-muted leading-relaxed">
                  {about.bio}
                </p>
              </RevealOnScroll>
            </div>
          </div>
        </section>
      )}

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Demo Reel */}
      {primaryReel && (
        <section className="py-24 md:py-32 px-6">
          <div className="mx-auto max-w-5xl">
            <SectionHeading title="Demo Reel" />
            <RevealOnScroll>
              <div className="aspect-video bg-surface rounded-sm overflow-hidden border border-border">
                <iframe
                  src={
                    primaryReel.videoType === "VIMEO"
                      ? `https://player.vimeo.com/video/${primaryReel.videoUrl.match(/vimeo\.com\/(\d+)/)?.[1]}`
                      : `https://www.youtube.com/embed/${primaryReel.videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]}`
                  }
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={primaryReel.title}
                />
              </div>
            </RevealOnScroll>
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section className="py-24 md:py-32 px-6 border-t border-border/50">
        <div className="mx-auto max-w-3xl text-center">
          <RevealOnScroll>
            <h3 className="font-display text-sm uppercase tracking-[0.2em] text-accent mb-4">
              Get in Touch
            </h3>
            <h2 className="font-display text-4xl md:text-5xl tracking-wider mb-6">
              Let&apos;s Work Together
            </h2>
            <p className="text-muted mb-10 max-w-xl mx-auto">
              Available for commercial, editorial, film, and runway work.
              Let&apos;s create something extraordinary.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-accent text-background px-8 py-3 rounded-md uppercase tracking-wider text-sm font-medium hover:bg-accent-light transition-colors"
            >
              Contact Me
            </Link>
          </RevealOnScroll>
        </div>
      </section>

      <Footer />
    </SmoothScroll>
  );
}
