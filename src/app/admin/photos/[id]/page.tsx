import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditPhotoForm } from "./EditPhotoForm";

export default async function EditPhotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [photo, categories] = await Promise.all([
    prisma.photo.findUnique({
      where: { id },
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!photo) notFound();

  return (
    <EditPhotoForm
      photo={{
        id: photo.id,
        title: photo.title || "",
        description: photo.description || "",
        categoryId: photo.categoryId,
        isFeatured: photo.isFeatured,
        isPublished: photo.isPublished,
        url: photo.url,
        thumbnailUrl: photo.thumbnailUrl,
      }}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
