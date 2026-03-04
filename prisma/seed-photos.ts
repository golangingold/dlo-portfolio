import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

const PHOTOS_DIR = path.join(process.cwd(), "public", "uploads", "photos");
const THUMBS_DIR = path.join(process.cwd(), "public", "uploads", "thumbnails");

interface PhotoConfig {
  filename: string;
  title: string;
  categorySlug: string;
  isFeatured: boolean;
}

const photos: PhotoConfig[] = [
  {
    filename: "Taser and Turtle8165.JPEG",
    title: "Profile — Neon Blue",
    categorySlug: "headshots",
    isFeatured: true,
  },
  {
    filename: "Taser and Turtle8080.JPEG",
    title: "Studio — Headphones",
    categorySlug: "commercial",
    isFeatured: true,
  },
  {
    filename: "IMG_2808.PNG",
    title: "Street Style — SF",
    categorySlug: "lifestyle",
    isFeatured: true,
  },
  {
    filename: "IMG_2497.JPEG",
    title: "Relaxed — Garden",
    categorySlug: "lifestyle",
    isFeatured: true,
  },
];

async function main() {
  // Ensure thumbnails directory exists
  if (!fs.existsSync(THUMBS_DIR)) {
    fs.mkdirSync(THUMBS_DIR, { recursive: true });
  }

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const filepath = path.join(PHOTOS_DIR, photo.filename);

    if (!fs.existsSync(filepath)) {
      console.log(`Skipping ${photo.filename} — file not found`);
      continue;
    }

    console.log(`Processing ${photo.filename}...`);

    const image = sharp(filepath);
    const metadata = await image.metadata();

    // Generate thumbnail
    const thumbName = photo.filename.replace(/\.[^.]+$/, "_thumb.webp");
    const thumbPath = path.join(THUMBS_DIR, thumbName);
    await sharp(filepath)
      .resize({ width: 600, height: 600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(thumbPath);

    // Generate blur placeholder
    const blurBuffer = await sharp(filepath)
      .resize(10, 10, { fit: "inside" })
      .toBuffer();
    const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

    // Find category
    const category = await prisma.category.findUnique({
      where: { slug: photo.categorySlug },
    });

    if (!category) {
      console.log(`Category ${photo.categorySlug} not found, skipping`);
      continue;
    }

    // Check if photo already exists
    const existing = await prisma.photo.findFirst({
      where: { filename: photo.filename },
    });
    if (existing) {
      console.log(`Photo ${photo.filename} already exists, skipping`);
      continue;
    }

    await prisma.photo.create({
      data: {
        title: photo.title,
        description: photo.title,
        filename: photo.filename,
        url: `/uploads/photos/${photo.filename}`,
        thumbnailUrl: `/uploads/thumbnails/${thumbName}`,
        blurDataUrl,
        width: metadata.width || 0,
        height: metadata.height || 0,
        fileSize: fs.statSync(filepath).size,
        sortOrder: i,
        isFeatured: photo.isFeatured,
        isPublished: true,
        categoryId: category.id,
      },
    });

    console.log(`  Added: ${photo.title} (${metadata.width}x${metadata.height})`);
  }

  // Also set the first headshot as profile image for the About page
  const headshot = await prisma.photo.findFirst({
    where: { category: { slug: "headshots" } },
  });
  if (headshot) {
    await prisma.about.update({
      where: { id: "default" },
      data: { profileImageUrl: headshot.url },
    });
    console.log("Set profile image to headshot");
  }

  console.log("Photo seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
