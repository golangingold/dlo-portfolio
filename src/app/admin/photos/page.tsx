import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import PhotosGrid from "./PhotosGrid";

export const dynamic = "force-dynamic";

export default async function AdminPhotosPage() {
  const photos = await prisma.photo.findMany({
    include: { category: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Photos</h1>
          <p className="text-muted text-sm mt-1">Manage your portfolio photos</p>
        </div>
        <Link
          href="/admin/photos/new"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-background font-medium rounded-md px-4 py-2 text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Upload Photos
        </Link>
      </div>

      <PhotosGrid
        initialPhotos={photos.map((p) => ({
          id: p.id,
          title: p.title,
          thumbnailUrl: p.thumbnailUrl,
          url: p.url,
          isFeatured: p.isFeatured,
          isHero: p.isHero,
          isPublished: p.isPublished,
          category: { name: p.category.name },
        }))}
      />
    </div>
  );
}
