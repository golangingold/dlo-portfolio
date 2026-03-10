import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Comp Card | DeAngelo",
  description: "DeAngelo Blackwell — Model comp card with measurements and portfolio images.",
};

export default async function CompCardPage() {
  const about = await prisma.about.findFirst();

  return (
    <div className="pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {about?.compCardImageUrl ? (
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={about.compCardImageUrl}
              alt="DeAngelo Blackwell — Comp Card"
              className="max-w-full rounded-sm shadow-2xl"
            />
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted">Comp card coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
