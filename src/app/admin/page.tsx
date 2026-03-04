import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Image,
  FolderOpen,
  FileText,
  Inbox,
  Plus,
  ArrowRight,
} from "lucide-react";

async function getDashboardStats() {
  const [photoCount, categoryCount, resumeCount, unreadCount] =
    await Promise.all([
      prisma.photo.count(),
      prisma.category.count(),
      prisma.resumeEntry.count(),
      prisma.contactSubmission.count({ where: { isRead: false } }),
    ]);

  return { photoCount, categoryCount, resumeCount, unreadCount };
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      label: "Photos",
      value: stats.photoCount,
      icon: Image,
      href: "/admin/photos",
      color: "text-blue-400",
    },
    {
      label: "Categories",
      value: stats.categoryCount,
      icon: FolderOpen,
      href: "/admin/categories",
      color: "text-emerald-400",
    },
    {
      label: "Resume Entries",
      value: stats.resumeCount,
      icon: FileText,
      href: "/admin/resume",
      color: "text-purple-400",
    },
    {
      label: "Unread Messages",
      value: stats.unreadCount,
      icon: Inbox,
      href: "/admin/messages",
      color: "text-accent",
    },
  ];

  const quickActions = [
    { label: "Upload Photos", href: "/admin/photos/new", icon: Plus },
    { label: "Add Resume Entry", href: "/admin/resume/new", icon: Plus },
    { label: "Edit About Page", href: "/admin/about", icon: ArrowRight },
    { label: "View Messages", href: "/admin/messages", icon: ArrowRight },
    { label: "Site Settings", href: "/admin/settings", icon: ArrowRight },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted text-sm mt-1">
          Overview of your portfolio content
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-surface rounded-lg border border-border p-6 hover:border-accent/30 transition-colors group"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <ArrowRight className="w-4 h-4 text-dim group-hover:text-accent transition-colors" />
              </div>
              <div className="text-3xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-sm text-muted mt-1">{stat.label}</div>
            </Link>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 rounded-md bg-surface-light border border-border px-4 py-3 text-sm font-medium text-muted hover:text-foreground hover:border-accent/30 transition-colors"
              >
                <Icon className="w-4 h-4 text-accent" />
                {action.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
