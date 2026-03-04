import { prisma } from "@/lib/prisma";
import { extractVideoId } from "@/lib/utils";
import RevealOnScroll from "@/components/public/RevealOnScroll";

export const metadata = {
  title: "Demo Reel | DeAngelo",
  description: "Watch DeAngelo's demo reels — acting, modeling, and commercial work.",
};

export default async function ReelPage() {
  const reels = await prisma.demoReel.findMany({
    orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
  });

  const primary = reels.find((r) => r.isPrimary) || reels[0];
  const others = reels.filter((r) => r.id !== primary?.id);

  function getEmbedUrl(url: string) {
    const videoId = extractVideoId(url);
    if (!videoId) return null;
    if (url.includes("vimeo")) return `https://player.vimeo.com/video/${videoId}`;
    return `https://www.youtube.com/embed/${videoId}`;
  }

  return (
    <main className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <RevealOnScroll>
          <h1 className="text-4xl md:text-5xl font-display tracking-wider text-center mb-4">Demo Reel</h1>
          <div className="w-12 h-0.5 bg-accent mx-auto mb-12" />
        </RevealOnScroll>

        {reels.length === 0 ? (
          <p className="text-center text-dim">Demo reel coming soon.</p>
        ) : (
          <>
            {/* Primary Reel */}
            {primary && (
              <RevealOnScroll>
                <div className="mb-12">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-surface border border-border">
                    {getEmbedUrl(primary.videoUrl) ? (
                      <iframe
                        src={getEmbedUrl(primary.videoUrl)!}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-dim">
                        <a href={primary.videoUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-light">
                          Watch on external site
                        </a>
                      </div>
                    )}
                  </div>
                  <h2 className="text-lg font-display tracking-wider mt-4 text-center">{primary.title}</h2>
                </div>
              </RevealOnScroll>
            )}

            {/* Additional Reels */}
            {others.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                {others.map((reel, i) => (
                  <RevealOnScroll key={reel.id} delay={i * 0.1}>
                    <div>
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-surface border border-border">
                        {getEmbedUrl(reel.videoUrl) ? (
                          <iframe
                            src={getEmbedUrl(reel.videoUrl)!}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-dim">
                            <a href={reel.videoUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-light">
                              Watch
                            </a>
                          </div>
                        )}
                      </div>
                      <h3 className="text-sm font-display tracking-wider mt-3">{reel.title}</h3>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
