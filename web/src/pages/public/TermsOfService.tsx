import { motion } from "framer-motion";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white text-[var(--omni-ink)] pt-32 pb-24">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-logo text-4xl md:text-6xl font-extrabold uppercase tracking-tight">Terms of Service</h1>
          <p className="mt-4 font-mono text-[14px] text-[var(--omni-text-muted)] uppercase tracking-widest">Last Updated: June 2026</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }} className="mt-16 space-y-12 border-t border-[var(--omni-border)] pt-12">
          <section>
            <h2 className="font-mono text-xl font-bold uppercase tracking-tight mb-4 text-[var(--omni-ink)]">1. Usage Restrictions</h2>
            <p className="text-[15px] leading-relaxed text-[var(--omni-text-secondary)] font-medium">
              You may not reverse engineer, decompile, or otherwise attempt to extract the source code of the Omnify platform. Access to the sandbox environment is provided "as is" for evaluation purposes and is strictly rate-limited.
            </p>
          </section>
          
          <section>
            <h2 className="font-mono text-xl font-bold uppercase tracking-tight mb-4 text-[var(--omni-ink)]">2. Service Level Agreement</h2>
            <p className="text-[15px] leading-relaxed text-[var(--omni-text-secondary)] font-medium">
              Enterprise tenants are provided with a 99.9% uptime SLA. Scheduled maintenance windows are announced 7 days in advance via the system console. Sandbox instances carry no uptime guarantees.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-xl font-bold uppercase tracking-tight mb-4 text-[var(--omni-ink)]">3. Liability</h2>
            <p className="text-[15px] leading-relaxed text-[var(--omni-text-secondary)] font-medium">
              Omnify is not liable for business interruptions caused by inventory mismanagement, incorrect ledger operations, or user error within the platform. You are responsible for auditing your financial year rollovers before committing them.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
