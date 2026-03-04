"use client";

import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";

interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  agencyName: string;
  agencyUrl: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  imdb: string;
  customLinks: string;
}

export default function AdminContactPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ContactInfo>({
    email: "",
    phone: "",
    location: "",
    agencyName: "",
    agencyUrl: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    imdb: "",
    customLinks: "",
  });

  useEffect(() => {
    fetch("/api/contact")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setForm({
            email: data.email || "",
            phone: data.phone || "",
            location: data.location || "",
            agencyName: data.agencyName || "",
            agencyUrl: data.agencyUrl || "",
            instagram: data.instagram || "",
            tiktok: data.tiktok || "",
            youtube: data.youtube || "",
            imdb: data.imdb || "",
            customLinks: data.customLinks || "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      alert("Contact info saved!");
    } catch {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function updateForm(field: keyof ContactInfo, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
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
      <div className="mb-8">
        <h1 className="text-2xl font-display tracking-wider">Contact Info</h1>
        <p className="text-muted text-sm mt-1">Update your contact details and social links</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Basic Info */}
        <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
          <h2 className="text-sm font-medium text-accent tracking-wider uppercase">Basic Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
                className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => updateForm("phone", e.target.value)}
                className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => updateForm("location", e.target.value)}
              placeholder="e.g. San Francisco, CA"
              className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>

        {/* Agency */}
        <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
          <h2 className="text-sm font-medium text-accent tracking-wider uppercase">Agency</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Agency Name</label>
              <input
                type="text"
                value={form.agencyName}
                onChange={(e) => updateForm("agencyName", e.target.value)}
                className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Agency Website</label>
              <input
                type="url"
                value={form.agencyUrl}
                onChange={(e) => updateForm("agencyUrl", e.target.value)}
                placeholder="https://"
                className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
          <h2 className="text-sm font-medium text-accent tracking-wider uppercase">Social Links</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Instagram</label>
              <input
                type="text"
                value={form.instagram}
                onChange={(e) => updateForm("instagram", e.target.value)}
                placeholder="@username or full URL"
                className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">TikTok</label>
              <input
                type="text"
                value={form.tiktok}
                onChange={(e) => updateForm("tiktok", e.target.value)}
                placeholder="@username or full URL"
                className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">YouTube</label>
              <input
                type="text"
                value={form.youtube}
                onChange={(e) => updateForm("youtube", e.target.value)}
                placeholder="Channel URL"
                className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">IMDb</label>
              <input
                type="text"
                value={form.imdb}
                onChange={(e) => updateForm("imdb", e.target.value)}
                placeholder="IMDb profile URL"
                className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-background font-medium rounded-md px-6 py-2.5 text-sm transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Contact Info"}
        </button>
      </form>
    </div>
  );
}
