"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * TODO: not wired to a backend. The legacy form was cosmetic too — it
 * only flipped the button label. Connecting it needs an email service
 * (Resend/Formspree) behind a Server Action.
 */
export function ContactForm() {
  const [sent, setSent] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
        window.setTimeout(() => setSent(false), 3000);
      }}
      className="flex flex-col gap-6"
    >
      {[
        { id: "name", label: "Name", type: "text", required: true },
        { id: "email", label: "Email", type: "email", required: true },
        { id: "phone", label: "Phone", type: "tel", required: false },
      ].map((field) => (
        <div key={field.id}>
          <label htmlFor={field.id} className="eyebrow mb-2 block">
            {field.label}
          </label>
          <Input
            id={field.id}
            type={field.type}
            required={field.required}
            className="border-0 border-b border-rule bg-transparent px-0 shadow-none focus-visible:border-ink focus-visible:ring-0"
          />
        </div>
      ))}

      <div>
        <label htmlFor="message" className="eyebrow mb-2 block">
          Message
        </label>
        <textarea
          id="message"
          rows={4}
          required
          className="w-full resize-none border-0 border-b border-rule bg-transparent px-0 py-2 text-sm text-ink outline-none focus:border-ink"
        />
      </div>

      <Button
        type="submit"
        className="label mt-2 bg-ink py-6 text-paper hover:bg-ink/90"
      >
        {sent ? "Message sent" : "Send message"}
      </Button>

      <p className="text-xs text-ink-mute">
        This form is not connected to a mailbox yet — please reach us on
        WhatsApp for anything urgent.
      </p>
    </form>
  );
}
