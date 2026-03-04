import sharp from "sharp";
import { put, del } from "@vercel/blob";

export async function processAndSaveImage(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const baseName = `${timestamp}_${safeName}`;
  const webpName = baseName.replace(/\.[^.]+$/, ".webp");

  const image = sharp(buffer);
  const metadata = await image.metadata();

  // Process full image
  const fullImage = await image
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  // Generate thumbnail
  const thumbnail = await sharp(buffer)
    .resize({ width: 600, height: 600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer();

  // Generate blur placeholder
  const blurPlaceholder = await sharp(buffer)
    .resize(10, 10, { fit: "inside" })
    .webp({ quality: 20 })
    .toBuffer();
  const blurDataUrl = `data:image/webp;base64,${blurPlaceholder.toString("base64")}`;

  // Upload both to Vercel Blob
  const [fullBlob, thumbBlob] = await Promise.all([
    put(`photos/${webpName}`, fullImage, { access: "public", contentType: "image/webp" }),
    put(`thumbnails/${webpName}`, thumbnail, { access: "public", contentType: "image/webp" }),
  ]);

  return {
    filename: webpName,
    url: fullBlob.url,
    thumbnailUrl: thumbBlob.url,
    blurDataUrl,
    width: metadata.width || 0,
    height: metadata.height || 0,
    fileSize: fullImage.length,
  };
}

export async function deleteImageFiles(url: string, thumbnailUrl?: string | null) {
  try {
    if (url.includes("blob.vercel-storage.com")) {
      await del(url);
    }
  } catch {}
  if (thumbnailUrl) {
    try {
      if (thumbnailUrl.includes("blob.vercel-storage.com")) {
        await del(thumbnailUrl);
      }
    } catch {}
  }
}
