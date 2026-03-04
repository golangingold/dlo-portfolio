import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { MessageViewer } from "./MessageViewer";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const submissions = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  const unreadCount = submissions.filter((s) => !s.isRead).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display tracking-wider">Messages</h1>
        <p className="text-muted text-sm mt-1">
          {submissions.length} total{unreadCount > 0 && ` · ${unreadCount} unread`}
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-surface rounded-lg border border-border p-12 text-center text-dim text-sm">
          No messages yet. Contact form submissions will appear here.
        </div>
      ) : (
        <div className="bg-surface rounded-lg border border-border divide-y divide-border">
          {submissions.map((sub) => (
            <div key={sub.id} className="px-4 py-3 flex items-start gap-4">
              <div className="shrink-0 mt-1">
                {!sub.isRead && (
                  <div className="w-2 h-2 rounded-full bg-accent" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-medium ${sub.isRead ? "text-muted" : "text-foreground"}`}>
                    {sub.name}
                  </span>
                  <span className="text-dim text-xs">{sub.email}</span>
                  <span className="text-dim text-xs ml-auto">{formatDate(sub.createdAt)}</span>
                </div>
                {sub.subject && (
                  <div className="text-sm text-muted mb-1">{sub.subject}</div>
                )}
                <p className="text-dim text-sm line-clamp-2">{sub.message}</p>
              </div>
              <MessageViewer id={sub.id} isRead={sub.isRead} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
