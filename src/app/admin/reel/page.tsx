"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Star, Loader2, Video } from "lucide-react";

interface Reel {
  id: string;
  title: string;
  url: string;
  platform: string;
  isPrimary: boolean;
}

export default function AdminReelPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", url: "" });

  async function loadReels() {
    try {
      const res = await fetch("/api/reel");
      const data = await res.json();
      setReels(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReels(); }, []);

  function detectPlatform(url: string): string {
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    if (url.includes("vimeo.com")) return "vimeo";
    return "other";
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/reel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          url: form.url,
          platform: detectPlatform(form.url),
          isPrimary: reels.length === 0,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setForm({ title: "", url: "" });
      setShowForm(false);
      await loadReels();
    } catch {
      alert("Failed to add reel");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this reel?")) return;
    try {
      await fetch(`/api/reel/${id}`, { method: "DELETE" });
      await loadReels();
    } catch {
      alert("Failed to delete");
    }
  }

  async function handleSetPrimary(id: string) {
    try {
      await fetch(`/api/reel/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      });
      await loadReels();
    } catch {
      alert("Failed to update");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display tracking-wider">Demo Reels</h1>
          <p className="text-muted text-sm mt-1">Manage your video reels</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent text-background px-4 py-2 rounded-md text-sm font-medium hover:bg-accent-light transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />Add Reel
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-surface rounded-lg border border-border p-6 mb-6 space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Acting Reel 2024"
              className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Video URL</label>
            <input
              type="url"
              required
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
              className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-background font-medium rounded-md px-4 py-2 text-sm transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? "Adding..." : "Add Reel"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-muted hover:text-foreground">
              Cancel
            </button>
          </div>
        </form>
      )}

      {reels.length === 0 ? (
        <div className="bg-surface rounded-lg border border-border p-12 text-center text-dim text-sm">
          No demo reels yet. Add your first video reel above.
        </div>
      ) : (
        <div className="space-y-3">
          {reels.map((reel) => (
            <div key={reel.id} className="bg-surface rounded-lg border border-border px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Video className="w-5 h-5 text-dim shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-sm font-medium">{reel.title}</span>
                    {reel.isPrimary && (
                      <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">Primary</span>
                    )}
                  </div>
                  <span className="text-dim text-xs truncate block">{reel.url}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                {!reel.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(reel.id)}
                    className="text-dim hover:text-accent transition-colors"
                    title="Set as primary"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(reel.id)}
                  className="text-dim hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
