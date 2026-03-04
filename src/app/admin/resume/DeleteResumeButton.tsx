"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteResumeButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/resume/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.refresh();
    } catch {
      alert("Failed to delete entry");
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-400">Delete &ldquo;{title}&rdquo;?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-red-400 hover:text-red-300 font-medium"
        >
          {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Yes"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-dim hover:text-foreground"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-dim hover:text-red-400 transition-colors"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
