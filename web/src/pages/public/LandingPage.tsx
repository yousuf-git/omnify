import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Boxes, Barcode, Ticket, Building2, ShieldCheck, Repeat, Plus, Minus,
  ArrowRight, Warehouse, FileSpreadsheet, Zap,
} from "lucide-react";
import Hero from "../../components/public/Hero";

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

const logos = ["Core Tech Solutions", "Acme Depot", "Stark Supply", "Globex", "Umbrella", "Initech"];

const steps = [
  { n: "01", t: "Provision a company", d: "Super-admin spins up a tenant and its admin — isolated data from minute one." },
  { n: "02", t: "Load your catalog", d: "Import items, groups and serial numbers via CSV or add them inline." },
  { n: "03", t: "Move & resolve", d: "Record stock in/out, raise tickets, and track installation to delivery." },
];

const faqs = [
  { q: "How does the multi-tenancy model actually work?", a: "Omnify is built for holding companies, franchises, and multi-region operators. Each 'tenant' represents an isolated company with its own ledger, inventory, and users. A master admin can oversee all tenants from a single console, but a tenant user can only access their own company's data, strictly enforced at the database level." },
  { q: "Does it support granular serial number tracking?", a: "Yes. You can track individual units from intake (Stock In) through to deployment or field service. When an item is moved to a warehouse or assigned to a ticket, its specific serial number travels with it, providing a complete audit trail." },
  { q: "How does the 'Yearly Rollover' feature handle financial years?", a: "At the end of your designated financial year, Omnify automatically snapshots the closing balances of all stock across all warehouses. This becomes the opening balance for the new year, ensuring your historical ledgers remain immutable and audit-ready." },
  { q: "Is there a limit to the number of warehouses or stock locations?", a: "No. You can define unlimited warehouses, stores, and field locations. The system tracks items in transit between locations and ensures stock visibility is restricted to the correct local managers." },
];

