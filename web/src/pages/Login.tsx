import React, { useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Loader2, KeyRound, Mail, Box, HeadphonesIcon } from 'lucide-react';

const FeatureItem: React.FC<{ icon: React.ReactNode; title: string; desc: string; delay: number }> = ({ icon, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay }}
    className="flex gap-4 items-start"
  >
    <div className="flex items-center justify-center w-12 h-12 shrink-0 border border-white/20 bg-white/5 text-[var(--omni-brand)]">
      {icon}
    </div>
    <div>
      <h3 className="font-mono text-[13px] font-bold uppercase tracking-widest text-white">{title}</h3>
      <p className="mt-2 text-[13px] font-medium leading-relaxed text-white/60">{desc}</p>
    </div>
  </motion.div>
);

export const Login: React.FC = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();

  if (user) {
    const home = user.role === 'superadmin' ? '/admin' : '/dashboard';
    const from = location.state?.from?.pathname;
    return <Navigate to={from && from !== '/' ? from : home} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-white">
      {/* Left panel */}
      <div className="relative flex w-full flex-col justify-between overflow-hidden bg-[var(--omni-ink)] p-8 md:w-5/12 md:p-12 lg:p-16 border-r-4 border-[var(--omni-brand)]">
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10">
          <Link to="/" className="group flex items-baseline gap-0.5 mb-12 inline-flex">
            <span className="font-logo text-3xl font-extrabold tracking-[-0.04em] text-white">omnify</span>
            <span className="h-2 w-2 translate-y-[-1px] rounded-full bg-[var(--omni-brand)] transition-transform group-hover:scale-150" />
          </Link>

          <h1 className="font-logo text-5xl lg:text-6xl font-extrabold uppercase tracking-tight leading-[0.9] text-white">
            Access your<br />control plane.
          </h1>
          <p className="mt-6 max-w-sm font-mono text-[14px] leading-relaxed text-white/60">
            Sign in to manage inventory, stock movements and field-service tickets across your company.
          </p>

          <div className="mt-10 flex flex-col gap-6">
            <FeatureItem icon={<Box size={20} />} title="Unified inventory" desc="Stock, serials and warehouses in one place" delay={0.3} />
            <FeatureItem icon={<HeadphonesIcon size={20} />} title="Field-service tickets" desc="Track installations to resolution" delay={0.5} />
            <FeatureItem icon={<ShieldCheck size={20} />} title="Isolated per company" desc="Your data never crosses tenants" delay={0.7} />
          </div>
        </motion.div>

        <p className="relative z-10 mt-8 font-mono text-[11px] font-bold uppercase tracking-widest text-white/40">
          New here? <Link to="/sandbox" className="text-[var(--omni-brand)] hover:text-white transition-colors">Try the sandbox</Link> — no account needed.
        </p>
      </div>

      {/* Right form */}
      <div className="flex w-full flex-1 items-center justify-center p-6 sm:p-12 md:p-20">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="w-full max-w-md">
          <div className="mb-12">
            <h2 className="font-logo text-4xl font-extrabold uppercase tracking-tight text-[var(--omni-ink)]">
              Sign In
            </h2>
            <p className="mt-3 font-mono text-[14px] text-[var(--omni-text-secondary)]">
              Enter your credentials to access your workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="border-l-4 border-rose-500 bg-rose-50 p-4">
                <p className="font-mono text-[12px] font-bold text-rose-700">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="block font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--omni-text-secondary)]">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[var(--omni-text-muted)]">
                  <Mail size={18} />
                </div>
                <input
                  required type="email" autoComplete="email" autoFocus
                  placeholder="name@company.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-none border-2 border-[var(--omni-border)] border-b-4 bg-[var(--omni-bg-subtle)] py-4 pl-12 pr-4 font-mono text-[14px] text-[var(--omni-ink)] outline-none transition-colors focus:border-[var(--omni-brand)] focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--omni-text-secondary)]">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[var(--omni-text-muted)]">
                  <KeyRound size={18} />
                </div>
                <input
                  required type="password" autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-none border-2 border-[var(--omni-border)] border-b-4 bg-[var(--omni-bg-subtle)] py-4 pl-12 pr-4 font-mono text-[14px] text-[var(--omni-ink)] outline-none transition-colors focus:border-[var(--omni-brand)] focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="group flex w-full items-center justify-center gap-3 bg-[var(--omni-ink)] px-8 py-5 text-[14px] font-mono font-bold uppercase tracking-widest text-white transition-transform hover:-translate-y-1 shadow-[0_8px_0_0_var(--omni-brand)] hover:shadow-[0_12px_0_0_var(--omni-brand)] mt-12 disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign in'}
              {!loading && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
            </button>

            <div className="mt-10 text-center">
              <Link to="/" className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--omni-text-muted)] hover:text-[var(--omni-brand)] transition-colors">
                ← Back to home
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
