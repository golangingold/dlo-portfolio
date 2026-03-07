"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, Save } from "lucide-react";

interface Props {
  photo: {
    id: string;
    title: string;
    description: string;
    categoryId: string;
    isFeatured: boolean;
    isPublished: boolean;
    url: string;
    thumbnailUrl: string | null;
  };
  categories: { id: string; name: string }[];
}

export function EditPhotoForm({ photo, categories }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: photo.title,
    description: photo.description,
    categoryId: photo.categoryId,
    isFeatured: photo.isFeatured,
    isPublished: photo.isPublished,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/photos/${photo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update");
      router.push("/admin/photos");
      router.refresh();
    } catch {
      alert("Failed to update photo");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/photos" className="text-muted hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Edit Photo</h1>
          <p className="text-muted text-sm mt-1">Update photo details</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Preview */}
        <div className="md:col-span-1">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-surface border border-border">
            <Image
              src={photo.url}
              alt={photo.title}
              fill
              className="object-cover"
              sizes="300px"
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="md:col-span-2 bg-surface rounded-lg border border-border p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full max-w-xs bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded border-border bg-surface-light text-accent"
              />
              <span className="text-sm text-foreground">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                className="w-4 h-4 rounded border-border bg-surface-light text-accent"
              />
              <span className="text-sm text-foreground">Published</span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-background font-medium rounded-md px-5 py-2 text-sm transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link href="/admin/photos" className="text-sm text-muted hover:text-foreground transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
