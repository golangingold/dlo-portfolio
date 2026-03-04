import { prisma } from "@/lib/prisma";
import RevealOnScroll from "@/components/public/RevealOnScroll";
import GalleryClient from "./GalleryClient";

export const metadata = {
  title: "Gallery | DeAngelo",
  description: "Browse DeAngelo's professional portfolio — headshots, editorial, commercial, and lifestyle photography.",
};

export default async function GalleryPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const photos = await prisma.photo.findMany({
    where: { isPublished: true },
    include: { category: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <main className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <RevealOnScroll>
          <h1 className="text-4xl md:text-5xl font-display tracking-wider text-center mb-4">Gallery</h1>
          <p className="text-muted text-center mb-12 max-w-xl mx-auto">
            Professional portfolio showcasing headshots, editorial, commercial, and lifestyle work.
          </p>
        </RevealOnScroll>

        <GalleryClient
          categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
          photos={photos.map((p) => ({
            id: p.id,
            title: p.title,
            url: p.url,
            thumbnailUrl: p.thumbnailUrl,
            blurDataUrl: p.blurDataUrl,
            width: p.width,
            height: p.height,
            category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
          }))}
        />
      </div>
    </main>
  );
}
