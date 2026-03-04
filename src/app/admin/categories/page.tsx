"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  _count?: { photos: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      setNewName("");
      fetchCategories();
    }
    setSaving(false);
  }

  async function deleteCategory(id: string, name: string, photoCount: number) {
    if (photoCount > 0) {
      if (!confirm(`"${name}" has ${photoCount} photos. Deleting will remove all photos in this category. Continue?`)) return;
    } else {
      if (!confirm(`Delete category "${name}"?`)) return;
    }
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    fetchCategories();
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-accent animate-spin" /></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display tracking-wider">Categories</h1>
        <p className="text-muted text-sm mt-1">Organize your portfolio photos</p>
      </div>

      <form onSubmit={addCategory} className="bg-surface rounded-lg border border-border p-4 mb-6 flex gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="flex-1 bg-surface-light border border-border text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
        />
        <button type="submit" disabled={saving || !newName.trim()} className="bg-accent text-background px-4 py-2 rounded-md text-sm font-medium hover:bg-accent-light transition-colors disabled:opacity-50 inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />{saving ? "Adding..." : "Add"}
        </button>
      </form>

      <div className="bg-surface rounded-lg border border-border divide-y divide-border">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-dim text-sm">No categories yet</div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <span className="text-foreground text-sm font-medium">{cat.name}</span>
                <span className="text-dim text-xs ml-3">/{cat.slug}</span>
                <span className="text-muted text-xs ml-3">{cat._count?.photos || 0} photos</span>
              </div>
              <button onClick={() => deleteCategory(cat.id, cat.name, cat._count?.photos || 0)} className="text-dim hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
