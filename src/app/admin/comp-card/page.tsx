"use client";

import { useState, useEffect } from "react";
import { Loader2, Upload, CreditCard, X } from "lucide-react";

export default function AdminCompCardPage() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/about")
      .then((r) => r.json())
      .then((data) => {
        if (data?.compCardImageUrl) setCurrentUrl(data.compCardImageUrl);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/image", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      await saveUrl(url);
      setCurrentUrl(url);
    } catch {
      setMessage({ type: "error", text: "Failed to upload image. Please try again." });
    } finally {
      setUploading(false);
    }
  }

  async function saveUrl(url: string) {
    setSaving(true);
    try {
      // Fetch current about data to merge with
      const current = await fetch("/api/about").then((r) => r.json());
      const res = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...current,
          stats: current?.stats ?? {},
          bio: current?.bio || ".",
          compCardImageUrl: url,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setMessage({ type: "success", text: "Comp card saved!" });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: "error", text: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    await saveUrl("");
    setCurrentUrl("");
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display tracking-wider flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-accent" /> Comp Card
        </h1>
        <p className="text-muted text-sm mt-1">
          Upload DeAngelo&apos;s comp card image. It will appear on the public Comp Card page.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 px-4 py-2 rounded-md text-sm ${
            message.type === "success"
              ? "bg-emerald-600/20 text-emerald-400"
              : "bg-red-600/20 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="max-w-2xl space-y-6">
        {currentUrl ? (
          <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
            <h2 className="text-sm font-medium text-accent tracking-wider uppercase">
              Current Comp Card
            </h2>
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentUrl}
                alt="Comp card"
                className="max-w-full rounded-md border border-border"
                style={{ maxHeight: "500px" }}
              />
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black rounded-full p-1 text-white transition-colors"
                title="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer bg-surface-light border border-border hover:border-accent rounded-md px-4 py-2 text-sm transition-colors">
              {uploading || saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploading ? "Uploading..." : saving ? "Saving..." : "Replace Image"}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading || saving}
              />
            </label>
          </div>
        ) : (
          <div className="bg-surface rounded-lg border border-border p-12 text-center">
            <CreditCard className="w-12 h-12 text-dim mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No comp card yet</h3>
            <p className="text-muted text-sm mb-6">
              Upload your comp card image to display it on the public Comp Card page.
            </p>
            <label className="inline-flex items-center gap-2 cursor-pointer bg-accent hover:bg-accent-light text-background font-medium rounded-md px-4 py-2 text-sm transition-colors">
              {uploading || saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploading ? "Uploading..." : saving ? "Saving..." : "Upload Comp Card"}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading || saving}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
