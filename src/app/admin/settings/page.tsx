"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, KeyRound, Eye, EyeOff } from "lucide-react";

interface Settings {
  siteName: string;
  tagline: string;
  metaDescription: string;
  heroHeadline: string;
  heroSubtext: string;
  showReel: boolean;
  showResume: boolean;
  showContact: boolean;
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-muted mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 pr-10 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dim hover:text-muted transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Settings>({
    siteName: "",
    tagline: "",
    metaDescription: "",
    heroHeadline: "",
    heroSubtext: "",
    showReel: true,
    showResume: true,
    showContact: true,
  });

  // Password change state
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setForm({
            siteName: data.siteName || "",
            tagline: data.tagline || "",
            metaDescription: data.metaDescription || "",
            heroHeadline: data.heroHeadline || "",
            heroSubtext: data.heroSubtext || "",
            showReel: data.showReel ?? true,
            showResume: data.showResume ?? true,
            showContact: data.showContact ?? true,
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
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      alert("Settings saved!");
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (pwForm.next !== pwForm.confirm) {
      setPwError("New passwords do not match.");
      return;
    }
    if (pwForm.next.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }

    setPwSaving(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error || "Failed to change password.");
      } else {
        setPwSuccess(true);
        setPwForm({ current: "", next: "", confirm: "" });
      }
    } catch {
      setPwError("Something went wrong. Please try again.");
    } finally {
      setPwSaving(false);
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
      <div className="mb-8">
        <h1 className="text-2xl font-display tracking-wider">Site Settings</h1>
        <p className="text-muted text-sm mt-1">Configure your portfolio site</p>
      </div>

      <div className="max-w-2xl space-y-8">
        {/* ── Site Settings form ── */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Branding */}
          <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
            <h2 className="text-sm font-medium text-accent tracking-wider uppercase">Branding</h2>
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Site Name</label>
              <input
                type="text"
                value={form.siteName}
                onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="e.g. Model · Actor · Creative"
                className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Meta Description</label>
              <textarea
                value={form.metaDescription}
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                rows={2}
                placeholder="SEO description for search engines"
                className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
              />
            </div>
          </div>

          {/* Hero */}
          <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
            <h2 className="text-sm font-medium text-accent tracking-wider uppercase">Homepage Hero</h2>
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Hero Headline</label>
              <input
                type="text"
                value={form.heroHeadline}
                onChange={(e) => setForm({ ...form, heroHeadline: e.target.value })}
                placeholder="e.g. DEANGELO"
                className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Hero Subtext</label>
              <input
                type="text"
                value={form.heroSubtext}
                onChange={(e) => setForm({ ...form, heroSubtext: e.target.value })}
                placeholder="e.g. Model · Actor · Creative"
                className="w-full bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>

          {/* Visibility Toggles */}
          <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
            <h2 className="text-sm font-medium text-accent tracking-wider uppercase">Section Visibility</h2>
            {[
              { key: "showReel" as const, label: "Show Demo Reel" },
              { key: "showResume" as const, label: "Show Resume" },
              { key: "showContact" as const, label: "Show Contact Form" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                  className="w-4 h-4 rounded border-border bg-surface-light text-accent focus:ring-accent/50"
                />
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-background font-medium rounded-md px-6 py-2.5 text-sm transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>

        {/* ── Change Password form ── */}
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-medium text-accent tracking-wider uppercase">Change Password</h2>
            </div>

            <PasswordField
              label="Current Password"
              value={pwForm.current}
              onChange={(v) => setPwForm({ ...pwForm, current: v })}
            />
            <PasswordField
              label="New Password"
              value={pwForm.next}
              onChange={(v) => setPwForm({ ...pwForm, next: v })}
              placeholder="Minimum 8 characters"
            />
            <PasswordField
              label="Confirm New Password"
              value={pwForm.confirm}
              onChange={(v) => setPwForm({ ...pwForm, confirm: v })}
            />

            {pwError && (
              <p className="text-sm text-red-400">{pwError}</p>
            )}
            {pwSuccess && (
              <p className="text-sm text-green-400">Password changed successfully!</p>
            )}
          </div>

          <button
            type="submit"
            disabled={pwSaving || !pwForm.current || !pwForm.next || !pwForm.confirm}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-background font-medium rounded-md px-6 py-2.5 text-sm transition-colors disabled:opacity-50"
          >
            {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            {pwSaving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
