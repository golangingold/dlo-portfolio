import Link from "next/link";
import { Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link
            href="/"
            className="font-display text-xl tracking-[0.2em] text-foreground hover:text-accent transition-colors"
          >
            DEANGELO
          </Link>

          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com/_dngeloblackwell"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-accent transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>
            <a
              href="#"
              className="text-muted hover:text-accent transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
          </div>

          <p className="text-dim text-sm">
            &copy; {new Date().getFullYear()} DeAngelo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
