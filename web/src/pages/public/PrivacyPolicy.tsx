import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-[var(--omni-ink)] pt-32 pb-24">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-logo text-4xl md:text-6xl font-extrabold uppercase tracking-tight">Privacy Policy</h1>
          <p className="mt-4 font-mono text-[14px] text-[var(--omni-text-muted)] uppercase tracking-widest">Last Updated: June 2026</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }} className="mt-16 space-y-12 border-t border-[var(--omni-border)] pt-12">
          <section>
            <h2 className="font-mono text-xl font-bold uppercase tracking-tight mb-4 text-[var(--omni-ink)]">1. Information Collection</h2>
            <p className="text-[15px] leading-relaxed text-[var(--omni-text-secondary)] font-medium">
              We collect information to provide better services to our users. This includes basic account information such as email addresses, as well as operational data loaded into the tenant databases (inventory items, serial numbers, locations). Omnify acts solely as a data processor for tenant operational data.
            </p>
          </section>
          
          <section>
            <h2 className="font-mono text-xl font-bold uppercase tracking-tight mb-4 text-[var(--omni-ink)]">2. Data Isolation & Security</h2>
            <p className="text-[15px] leading-relaxed text-[var(--omni-text-secondary)] font-medium">
              Omnify employs strict multi-tenancy architecture. Data belonging to a specific company (tenant) is logically isolated at the database layer. Cross-tenant data access is mechanically impossible without explicitly authorized API grants.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-xl font-bold uppercase tracking-tight mb-4 text-[var(--omni-ink)]">3. Data Retention</h2>
            <p className="text-[15px] leading-relaxed text-[var(--omni-text-secondary)] font-medium">
              We retain your operational data for as long as your tenant is active. Upon account deletion, all associated operational data, logs, and user records are permanently purged from our primary systems within 30 days.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
