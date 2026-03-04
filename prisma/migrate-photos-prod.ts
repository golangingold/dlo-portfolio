/**
 * migrate-photos-prod.ts
 *
 * Uploads local photos to Vercel Blob and inserts records into production PostgreSQL.
 * Run this ONCE after deploying, with production credentials in your .env.
 *
 * Steps:
 *   1. Go to Vercel → Storage → your Postgres store → ".env.local" tab → copy DATABASE_URL + DATABASE_URL_UNPOOLED
 *   2. Go to Vercel → Storage → your Blob store → ".env.local" tab → copy BLOB_READ_WRITE_TOKEN
 *   3. Paste all three into your local .env file
 *   4. Run: npx tsx prisma/migrate-photos-prod.ts
 */

import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const PHOTOS_DIR = path.join(process.cwd(), "public/uploads/photos");
const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp"];

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error(
      "\n❌ BLOB_READ_WRITE_TOKEN is not set.\n" +
        "   Get it from Vercel Dashboard → Storage → your Blob store → .env.local tab.\n" +
        "   Add it to your local .env file and re-run.\n"
    );
    process.exit(1);
  }

  // Find default category (headshots first, then any)
  let category = await prisma.category.findFirst({ where: { slug: "headshots" } });
  if (!category) {
    category = await prisma.category.findFirst({ orderBy: { sortOrder: "asc" } });
  }
  if (!category) {
    console.error(
      "\n❌ No categories found in the production database.\n" +
        "   Make sure the seed has run first (it should have run automatically on deploy).\n"
    );
    process.exit(1);
  }

  console.log(`\nUsing category: "${category.name}"`);

  // Get filenames already in production DB
  const existing = await prisma.photo.findMany({ select: { filename: true } });
  const existingFilenames = new Set(existing.map((p) => p.filename.toLowerCase()));

  // Scan local uploads folder
  if (!fs.existsSync(PHOTOS_DIR)) {
    console.error(`\n❌ Photos directory not found: ${PHOTOS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(PHOTOS_DIR).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return IMAGE_EXTS.includes(ext) && !f.startsWith(".") && f !== ".gitkeep";
  });

  const toUpload = files.filter((f) => !existingFilenames.has(f.toLowerCase()));
  console.log(`Found ${files.length} local photos, ${toUpload.length} not yet in production.\n`);

  if (toUpload.length === 0) {
    console.log("✅ Nothing to upload — all photos are already in production.");
    return;
  }

  let success = 0;
  let failed = 0;

  for (let i = 0; i < toUpload.length; i++) {
    const filename = toUpload[i];
    const filePath = path.join(PHOTOS_DIR, filename);
    const baseName = path.basename(filename, path.extname(filename));
    const webpName = `${baseName.replace(/\s+/g, "-")}-${Date.now()}.webp`;

    process.stdout.write(`  [${i + 1}/${toUpload.length}] ${filename} ... `);

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const metadata = await sharp(fileBuffer).metadata();

      // Process with Sharp
      const [fullImage, thumbnail, blurBuffer] = await Promise.all([
        sharp(fileBuffer).webp({ quality: 88 }).toBuffer(),
        sharp(fileBuffer)
          .resize(600, 600, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer(),
        sharp(fileBuffer).resize(10, 10, { fit: "inside" }).webp({ quality: 20 }).toBuffer(),
      ]);

      const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

      // Upload to Vercel Blob
      const [fullBlob, thumbBlob] = await Promise.all([
        put(`photos/${webpName}`, fullImage, { access: "public", contentType: "image/webp" }),
        put(`thumbnails/${webpName}`, thumbnail, { access: "public", contentType: "image/webp" }),
      ]);

      // Insert into production DB
      const title = baseName.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
      await prisma.photo.create({
        data: {
          title,
          filename,
          url: fullBlob.url,
          thumbnailUrl: thumbBlob.url,
          blurDataUrl,
          width: metadata.width ?? 800,
          height: metadata.height ?? 1000,
          fileSize: fileBuffer.length,
          categoryId: category.id,
          isPublished: true,
          isFeatured: false,
          sortOrder: existing.length + success,
        },
      });

      success++;
      console.log("✓");
    } catch (err) {
      failed++;
      console.log(`✗ ${(err as Error).message}`);
    }
  }

  console.log(
    `\n✅ Done! Uploaded ${success} photo${success !== 1 ? "s" : ""} to Vercel Blob.` +
      (failed > 0 ? ` ${failed} failed — check errors above.` : "")
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
