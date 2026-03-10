"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Upload } from "lucide-react";

function ImageUploadField({
  label,
  currentUrl,
  onUpload,
}: {
  label: string;
  currentUrl: string;
  onUpload: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/image", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      onUpload(url);
    } catch {
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-sm text-muted mb-2">{label}</label>
      <div className="flex items-start gap-4">
        {currentUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUrl}
            alt=""
            className="w-24 h-32 object-cover rounded-md border border-border flex-shrink-0"
          />
        )}
        <label className="inline-flex items-center gap-2 cursor-pointer bg-surface-light border border-border hover:border-accent rounded-md px-3 py-2 text-sm transition-colors self-start">
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? "Uploading..." : currentUrl ? "Change Photo" : "Upload Photo"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
}

export default function AdminAboutPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({
    headline: "",
    bio: "",
    shortBio: "",
    profileImageUrl: "",
    stats: { height: "", hairColor: "", eyeColor: "" } as Record<string, string>,
  });

  useEffect(() => {
    fetch("/api/about")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setForm({
            headline: data.headline || "",
            bio: data.bio || "",
            shortBio: data.shortBio || "",
            profileImageUrl: data.profileImageUrl || "",
            stats: data.stats || { height: "", hairColor: "", eyeColor: "" },
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setMessage(
        res.ok
          ? { type: "success", text: "Saved successfully!" }
          : { type: "error", text: "Failed to save" }
      );
    } catch {
      setMessage({ type: "error", text: "Failed to save" });
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display tracking-wider">About / Bio</h1>
        <p className="text-muted text-sm mt-1">Edit your bio and profile information</p>
      </div>

      {message && (
        <div
          className={`mb-4 px-4 py-2 rounded-md text-sm ${
            message.type === "success"
              ? "bg-emerald-600/20 text-emerald-400"
              : "bg-red-600/20 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
          <ImageUploadField
            label="Profile Photo"
            currentUrl={form.profileImageUrl}
            onUpload={(url) => setForm({ ...form, profileImageUrl: url })}
          />
          <div>
            <label className="block text-sm text-muted mb-1.5">Short Bio (homepage)</label>
            <textarea
              value={form.shortBio}
              onChange={(e) => setForm({ ...form, shortBio: e.target.value })}
              rows={3}
              className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">Full Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={8}
              className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent resize-none"
            />
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
          <h3 className="text-sm font-medium text-foreground">Physical Stats</h3>
          {["height", "hairColor", "eyeColor"].map((key) => (
            <div key={key}>
              <label className="block text-sm text-muted mb-1.5 capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type="text"
                value={form.stats[key] || ""}
                onChange={(e) =>
                  setForm({ ...form, stats: { ...form.stats, [key]: e.target.value } })
                }
                className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-accent text-background px-4 py-2 rounded-md text-sm font-medium hover:bg-accent-light transition-colors disabled:opacity-50 inline-flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
