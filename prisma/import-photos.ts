import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const PHOTOS_DIR = path.join(process.cwd(), "public/uploads/photos");
const THUMBS_DIR = path.join(process.cwd(), "public/uploads/thumbnails");

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp"];
const SKIP_FILES = ["screenshot", ".gitkeep"];

async function processPhoto(filename: string) {
  const filePath = path.join(PHOTOS_DIR, filename);
  const ext = path.extname(filename).toLowerCase();
  const baseName = path.basename(filename, path.extname(filename));
  const thumbFilename = baseName + ".webp";
  const thumbPath = path.join(THUMBS_DIR, thumbFilename);

  const image = sharp(filePath);
  const metadata = await image.metadata();
  const width = metadata.width || 800;
  const height = metadata.height || 1000;

  // Generate thumbnail if it doesn't exist
  if (!fs.existsSync(thumbPath)) {
    await sharp(filePath)
      .resize(600, 600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(thumbPath);
  }

  // Generate blur placeholder (tiny 10px base64)
  const blurBuffer = await sharp(filePath)
    .resize(10, 10, { fit: "inside" })
    .webp({ quality: 20 })
    .toBuffer();
  const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

  return {
    url: `/uploads/photos/${filename}`,
    thumbnailUrl: `/uploads/thumbnails/${thumbFilename}`,
    blurDataUrl,
    width,
    height,
  };
}

async function main() {
  if (!fs.existsSync(THUMBS_DIR)) fs.mkdirSync(THUMBS_DIR, { recursive: true });

  // Get all existing DB urls (lowercase for comparison)
  const existing = await prisma.photo.findMany({ select: { url: true } });
  const existingUrls = new Set(existing.map((p) => p.url.toLowerCase()));

  // Get default category
  const defaultCategory = await prisma.category.findFirst({
    orderBy: { sortOrder: "asc" },
  });

  // Scan folder
  const files = fs.readdirSync(PHOTOS_DIR).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    const lower = f.toLowerCase();
    return (
      IMAGE_EXTS.includes(ext) &&
      !SKIP_FILES.some((skip) => lower.includes(skip))
    );
  });

  const toImport = files.filter(
    (f) => !existingUrls.has(`/uploads/photos/${f}`.toLowerCase())
  );

  console.log(`Found ${files.length} images total, ${toImport.length} new to import.`);

  let count = 0;
  const maxSort = existing.length;

  for (const filename of toImport) {
    try {
      process.stdout.write(`  Processing ${filename}...`);
      const data = await processPhoto(filename);

      // Generate a readable title from filename
      const title = path.basename(filename, path.extname(filename))
        .replace(/[-_]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      await prisma.photo.create({
        data: {
          title,
          filename,
          url: data.url,
          thumbnailUrl: data.thumbnailUrl,
          blurDataUrl: data.blurDataUrl,
          width: data.width,
          height: data.height,
          categoryId: defaultCategory?.id,
          isPublished: true,
          isFeatured: false,
          sortOrder: maxSort + count,
        },
      });

      count++;
      console.log(" ✓");
    } catch (err) {
      console.log(` ✗ (${(err as Error).message})`);
    }
  }

  console.log(`\nDone! Imported ${count} photos.`);
}

main().finally(() => prisma.$disconnect());
