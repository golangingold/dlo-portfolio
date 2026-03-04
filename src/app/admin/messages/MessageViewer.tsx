"use client";

import { useRouter } from "next/navigation";
import { Eye, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

export function MessageViewer({ id, isRead }: { id: string; isRead: boolean }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function markRead() {
    await fetch(`/api/contact/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this message?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/contact/submissions/${id}`, { method: "DELETE" });
      router.refresh();
    } catch {
      alert("Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      {!isRead && (
        <button onClick={markRead} className="text-dim hover:text-accent transition-colors" title="Mark as read">
          <Eye className="w-4 h-4" />
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="text-dim hover:text-red-400 transition-colors"
        title="Delete"
      >
        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
