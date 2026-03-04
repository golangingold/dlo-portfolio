import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Star, ImageOff } from "lucide-react";
import { DeletePhotoButton } from "./DeletePhotoButton";

export default async function AdminPhotosPage() {
  const photos = await prisma.photo.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Photos
          </h1>
          <p className="text-muted text-sm mt-1">
            Manage your portfolio photos
          </p>
        </div>
        <Link
          href="/admin/photos/new"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-background font-medium rounded-md px-4 py-2 text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Upload Photos
        </Link>
      </div>

      {/* Photos grid */}
      {photos.length === 0 ? (
        <div className="bg-surface rounded-lg border border-border p-12 text-center">
          <ImageOff className="w-12 h-12 text-dim mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No photos yet
          </h3>
          <p className="text-muted text-sm mb-6">
            Upload your first photos to get started.
          </p>
          <Link
            href="/admin/photos/new"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-background font-medium rounded-md px-4 py-2 text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Upload Photos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group bg-surface rounded-lg border border-border overflow-hidden"
            >
              <Link href={`/admin/photos/${photo.id}`} className="block">
                <div className="aspect-square relative overflow-hidden bg-surface-light">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt={photo.title || "Photo"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {photo.isFeatured && (
                    <div className="absolute top-2 right-2 bg-accent/90 rounded-full p-1">
                      <Star className="w-3 h-3 text-background" />
                    </div>
                  )}
                  {!photo.isPublished && (
                    <div className="absolute top-2 left-2 bg-dim/80 rounded-full px-2 py-0.5 text-xs text-foreground">
                      Draft
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-3">
                <div className="text-sm font-medium text-foreground truncate">
                  {photo.title || "Untitled"}
                </div>
                <div className="text-xs text-muted mt-0.5 truncate">
                  {photo.category.name}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Link
                    href={`/admin/photos/${photo.id}`}
                    className="text-xs text-accent hover:text-accent-light transition-colors"
                  >
                    Edit
                  </Link>
                  <DeletePhotoButton photoId={photo.id} photoTitle={photo.title} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
