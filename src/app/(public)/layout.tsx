import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import SmoothScroll from "@/components/public/SmoothScroll";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScroll>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </SmoothScroll>
  );
}
