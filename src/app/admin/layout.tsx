import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "./AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <AdminSidebar user={session.user}>{children}</AdminSidebar>;
}
