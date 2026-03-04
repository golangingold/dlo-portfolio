import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PhotoGrid from "@/components/public/PhotoGrid";
import RevealOnScroll from "@/components/public/RevealOnScroll";
import Link from "next/link";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { category: slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return {};
  return {
    title: `${category.name} | Gallery | DeAngelo`,
    description: `${category.name} photography by DeAngelo.`,
  };
}

export default async function CategoryGalleryPage({ params }: Props) {
  const { category: slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const photos = await prisma.photo.findMany({
    where: { isPublished: true, categoryId: category.id },
    include: { category: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <main className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <RevealOnScroll>
          <Link href="/gallery" className="text-accent text-sm hover:text-accent-light transition-colors mb-4 inline-block">
            &larr; All Categories
          </Link>
          <h1 className="text-4xl md:text-5xl font-display tracking-wider mb-4">{category.name}</h1>
          {category.description && (
            <p className="text-muted mb-12 max-w-xl">{category.description}</p>
          )}
        </RevealOnScroll>

        <PhotoGrid
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
