import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";
import Image from "next/image";
import RevealOnScroll from "@/components/public/RevealOnScroll";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About | DeAngelo",
  description: "Learn more about DeAngelo — model and creative based in San Francisco.",
};

export default async function AboutPage() {
  noStore();
  const about = await prisma.about.findUnique({ where: { id: "default" } });
  const contact = await prisma.contactInfo.findUnique({ where: { id: "default" } });

  const stats: { label: string; value: string }[] = about?.stats
    ? (() => {
        try { return JSON.parse(about.stats); } catch { return []; }
      })()
    : [];

  return (
    <main className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Portrait */}
          <RevealOnScroll>
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-surface">
              {about?.profileImageUrl ? (
                <Image
                  src={about.profileImageUrl}
                  alt="DeAngelo"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-dim">
                  No photo set
                </div>
              )}
            </div>
          </RevealOnScroll>

          {/* Bio */}
          <RevealOnScroll delay={0.2}>
            <div>
              <h1 className="text-4xl md:text-5xl font-display tracking-wider mb-2">
                {about?.headline || "About"}
              </h1>
              <div className="w-12 h-0.5 bg-accent mb-6" />

              {about?.bio ? (
                <div className="text-muted leading-relaxed space-y-4">
                  {about.bio.split("\n").filter(Boolean).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              ) : (
                <p className="text-dim">Bio coming soon.</p>
              )}

              {/* Stats */}
              {stats.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-border">
                  {stats.map((stat: { label: string; value: string }, i: number) => (
                    <div key={i}>
                      <div className="text-accent font-display text-lg">{stat.value}</div>
                      <div className="text-dim text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Agency */}
              {contact?.agencyName && (
                <div className="mt-8 pt-8 border-t border-border">
                  <h3 className="text-sm text-accent tracking-wider uppercase mb-2">Representation</h3>
                  {contact.agencyUrl ? (
                    <a
                      href={contact.agencyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:text-accent transition-colors"
                    >
                      {contact.agencyName}
                    </a>
                  ) : (
                    <span className="text-foreground">{contact.agencyName}</span>
                  )}
                </div>
              )}
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </main>
  );
}