export default function LandingPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <Hero />

      {/* Social proof */}
      <section className="border-y border-[var(--omni-border)] bg-white py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-center font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--omni-text-muted)]">
            Trusted by operations teams across 12 countries
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {logos.map((l) => (
              <span key={l} className="font-logo text-xl font-bold uppercase tracking-wider text-[var(--omni-text-muted)] opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0">
                {l}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Structured Features */}
      <section className="mx-auto max-w-7xl px-5 py-32 sm:px-8">
        <Reveal>
          <h2 className="max-w-3xl font-logo text-4xl md:text-6xl font-extrabold uppercase tracking-tight text-[var(--omni-ink)]">
            Everything inventory,<br />nothing you don't need.
          </h2>
          <p className="mt-6 max-w-xl font-mono text-[15px] leading-relaxed text-[var(--omni-text-secondary)]">
            A focused, highly-structured toolkit for stock, warehousing and field service — built to scale across
            many companies at once without clutter.
          </p>
        </Reveal>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--omni-border)] border border-[var(--omni-border)]">
          {/* large tile */}
          <div className="md:col-span-1 md:row-span-2 bg-[var(--omni-ink)] p-10 flex flex-col justify-between text-white group transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold tracking-widest text-white/40 uppercase">[01] CORE ENGINE</span>
              <Boxes size={24} className="text-[var(--omni-brand)]" />
            </div>
            <div className="mt-32">
              <h3 className="font-mono text-2xl font-bold uppercase tracking-tight">Stock in & out, tracked to the unit</h3>
              <p className="mt-6 text-[14px] leading-relaxed text-white/60 font-medium">
                Multi-item transactions, invoice references, warehouse routing and a running
                ledger with opening/closing balances per financial year.
              </p>
            </div>
          </div>

          <FeatureTile idx="02" icon={<Barcode size={22} />} title="Serial numbers" desc="Track individual units from intake to install, each linked to its ticket history." />
          <FeatureTile idx="03" icon={<Ticket size={22} />} title="Field tickets" desc="Installation & support tickets with statuses, ratings and resolution dates." />
          <FeatureTile idx="04" icon={<Building2 size={22} />} title="Parties & resellers" desc="Model your whole distribution network with cities, states and agencies." />
          <FeatureTile idx="05" icon={<ShieldCheck size={22} />} title="Multi-tenancy" desc="Per-company isolation enforced at the data layer — not just the UI." />
          <FeatureTile idx="06" icon={<Warehouse size={22} />} title="Warehouses" desc="Route stock across multiple locations with strict per-warehouse visibility." />
          <FeatureTile idx="07" icon={<FileSpreadsheet size={22} />} title="Bulk CSV tools" desc="Load agencies, parties, items and history instantly with structural validation." />
        </div>
      </section>

      {/* Engineering Stats */}
      <section className="border-y border-[var(--omni-ink)] bg-[var(--omni-ink)] text-white">
        <div className="mx-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/20">
          {[
            ["12k+", "items under management"],
            ["99.9%", "accuracy across tenants"],
            ["40%", "faster ticket resolution"],
            ["12", "countries served"],
          ].map(([big, small], i) => (
            <div key={i} className="flex-1 p-12 md:p-16 hover:bg-white/5 transition-colors">
              <Reveal delay={i * 0.1}>
                <div className="font-mono text-5xl lg:text-6xl font-bold tracking-tighter">{big}</div>
                <div className="mt-4 font-mono text-[10px] font-bold uppercase tracking-widest text-white/50">{small}</div>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* 3 Steps - Architectural Grid */}
      <section className="mx-auto max-w-7xl px-5 py-32 sm:px-8">
        <Reveal>
          <h2 className="font-logo text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-[var(--omni-ink)]">
            Live in three steps.
          </h2>
        </Reveal>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--omni-border)] border-y border-[var(--omni-border)]">
          {steps.map((s, i) => (
            <div key={s.n} className="bg-white p-10 md:p-14 hover:bg-[var(--omni-bg-subtle)] transition-colors group">
              <Reveal delay={i * 0.1}>
                <div className="font-logo text-6xl font-extrabold text-[var(--omni-ink)] opacity-10 transition-opacity group-hover:opacity-20">{s.n}</div>
                <h3 className="mt-12 font-mono text-lg font-bold uppercase tracking-tight text-[var(--omni-ink)]">{s.t}</h3>
                <p className="mt-4 text-[14px] leading-relaxed text-[var(--omni-text-secondary)] font-medium">{s.d}</p>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* Sharp Reviews */}
      <section className="border-y border-[var(--omni-border)] bg-[var(--omni-bg-subtle)] py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <h2 className="font-logo text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-[var(--omni-ink)]">
              Operators don't go back.
            </h2>
          </Reveal>
          <div className="mt-16 grid grid-cols-1 gap-px bg-[var(--omni-border)] lg:grid-cols-3 border border-[var(--omni-border)] shadow-sm">
            {[
              { q: "We cut stock reconciliation from two days to under an hour. The per-warehouse ledger is exactly what we were missing.", n: "Priya Nair", r: "Ops Lead, Northwind" },
              { q: "Running six regional companies on one login — with data that never bleeds across tenants — changed how we operate.", n: "Marcus Hale", r: "COO, Stark Supply Co." },
              { q: "Installation tickets tied to serial numbers means our field team finally has the full history in one centralized ledger.", n: "Lena Fischer", r: "Service Manager, Globex" },
            ].map((t, i) => (
              <div key={t.n} className="bg-white p-10 flex flex-col justify-between hover:bg-[var(--omni-bg-muted)] transition-colors">
                <Reveal delay={i * 0.1}>
                  <blockquote className="font-mono text-[14px] leading-relaxed text-[var(--omni-ink)]">"{t.q}"</blockquote>
                  <figcaption className="mt-12 pt-6 border-t border-[var(--omni-border)] flex items-center justify-between">
                    <div>
                      <span className="block text-[13px] font-bold text-[var(--omni-ink)]">{t.n}</span>
                      <span className="block mt-1 text-[10px] font-mono font-bold text-[var(--omni-text-muted)] uppercase tracking-wider">{t.r}</span>
                    </div>
                  </figcaption>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Smooth Animated FAQ */}
      <section className="mx-auto max-w-4xl px-5 py-32 sm:px-8">
        <Reveal>
          <h2 className="font-logo text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-[var(--omni-ink)]">
            Questions, answered.
          </h2>
        </Reveal>
        
        <div className="mt-16 border-y border-[var(--omni-border)]">
          {faqs.map((f, i) => (
            <div key={f.q} className="border-b border-[var(--omni-border)] last:border-b-0">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between py-6 text-left hover:text-[var(--omni-brand)] transition-colors"
              >
                <span className="font-mono text-[13px] font-bold uppercase tracking-widest text-[var(--omni-ink)]">{f.q}</span>
                <span className="text-[var(--omni-ink)] shrink-0">
                  <motion.div animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.2 }}>
                    <Plus size={20} strokeWidth={2.5} />
                  </motion.div>
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pb-8 pt-2 text-[15px] leading-relaxed text-[var(--omni-text-secondary)] font-medium max-w-2xl">
                      {f.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Brutalist CTA Banner */}
      <section className="px-5 py-24 sm:px-8 bg-white flex justify-center mb-10">
        <div className="relative w-full max-w-6xl border-2 border-[var(--omni-ink)] bg-[var(--omni-ink)] p-12 md:p-24 text-center text-white shadow-[16px_16px_0px_0px_var(--omni-brand)] transition-transform hover:-translate-y-1 hover:translate-x-[-4px] hover:shadow-[20px_20px_0px_0px_var(--omni-brand)]">
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.05]" 
            style={{ 
              backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", 
              backgroundSize: "32px 32px" 
            }} 
          />
          
          <Zap size={40} className="mx-auto mb-8 text-[var(--omni-brand)] fill-[var(--omni-brand)]" />
          <h2 className="font-logo text-5xl md:text-7xl font-extrabold uppercase tracking-tight leading-[0.9]">
            See Omnify <br/> with your own data.
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-[15px] font-mono text-white/60 leading-relaxed">
            Explore the full product in the sandbox — no signup, no credit card. Every feature, real sample data, instantly.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 relative z-10">
            <Link to="/sandbox" className="group flex items-center gap-2 bg-white px-8 py-4 text-[14px] font-mono font-bold uppercase tracking-widest text-[var(--omni-ink)] transition-transform hover:-translate-y-1 shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
              Open the sandbox
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/contact" className="flex items-center gap-2 border border-white/20 px-8 py-4 text-[14px] font-mono font-bold uppercase tracking-widest text-white transition-colors hover:bg-white/10">
              Talk to us
            </Link>
          </div>
          <p className="mt-10 font-mono text-[10px] uppercase tracking-widest text-white/30">
            Sandbox data stays in your browser · No account required
          </p>
        </div>
      </section>
    </>
  );
}

function FeatureTile({ icon, title, desc, idx }: { icon: ReactNode; title: string; desc: string; idx: string }) {
  return (
    <div className="group bg-white p-8 flex flex-col justify-between transition-colors hover:bg-[var(--omni-bg-subtle)]">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold tracking-widest text-[var(--omni-text-muted)] uppercase">[{idx}]</span>
        <span className="text-[var(--omni-ink)] opacity-40 transition-opacity group-hover:opacity-100 group-hover:text-[var(--omni-brand)]">
          {icon}
        </span>
      </div>
      <div className="mt-16">
        <h3 className="font-mono text-lg font-bold uppercase tracking-tight text-[var(--omni-ink)]">{title}</h3>
        <p className="mt-3 text-[14px] leading-relaxed text-[var(--omni-text-secondary)] font-medium">{desc}</p>
      </div>
    </div>
  );
}
