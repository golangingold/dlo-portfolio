"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Image,
  FolderOpen,
  User,
  CreditCard,
  Mail,
  Inbox,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Image,
  FolderOpen,
  User,
  CreditCard,
  Mail,
  Inbox,
  Settings,
};

export function AdminSidebar({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null };
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-surface border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <Link href="/admin" className="font-display text-lg font-bold text-foreground">
            DeAngelo <span className="text-accent">Admin</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {siteConfig.adminLinks.map((link) => {
              const Icon = iconMap[link.icon];
              const isActive =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent/10 text-accent"
                        : "text-muted hover:bg-surface-light hover:text-foreground"
                    )}
                  >
                    {Icon && <Icon className="w-4 h-4 shrink-0" />}
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-border p-4">
          <div className="text-sm text-muted mb-2 truncate">
            {user.email}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 text-sm text-dim hover:text-foreground transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Top header bar */}
        <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted hover:text-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block text-sm text-muted">
            Welcome back, <span className="text-foreground">{user.name || "Admin"}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-dim hover:text-foreground transition-colors"
              target="_blank"
            >
              View Site
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
