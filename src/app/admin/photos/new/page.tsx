"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

interface FileWithPreview {
  file: File;
  preview: string;
  title: string;
  description: string;
  uploading: boolean;
  uploaded: boolean;
  error: string | null;
  progress: number;
}

export default function NewPhotoPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingCategories(false));
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
      description: "",
      uploading: false,
      uploaded: false,
      error: null,
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".avif"] },
    multiple: true,
  });

  function removeFile(index: number) {
    setFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  }

  function updateFile(index: number, field: "title" | "description", value: string) {
    setFiles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  async function handleSubmit() {
    if (!categoryId) {
      alert("Please select a category.");
      return;
    }
    if (files.length === 0) {
      alert("Please add at least one photo.");
      return;
    }

    setIsSubmitting(true);

    for (let i = 0; i < files.length; i++) {
      if (files[i].uploaded) continue;

      setFiles((prev) => {
        const updated = [...prev];
        updated[i] = { ...updated[i], uploading: true, error: null };
        return updated;
      });

      try {
        // Upload image file
        const formData = new FormData();
        formData.append("file", files[i].file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Upload failed");

        const uploadData = await uploadRes.json();

        // Create photo record
        const photoRes = await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: files[i].title,
            description: files[i].description,
            categoryId,
            ...uploadData,
          }),
        });

        if (!photoRes.ok) throw new Error("Failed to create photo record");

        setFiles((prev) => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            uploading: false,
            uploaded: true,
            progress: 100,
          };
          return updated;
        });
      } catch (err) {
        setFiles((prev) => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            uploading: false,
            error: err instanceof Error ? err.message : "Upload failed",
          };
          return updated;
        });
      }
    }

    setIsSubmitting(false);

    const allUploaded = files.every((f) => f.uploaded);
    if (allUploaded) {
      router.push("/admin/photos");
      router.refresh();
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/photos"
          className="text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Upload Photos
          </h1>
          <p className="text-muted text-sm mt-1">
            Add new photos to your portfolio
          </p>
        </div>
      </div>

      {/* Category select */}
      <div className="bg-surface rounded-lg border border-border p-6 mb-6">
        <label className="block text-sm font-medium text-muted mb-1.5">
          Category
        </label>
        {loadingCategories ? (
          <div className="text-dim text-sm">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-dim text-sm">
            No categories found.{" "}
            <Link href="/admin/categories" className="text-accent hover:text-accent-light">
              Create one first.
            </Link>
          </div>
        ) : (
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full max-w-xs bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`bg-surface rounded-lg border-2 border-dashed p-12 text-center cursor-pointer transition-colors mb-6 ${
          isDragActive
            ? "border-accent bg-accent/5"
            : "border-border hover:border-accent/30"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 text-dim mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-accent text-sm">Drop the images here...</p>
        ) : (
          <div>
            <p className="text-foreground text-sm font-medium">
              Drag & drop images here, or click to select
            </p>
            <p className="text-dim text-xs mt-2">
              Supports JPG, PNG, WebP, AVIF
            </p>
          </div>
        )}
      </div>

      {/* File previews */}
      {files.length > 0 && (
        <div className="space-y-4 mb-6">
          {files.map((fileItem, index) => (
            <div
              key={index}
              className="bg-surface rounded-lg border border-border p-4 flex gap-4"
            >
              {/* Preview */}
              <div className="w-24 h-24 rounded-md overflow-hidden bg-surface-light shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fileItem.preview}
                  alt={fileItem.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Fields */}
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <input
                    type="text"
                    value={fileItem.title}
                    onChange={(e) => updateFile(index, "title", e.target.value)}
                    placeholder="Title"
                    className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-1.5 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={fileItem.description}
                    onChange={(e) =>
                      updateFile(index, "description", e.target.value)
                    }
                    placeholder="Description (optional)"
                    className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-1.5 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>

                {/* Status */}
                {fileItem.uploading && (
                  <div className="flex items-center gap-2 text-xs text-accent">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Uploading...
                  </div>
                )}
                {fileItem.uploaded && (
                  <div className="text-xs text-emerald-400">Uploaded</div>
                )}
                {fileItem.error && (
                  <div className="text-xs text-red-400">{fileItem.error}</div>
                )}
              </div>

              {/* Remove */}
              {!fileItem.uploaded && (
                <button
                  onClick={() => removeFile(index)}
                  className="text-dim hover:text-foreground transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Submit */}
      {files.length > 0 && (
        <div className="flex items-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !categoryId}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-background font-medium rounded-md px-6 py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload {files.filter((f) => !f.uploaded).length} Photo
                {files.filter((f) => !f.uploaded).length !== 1 ? "s" : ""}
              </>
            )}
          </button>
          <span className="text-sm text-muted">
            {files.filter((f) => f.uploaded).length} of {files.length} uploaded
          </span>
        </div>
      )}
    </div>
  );
}
