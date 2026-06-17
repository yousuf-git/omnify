import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Boxes, ArrowRight, ShieldCheck, MousePointerClick, Database, Clock, Loader2 } from "lucide-react";
import { startSandbox, hasSandboxSession, validateSandbox, disableSandbox } from "../../sandbox/sandboxMode";

const roles = [
  { value: "admin", label: "Admin", hint: "Full access incl. settings" },
  { value: "manager", label: "Manager", hint: "Operations & master data" },
  { value: "staff", label: "Staff", hint: "Day-to-day records" },
  { value: "viewer", label: "Viewer", hint: "Read-only" },
];

export default function SandboxGate() {
  const [form, setForm] = useState({ company: "", name: "", email: "", role: "admin" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  // A non-expired session token may already exist (user returned within 6h).
  const [hasPrev, setHasPrev] = useState(() => hasSandboxSession());

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.company.trim().length < 2) e.company = "Enter your company name";
    if (form.name.trim().length < 2) e.name = "Enter your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const enter = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate() || loading) return;
    setSubmitErr("");
    setLoading(true);
    try {
      await startSandbox(form);
      window.location.href = "/dashboard";
    } catch {
      setSubmitErr("Could not start the sandbox. Is the server running?");
      setLoading(false);
    }
  };

  const resume = async () => {
    if (loading) return;
    setLoading(true);
    if (await validateSandbox()) {
      window.location.href = "/dashboard";
    } else {
      disableSandbox();
      setHasPrev(false);
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-white lg:grid-cols-2">
      {/* Brand / pitch */}
      <div className="relative hidden overflow-hidden bg-[var(--omni-ink)] p-10 lg:p-12 text-white lg:flex lg:flex-col lg:justify-between border-r-4 border-[var(--omni-brand)]">
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        
        <Link to="/" className="relative z-10 group flex items-baseline gap-0.5">
          <span className="font-logo text-3xl font-extrabold tracking-[-0.04em] text-white">omnify</span>
          <span className="h-2 w-2 translate-y-[-1px] rounded-full bg-[var(--omni-brand)] transition-transform group-hover:scale-150" />
        </Link>

        <div className="relative z-10">
          <Boxes size={40} className="text-[var(--omni-brand)]" />
          <h1 className="mt-6 font-logo text-4xl md:text-5xl font-extrabold uppercase tracking-tight leading-[0.9]">
            Explore the <br/> full system.
          </h1>
          <p className="mt-4 max-w-md font-mono text-[14px] leading-relaxed text-white/60">
            Tell us a little about you, then jump straight into a fully interactive environment loaded
            with realistic data.
          </p>
          <ul className="mt-6 space-y-3">
            <li className="flex items-center gap-4 font-mono text-[12px] uppercase tracking-wide text-white/80"><ShieldCheck size={18} className="text-emerald-400" /> No signup, no credit card</li>
            <li className="flex items-center gap-4 font-mono text-[12px] uppercase tracking-wide text-white/80"><MousePointerClick size={18} className="text-[var(--omni-brand)]" /> Add, edit and delete — it works</li>
            <li className="flex items-center gap-4 font-mono text-[12px] uppercase tracking-wide text-white/80"><Database size={18} className="text-[var(--omni-brand)]" /> Changes stay in your browser</li>
          </ul>
        </div>

        <p className="relative z-10 font-mono text-[10px] font-bold uppercase tracking-widest text-white/30">Sandbox data never touches a real company.</p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 sm:p-10 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <h2 className="font-logo text-3xl font-extrabold uppercase tracking-tight text-[var(--omni-ink)]">
            Initialize Sandbox
          </h2>
          <p className="mt-2 font-mono text-[13px] text-[var(--omni-text-secondary)]">Sequence takes ~10 seconds.</p>

          {hasPrev && (
            <div className="mt-6 border-2 border-b-4 border-[var(--omni-brand)] bg-[var(--omni-bg-subtle)] p-4">
              <div className="flex items-center gap-2 text-[var(--omni-ink)]">
                <Clock size={16} className="text-[var(--omni-brand)]" />
                <span className="font-mono text-[12px] font-bold uppercase tracking-widest">Previous session found</span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-[var(--omni-text-secondary)]">
                Your sandbox is still active. Pick up where you left off.
              </p>
              <button
                type="button"
                onClick={resume}
                disabled={loading}
                className="group mt-3 flex w-full items-center justify-center gap-2 bg-[var(--omni-brand)] px-6 py-3 text-[12px] font-mono font-bold uppercase tracking-widest text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                Continue previous session
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <p className="mt-3 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--omni-text-muted)]">
                — or start fresh below —
              </p>
            </div>
          )}

          <form onSubmit={enter} className="mt-8 space-y-5" noValidate>
            <Field label="Company name" error={errors.company}>
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className={inputCls(errors.company)}
                placeholder="Acme Depot"
              />
            </Field>
            <Field label="Your name" error={errors.name}>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls(errors.name)}
                placeholder="Jane Cooper"
              />
            </Field>
            <Field label="Work email" error={errors.email}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputCls(errors.email)}
                placeholder="jane@company.com"
              />
            </Field>

            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--omni-text-secondary)] block mb-2">Explore as</span>
              <div className="grid grid-cols-2 gap-px bg-[var(--omni-border)] border border-[var(--omni-border)]">
                {roles.map((r) => (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`p-3 text-left transition-colors bg-white hover:bg-[var(--omni-bg-subtle)] ${
                      form.role === r.value
                        ? "shadow-[inset_0_0_0_2px_var(--omni-brand)]"
                        : ""
                    }`}
                  >
                    <span className={`block font-mono text-[13px] font-bold uppercase tracking-tight ${form.role === r.value ? "text-[var(--omni-brand)]" : "text-[var(--omni-ink)]"}`}>{r.label}</span>
                    <span className="block mt-0.5 text-[10px] font-medium leading-tight text-[var(--omni-text-muted)]">{r.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {submitErr && (
              <p className="font-mono text-[12px] font-bold uppercase tracking-widest text-rose-500">{submitErr}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-3 bg-[var(--omni-ink)] px-8 py-4 text-[13px] font-mono font-bold uppercase tracking-widest text-white transition-transform hover:-translate-y-1 shadow-[0_8px_0_0_var(--omni-brand)] hover:shadow-[0_12px_0_0_var(--omni-brand)] mt-8 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  Initializing
                  <Loader2 size={18} className="animate-spin" />
                </>
              ) : (
                <>
                  Enter the sandbox
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--omni-text-muted)]">
            <Link to="/" className="hover:text-[var(--omni-brand)] transition-colors">← Back to home</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function inputCls(error?: string) {
  return `mt-1.5 w-full rounded-none border-2 border-b-4 bg-[var(--omni-bg-subtle)] px-4 py-3 font-mono text-[13px] text-[var(--omni-ink)] outline-none transition-colors focus:border-[var(--omni-brand)] focus:bg-white ${
    error ? "border-rose-400" : "border-[var(--omni-border)]"
  }`;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--omni-text-secondary)]">{label}</span>
      {children}
      {error && <span className="mt-1.5 block font-mono text-[11px] font-bold uppercase tracking-widest text-rose-500">{error}</span>}
    </label>
  );
}
