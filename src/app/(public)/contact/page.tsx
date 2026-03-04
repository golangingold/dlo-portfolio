import { prisma } from "@/lib/prisma";
import ContactForm from "@/components/public/ContactForm";
import RevealOnScroll from "@/components/public/RevealOnScroll";

export const metadata = {
  title: "Contact | DeAngelo",
  description: "Get in touch with DeAngelo for bookings, collaborations, and inquiries.",
};

export default async function ContactPage() {
  const contact = await prisma.contactInfo.findUnique({ where: { id: "default" } });

  return (
    <main className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <RevealOnScroll>
          <h1 className="text-4xl md:text-5xl font-display tracking-wider text-center mb-4">Contact</h1>
          <p className="text-muted text-center mb-12 max-w-xl mx-auto">
            Interested in working together? Send a message or reach out directly.
          </p>
        </RevealOnScroll>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Form */}
          <RevealOnScroll>
            <ContactForm />
          </RevealOnScroll>

          {/* Info */}
          <RevealOnScroll delay={0.2}>
            <div className="space-y-8">
              {contact?.email && (
                <div>
                  <h3 className="text-sm text-accent tracking-wider uppercase mb-2">Email</h3>
                  <a href={`mailto:${contact.email}`} className="text-foreground hover:text-accent transition-colors">
                    {contact.email}
                  </a>
                </div>
              )}

              {contact?.location && (
                <div>
                  <h3 className="text-sm text-accent tracking-wider uppercase mb-2">Location</h3>
                  <p className="text-muted">{contact.location}</p>
                </div>
              )}

              {contact?.agencyName && (
                <div>
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
                    <p className="text-muted">{contact.agencyName}</p>
                  )}
                </div>
              )}

              {/* Social Links */}
              {(contact?.instagramUrl || contact?.tiktokUrl || contact?.linkedinUrl || contact?.imdbUrl) && (
                <div>
                  <h3 className="text-sm text-accent tracking-wider uppercase mb-3">Follow</h3>
                  <div className="flex flex-wrap gap-3">
                    {contact.instagramUrl && (
                      <a
                        href={contact.instagramUrl.startsWith("http") ? contact.instagramUrl : `https://instagram.com/${contact.instagramUrl.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted hover:text-accent transition-colors px-3 py-1.5 border border-border rounded-full"
                      >
                        Instagram
                      </a>
                    )}
                    {contact.tiktokUrl && (
                      <a
                        href={contact.tiktokUrl.startsWith("http") ? contact.tiktokUrl : `https://tiktok.com/${contact.tiktokUrl.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted hover:text-accent transition-colors px-3 py-1.5 border border-border rounded-full"
                      >
                        TikTok
                      </a>
                    )}
                    {contact.linkedinUrl && (
                      <a
                        href={contact.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted hover:text-accent transition-colors px-3 py-1.5 border border-border rounded-full"
                      >
                        YouTube
                      </a>
                    )}
                    {contact.imdbUrl && (
                      <a
                        href={contact.imdbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted hover:text-accent transition-colors px-3 py-1.5 border border-border rounded-full"
                      >
                        IMDb
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </main>
  );
}
