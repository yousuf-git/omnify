import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Boxes, Barcode, Ticket, Building2, Warehouse, FileSpreadsheet,
  Repeat, ShieldCheck, Users, MapPin, Layers, BarChart3, ArrowRight
} from "lucide-react";

const groups = [
  {
    title: "Inventory & stock",
    items: [
      { icon: <Boxes size={20} />, t: "Stock in & out", d: "Multi-item transactions with invoice references, categories and warehouse routing." },
      { icon: <Barcode size={20} />, t: "Serial numbers", d: "Track individual units end-to-end and link them to tickets." },
      { icon: <Layers size={20} />, t: "Items & groups", d: "Organize a deep catalog with SKUs, units and installation flags." },
      { icon: <Repeat size={20} />, t: "Yearly rollover", d: "Automatic financial-year ledger rollover on your chosen month." },
    ],
  },
  {
    title: "Network & service",
    items: [
      { icon: <Warehouse size={20} />, t: "Warehouses", d: "Per-location stock visibility across many sites." },
      { icon: <Building2 size={20} />, t: "Parties & resellers", d: "Model your whole distribution network with agencies and support staff." },
      { icon: <Ticket size={20} />, t: "Tickets", d: "Installation & support tickets with statuses, ratings and resolution tracking." },
      { icon: <MapPin size={20} />, t: "Cities & states", d: "Geographic master data wired into every entity." },
    ],
  },
  {
    title: "Platform",
    items: [
      { icon: <ShieldCheck size={20} />, t: "Multi-tenancy", d: "Strict per-company isolation enforced at the data layer." },
      { icon: <Users size={20} />, t: "Roles & access", d: "Admin, manager, staff and viewer roles with clear permissions." },
      { icon: <FileSpreadsheet size={20} />, t: "CSV import / export", d: "Bulk-load and extract data with validation." },
      { icon: <BarChart3 size={20} />, t: "Dashboards", d: "Live KPIs and movement charts for admins and operators." },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      <section className="mx-auto max-w-4xl px-5 pt-40 pb-20 text-center sm:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="font-logo text-5xl md:text-7xl font-extrabold uppercase tracking-tight text-[var(--omni-ink)]"
        >
          Every tool your operation needs.
        </motion.h1>
        <p className="mx-auto mt-8 max-w-2xl font-mono text-[16px] text-[var(--omni-text-secondary)] leading-relaxed">
          From the loading dock to the customer's door — Omnify covers the full inventory and
          field-service lifecycle in one un-bloated platform.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-32 sm:px-8">
        {groups.map((g, gi) => (
          <div key={g.title} className="mb-24 last:mb-0">
            <h2 className="font-logo text-3xl font-extrabold uppercase tracking-tight text-[var(--omni-ink)] border-b-4 border-[var(--omni-ink)] inline-block pb-2 mb-10">{g.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--omni-border)] border border-[var(--omni-border)]">
              {g.items.map((it, i) => (
                <motion.div
                  key={it.t}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="bg-white p-8 group transition-colors hover:bg-[var(--omni-bg-subtle)] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[var(--omni-text-muted)] tracking-widest uppercase">[{gi + 1}.{i + 1}]</span>
                    <span className="text-[var(--omni-ink)] opacity-40 group-hover:text-[var(--omni-brand)] group-hover:opacity-100 transition-colors">
                      {it.icon}
                    </span>
                  </div>
                  <div className="mt-16">
                    <h3 className="font-mono text-[15px] font-bold uppercase tracking-tight text-[var(--omni-ink)]">{it.t}</h3>
                    <p className="mt-4 text-[13px] font-medium leading-relaxed text-[var(--omni-text-secondary)]">{it.d}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Brutalist Callout */}
        <div className="mt-32 relative w-full border-2 border-[var(--omni-ink)] bg-[var(--omni-ink)] p-12 md:p-20 text-center text-white shadow-[16px_16px_0px_0px_var(--omni-brand)] transition-transform hover:-translate-y-1 hover:translate-x-[-4px] hover:shadow-[20px_20px_0px_0px_var(--omni-brand)]">
          <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <h2 className="font-logo text-4xl md:text-5xl font-extrabold uppercase tracking-tight leading-[0.9]">
            Try every feature<br/>in the sandbox.
          </h2>
          <div className="mt-12 flex justify-center relative z-10">
            <Link to="/sandbox" className="group flex items-center gap-2 bg-white px-8 py-4 text-[14px] font-mono font-bold uppercase tracking-widest text-[var(--omni-ink)] transition-transform hover:-translate-y-1 shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
              Open the sandbox
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
