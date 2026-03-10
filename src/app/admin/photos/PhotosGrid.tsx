"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { House, GripVertical, ImageOff, Plus, Loader2, Check } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DeletePhotoButton } from "./DeletePhotoButton";

interface Photo {
  id: string;
  title: string | null;
  thumbnailUrl: string | null;
  url: string;
  isFeatured: boolean;
  isPublished: boolean;
  category: { name: string };
}

function SortablePhoto({
  photo,
  onToggleHomePage,
}: {
  photo: Photo;
  onToggleHomePage: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group bg-surface rounded-lg border border-border overflow-hidden"
    >
      <Link href={`/admin/photos/${photo.id}`} className="block">
        <div className="aspect-square relative overflow-hidden bg-surface-light">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.thumbnailUrl || photo.url}
            alt={photo.title || "Photo"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {photo.isFeatured && (
            <div className="absolute top-2 right-2 bg-accent/90 rounded-full p-1" title="Shown on home page">
              <House className="w-3 h-3 text-background fill-background" />
            </div>
          )}
          {!photo.isPublished && (
            <div className="absolute top-2 left-2 bg-black/60 rounded-full px-2 py-0.5 text-xs text-foreground">
              Draft
            </div>
          )}
        </div>
      </Link>
      <div className="p-3">
        <div className="flex items-start gap-1.5">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 text-dim hover:text-muted cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
            aria-label="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-foreground truncate">
              {photo.title || "Untitled"}
            </div>
            <div className="text-xs text-muted mt-0.5 truncate">{photo.category.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2 ml-5">
          <Link
            href={`/admin/photos/${photo.id}`}
            className="text-xs text-accent hover:text-accent-light transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={() => onToggleHomePage(photo.id)}
            className={`text-xs transition-colors ${
              photo.isFeatured
                ? "text-accent hover:text-accent-light"
                : "text-dim hover:text-muted"
            }`}
            title={photo.isFeatured ? "Remove from home page" : "Add to home page"}
          >
            {photo.isFeatured ? "On Home" : "+ Home"}
          </button>
          <DeletePhotoButton photoId={photo.id} photoTitle={photo.title} />
        </div>
      </div>
    </div>
  );
}

export default function PhotosGrid({ initialPhotos }: { initialPhotos: Photo[] }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = photos.findIndex((p) => p.id === active.id);
      const newIndex = photos.findIndex((p) => p.id === over.id);
      const reordered = arrayMove(photos, oldIndex, newIndex);
      setPhotos(reordered);

      setSaving(true);
      setSaved(false);
      try {
        await fetch("/api/photos/reorder", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reordered.map((p, i) => ({ id: p.id, sortOrder: i }))),
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch {
        setPhotos(photos); // revert on error
      } finally {
        setSaving(false);
      }
    },
    [photos]
  );

  const handleToggleHomePage = useCallback(
    async (id: string) => {
      const photo = photos.find((p) => p.id === id);
      if (!photo) return;
      const newValue = !photo.isFeatured;

      // Optimistic update
      setPhotos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isFeatured: newValue } : p))
      );

      try {
        await fetch(`/api/photos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isFeatured: newValue }),
        });
      } catch {
        // Revert on error
        setPhotos((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isFeatured: photo.isFeatured } : p))
        );
      }
    },
    [photos]
  );

  if (photos.length === 0) {
    return (
      <div className="bg-surface rounded-lg border border-border p-12 text-center">
        <ImageOff className="w-12 h-12 text-dim mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No photos yet</h3>
        <p className="text-muted text-sm mb-6">Upload your first photos to get started.</p>
        <Link
          href="/admin/photos/new"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-background font-medium rounded-md px-4 py-2 text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Upload Photos
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Status bar */}
      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-4 text-xs text-muted">
        <span className="flex items-center gap-1">
          <GripVertical className="w-3.5 h-3.5" /> Drag to reorder
        </span>
        <span className="text-dim">·</span>
        <span className="flex items-center gap-1">
          <House className="w-3.5 h-3.5" /> Click &quot;+ Home&quot; to show a photo on the home page
        </span>
        {saving && (
          <span className="flex items-center gap-1 text-accent ml-2">
            <Loader2 className="w-3 h-3 animate-spin" /> Saving...
          </span>
        )}
        {saved && (
          <span className="flex items-center gap-1 text-green-400 ml-2">
            <Check className="w-3 h-3" /> Saved
          </span>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {photos.map((photo) => (
              <SortablePhoto
                key={photo.id}
                photo={photo}
                onToggleHomePage={handleToggleHomePage}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
}
