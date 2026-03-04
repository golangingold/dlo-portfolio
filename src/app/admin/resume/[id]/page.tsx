"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";

const TYPES = [
  { value: "FILM", label: "Film" },
  { value: "TELEVISION", label: "Television" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "PRINT", label: "Print" },
  { value: "RUNWAY", label: "Runway" },
  { value: "THEATER", label: "Theater" },
  { value: "VOICEOVER", label: "Voiceover" },
  { value: "OTHER", label: "Other" },
];

export default function EditResumeEntryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    role: "",
    company: "",
    director: "",
    type: "FILM",
    year: "",
    notes: "",
  });

  useEffect(() => {
    fetch(`/api/resume/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setForm({
          title: data.title || "",
          role: data.role || "",
          company: data.company || "",
          director: data.director || "",
          type: data.type || "FILM",
          year: data.year || "",
          notes: data.notes || "",
        });
      })
      .catch(() => alert("Failed to load entry"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/resume/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update");
      router.push("/admin/resume");
      router.refresh();
    } catch {
      alert("Failed to update entry");
    } finally {
      setSaving(false);
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
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/resume" className="text-muted hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Edit Resume Entry</h1>
          <p className="text-muted text-sm mt-1">Update credit details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface rounded-lg border border-border p-6 space-y-5 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Year</label>
            <input
              type="text"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              placeholder="e.g. 2024"
              className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-1.5">Title / Project Name *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-1.5">Role</label>
          <input
            type="text"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-1.5">Company / Production</label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-1.5">Director</label>
          <input
            type="text"
            value={form.director}
            onChange={(e) => setForm({ ...form, director: e.target.value })}
            className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-1.5">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
          />
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
          <Link href="/admin/resume" className="text-sm text-muted hover:text-foreground transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
