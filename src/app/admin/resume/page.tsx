import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Edit, Trash2 } from "lucide-react";
import { DeleteResumeButton } from "./DeleteResumeButton";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  FILM: "Film",
  TELEVISION: "Television",
  COMMERCIAL: "Commercial",
  PRINT: "Print",
  RUNWAY: "Runway",
  THEATER: "Theater",
  VOICEOVER: "Voiceover",
  OTHER: "Other",
};

export default async function AdminResumePage() {
  const entries = await prisma.resumeEntry.findMany({
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
  });

  const grouped = entries.reduce((acc, entry) => {
    if (!acc[entry.type]) acc[entry.type] = [];
    acc[entry.type].push(entry);
    return acc;
  }, {} as Record<string, typeof entries>);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display tracking-wider">Resume</h1>
          <p className="text-muted text-sm mt-1">Manage your credits and experience</p>
        </div>
        <Link href="/admin/resume/new" className="bg-accent text-background px-4 py-2 rounded-md text-sm font-medium hover:bg-accent-light transition-colors inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />Add Entry
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="bg-surface rounded-lg border border-border p-12 text-center text-dim text-sm">No resume entries yet</div>
      ) : (
        Object.entries(grouped).map(([type, items]) => (
          <div key={type} className="mb-8">
            <h2 className="text-lg font-display tracking-wider text-accent mb-3">{TYPE_LABELS[type] || type}</h2>
            <div className="bg-surface rounded-lg border border-border divide-y divide-border">
              {items.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-foreground text-sm font-medium">{entry.title}</span>
                    {entry.role && <span className="text-muted text-sm ml-2">— {entry.role}</span>}
                    {entry.company && <span className="text-dim text-xs ml-3">{entry.company}</span>}
                    {entry.year && <span className="text-dim text-xs ml-3">{entry.year}</span>}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/admin/resume/${entry.id}`} className="text-dim hover:text-foreground transition-colors"><Edit className="w-4 h-4" /></Link>
                    <DeleteResumeButton id={entry.id} title={entry.title} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
