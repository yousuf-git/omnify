import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Target, Compass, HeartHandshake, ShieldCheck, ArrowRight } from "lucide-react";

const values = [
  { icon: <Target size={22} />, t: "Focused, not bloated", d: "We build exactly what inventory and field-service teams need — and resist the rest." },
  { icon: <ShieldCheck size={22} />, t: "Isolation by default", d: "Every company's data is separated at the core, never as an afterthought." },
  { icon: <Compass size={22} />, t: "Operator-first", d: "Decisions are made from the warehouse floor, not the boardroom." },
  { icon: <HeartHandshake size={22} />, t: "Long-term partners", d: "We succeed when your operations run quieter, year after year." },
];

const milestones = [
  ["2023", "Omnify starts as an internal tool for a single distributor."],
  ["2024", "Rebuilt as a multi-tenant platform; first external companies onboard."],
  ["2025", "Field-service ticketing and serial tracking ship."],
  ["2026", "Serving operations teams across 12 countries."],
];

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto max-w-4xl px-5 pt-40 pb-20 text-center sm:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="font-logo text-5xl md:text-7xl font-extrabold uppercase tracking-tight text-[var(--omni-ink)]"
        >
          We make inventory<br/>feel calm.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="mx-auto mt-8 max-w-2xl font-mono text-[16px] text-[var(--omni-text-secondary)] leading-relaxed"
        >
          Omnify began on a warehouse floor, solving one company's stock chaos. Today it's a
          multi-tenant platform that lets any number of companies run their operations from a single, well-isolated system.
        </motion.p>
      </section>

      {/* Values Grid */}
      <section className="mx-auto max-w-7xl px-5 pb-32 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--omni-border)] border border-[var(--omni-border)]">
          {values.map((v, i) => (
            <div key={v.t} className="bg-white p-8 group transition-colors hover:bg-[var(--omni-bg-subtle)] flex flex-col justify-between min-h-[280px]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[var(--omni-text-muted)] tracking-widest uppercase">[{i + 1}]</span>
                <span className="text-[var(--omni-ink)] opacity-40 group-hover:text-[var(--omni-brand)] group-hover:opacity-100 transition-colors">
                  {v.icon}
                </span>
              </div>
              <div className="mt-16">
                <h3 className="font-mono text-[15px] font-bold uppercase tracking-tight text-[var(--omni-ink)]">{v.t}</h3>
                <p className="mt-4 text-[13px] font-medium leading-relaxed text-[var(--omni-text-secondary)]">{v.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Milestones */}
      <section className="border-y border-[var(--omni-ink)] bg-[var(--omni-ink)] py-32 text-white">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <h2 className="font-logo text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-center mb-20">System History.</h2>
          <div className="space-y-12">
            {milestones.map(([y, d]) => (
              <div key={y} className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-10 border-b border-white/10 pb-12 last:border-0 last:pb-0">
                <span className="font-mono text-3xl font-bold text-[var(--omni-brand)] tracking-tighter shrink-0">{y}</span>
                <p className="font-mono text-[15px] leading-relaxed text-white/70">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-32 text-center sm:px-8">
        <h2 className="font-logo text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-[var(--omni-ink)]">Want to see it in action?</h2>
        <div className="mt-12 flex flex-wrap justify-center gap-6">
          <Link to="/sandbox" className="group flex items-center gap-2 bg-[var(--omni-ink)] px-8 py-5 text-[14px] font-mono font-bold uppercase tracking-widest text-white transition-transform hover:-translate-y-1 shadow-[0_8px_0_0_var(--omni-brand)] hover:shadow-[0_12px_0_0_var(--omni-brand)]">
            Open the sandbox
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
          <Link to="/contact" className="flex items-center gap-2 border-2 border-[var(--omni-ink)] px-8 py-5 text-[14px] font-mono font-bold uppercase tracking-widest text-[var(--omni-ink)] transition-colors hover:bg-[var(--omni-bg-muted)]">
            Contact us
          </Link>
        </div>
      </section>
    </>
  );
}
