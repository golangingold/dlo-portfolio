import { prisma } from "@/lib/prisma";
import RevealOnScroll from "@/components/public/RevealOnScroll";

export const metadata = {
  title: "Resume | DeAngelo",
  description: "DeAngelo's acting and modeling credits — film, television, commercial, print, and more.",
};

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

export default async function ResumePage() {
  const entries = await prisma.resumeEntry.findMany({
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
  });

  const grouped = entries.reduce((acc, entry) => {
    if (!acc[entry.type]) acc[entry.type] = [];
    acc[entry.type].push(entry);
    return acc;
  }, {} as Record<string, typeof entries>);

  return (
    <main className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <RevealOnScroll>
          <h1 className="text-4xl md:text-5xl font-display tracking-wider text-center mb-4">Resume</h1>
          <div className="w-12 h-0.5 bg-accent mx-auto mb-12" />
        </RevealOnScroll>

        {entries.length === 0 ? (
          <p className="text-center text-dim">Resume coming soon.</p>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([type, items], groupIdx) => (
              <RevealOnScroll key={type} delay={groupIdx * 0.1}>
                <div>
                  <h2 className="text-accent font-display tracking-wider text-lg mb-4 uppercase">
                    {TYPE_LABELS[type] || type}
                  </h2>
                  <div className="border-t border-border">
                    {items.map((entry) => (
                      <div
                        key={entry.id}
                        className="grid grid-cols-3 gap-4 py-3 border-b border-border/50 text-sm"
                      >
                        <span className="text-foreground font-medium">{entry.title}</span>
                        <span className="text-muted">{entry.role}</span>
                        <span className="text-dim text-right">{entry.company || entry.director}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
