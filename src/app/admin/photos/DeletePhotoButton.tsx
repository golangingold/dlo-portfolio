"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeletePhotoButton({
  photoId,
  photoTitle,
}: {
  photoId: string;
  photoTitle: string | null;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${photoTitle || "this photo"}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/photos/${photoId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete photo.");
      }
    } catch {
      alert("Failed to delete photo.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-xs text-dim hover:text-red-400 transition-colors disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
