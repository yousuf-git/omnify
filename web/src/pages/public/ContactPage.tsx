import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Please enter your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (form.message.trim().length < 10) e.message = "Tell us a little more (10+ characters)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validate()) setSent(true);
  };

  const field = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm({ ...form, [k]: e.target.value });
      setErrors({ ...errors, [k]: "" });
    },
  });

  return (
    <section className="mx-auto max-w-7xl px-5 pt-40 pb-32 sm:px-8">
      <div className="grid grid-cols-1 gap-20 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-logo text-5xl md:text-7xl font-extrabold uppercase tracking-tight text-[var(--omni-ink)]"
          >
            Let's talk.
          </motion.h1>
          <p className="mt-8 max-w-md font-mono text-[16px] text-[var(--omni-text-secondary)] leading-relaxed">
            Booking a demo, provisioning a new company, or just exploring? Reach out and an engineer
            will get back to you within one business day.
          </p>

          <div className="mt-16 space-y-10">
            <a href="mailto:hello@omnify.app" className="flex items-center gap-6 group">
              <span className="grid h-12 w-12 place-items-center border border-[var(--omni-border)] text-[var(--omni-ink)] group-hover:bg-[var(--omni-ink)] group-hover:text-white transition-colors"><Mail size={20} /></span>
              <span><span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--omni-text-muted)]">Email</span><span className="font-mono text-[15px] font-bold text-[var(--omni-ink)]">hello@omnify.app</span></span>
            </a>
            <div className="flex items-center gap-6 group">
              <span className="grid h-12 w-12 place-items-center border border-[var(--omni-border)] text-[var(--omni-ink)] group-hover:bg-[var(--omni-ink)] group-hover:text-white transition-colors"><MapPin size={20} /></span>
              <span><span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--omni-text-muted)]">Hours</span><span className="font-mono text-[15px] font-bold text-[var(--omni-ink)]">Mon–Fri · 9:00–18:00</span></span>
            </div>
          </div>
        </div>

        <div className="border-2 border-[var(--omni-ink)] bg-white p-10 md:p-14 shadow-[16px_16px_0px_0px_var(--omni-brand)]">
          {sent ? (
            <div className="flex h-full flex-col items-center justify-center py-20 text-center">
              <CheckCircle2 size={64} className="text-[var(--omni-brand)]" />
              <h3 className="mt-8 font-logo text-3xl font-extrabold uppercase tracking-tight text-[var(--omni-ink)]">Message sent</h3>
              <p className="mt-4 font-mono text-[15px] text-[var(--omni-text-secondary)]">Thanks, {form.name.split(" ")[0]} — we'll be in touch.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-8" noValidate>
              <Field label="Full name" error={errors.name}>
                <input {...field("name")} className={inputCls(errors.name)} placeholder="Jane Cooper" />
              </Field>
              <Field label="Work email" error={errors.email}>
                <input {...field("email")} type="email" className={inputCls(errors.email)} placeholder="jane@company.com" />
              </Field>
              <Field label="Company">
                <input {...field("company")} className={inputCls()} placeholder="Acme Depot" />
              </Field>
              <Field label="Message" error={errors.message}>
                <textarea {...field("message")} rows={4} className={inputCls(errors.message)} placeholder="What would you like to know?" />
              </Field>
              <button type="submit" className="group flex w-full items-center justify-center gap-3 bg-[var(--omni-ink)] px-8 py-5 text-[14px] font-mono font-bold uppercase tracking-widest text-white transition-transform hover:-translate-y-1 shadow-[0_8px_0_0_var(--omni-brand)] hover:shadow-[0_12px_0_0_var(--omni-brand)]">
                Send message <Send size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function inputCls(error?: string) {
  return `mt-2 w-full rounded-none border-2 border-b-4 bg-[var(--omni-bg-subtle)] px-5 py-4 font-mono text-[14px] text-[var(--omni-ink)] outline-none transition-colors focus:border-[var(--omni-brand)] focus:bg-white ${
    error ? "border-rose-400" : "border-[var(--omni-border)]"
  }`;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--omni-text-secondary)]">{label}</span>
      {children}
      {error && <span className="mt-2 block font-mono text-[11px] font-bold uppercase tracking-widest text-rose-500">{error}</span>}
    </label>
  );
}
