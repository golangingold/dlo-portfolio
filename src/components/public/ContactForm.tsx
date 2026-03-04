"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="text-center py-12">
        <div className="text-accent text-4xl mb-4">&#10003;</div>
        <h3 className="font-display text-2xl tracking-wider mb-2">
          Message Sent
        </h3>
        <p className="text-muted">
          Thank you for reaching out. I&apos;ll get back to you soon.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-accent text-sm uppercase tracking-wider hover:text-accent-light transition-colors"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm uppercase tracking-wider text-muted mb-2">
          Name
        </label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-surface-light border border-border text-foreground rounded-md px-4 py-3 focus:outline-none focus:border-accent transition-colors"
          placeholder="Your name"
        />
      </div>
      <div>
        <label className="block text-sm uppercase tracking-wider text-muted mb-2">
          Email
        </label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full bg-surface-light border border-border text-foreground rounded-md px-4 py-3 focus:outline-none focus:border-accent transition-colors"
          placeholder="your@email.com"
        />
      </div>
      <div>
        <label className="block text-sm uppercase tracking-wider text-muted mb-2">
          Subject
        </label>
        <input
          type="text"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="w-full bg-surface-light border border-border text-foreground rounded-md px-4 py-3 focus:outline-none focus:border-accent transition-colors"
          placeholder="Inquiry subject"
        />
      </div>
      <div>
        <label className="block text-sm uppercase tracking-wider text-muted mb-2">
          Message
        </label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full bg-surface-light border border-border text-foreground rounded-md px-4 py-3 focus:outline-none focus:border-accent transition-colors resize-none"
          placeholder="Tell me about your project..."
        />
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full bg-accent text-background font-medium py-3 rounded-md uppercase tracking-wider text-sm hover:bg-accent-light transition-colors disabled:opacity-50"
      >
        {status === "sending" ? "Sending..." : "Send Message"}
      </button>
      {status === "error" && (
        <p className="text-red-400 text-sm text-center">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
