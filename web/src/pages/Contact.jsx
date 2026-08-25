import { useState } from "react";
import Seo from "../seo/Seo.jsx";
import { api } from "../api/client.js";

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email";
  if (form.message.trim().length < 10) errors.message = "Message should be at least 10 characters";
  return errors;
}

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | done | error

  function field(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    try {
      await api.sendContactLead(form);
      setStatus("done");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="container-page max-w-xl py-16">
      <Seo title="Contact us" path="/contact" description="Get in touch with the Slekco team." />
      <h1 className="text-3xl">Contact us</h1>
      <p className="mt-2 text-ink/60">Questions about an order, a product, or a partnership? Send a note.</p>

      {status === "done" ? (
        <div className="card mt-8 p-6 text-sm">
          Thanks — your message has been received. We'll get back to you soon.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-3" noValidate>
          <div>
            <input className="input" placeholder="Your name" value={form.name} onChange={field("name")} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>
          <div>
            <input className="input" placeholder="Email" value={form.email} onChange={field("email")} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
          <input className="input" placeholder="Subject (optional)" value={form.subject} onChange={field("subject")} />
          <div>
            <textarea
              className="input min-h-32"
              placeholder="Your message"
              value={form.message}
              onChange={field("message")}
            />
            {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
          </div>
          {status === "error" && (
            <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
          )}
          <button type="submit" disabled={status === "submitting"} className="btn-primary w-full disabled:opacity-50">
            {status === "submitting" ? "Sending…" : "Send message"}
          </button>
        </form>
      )}
    </div>
  );
}
