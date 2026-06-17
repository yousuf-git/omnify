import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Activity } from "lucide-react";

function Counter({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const startTime = performance.now();
    
    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setVal(start + (to - start) * easeOutQuart);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [to]);
  
  return (
    <>
      {prefix}{Math.round(val).toLocaleString()}{suffix}
    </>
  );
}

const stats = [
  { value: 99, suffix: "%", label: "Accurate Counts" },
  { value: 12, suffix: "k+", label: "Items Tracked" },
  { value: 2, suffix: "m", label: "To First Count", prefix: "<" },
];

const activities = [
  "Restock: +400 Units (Warehouse B)",
  "Serial #8192-A scanned for delivery",
  "Low Stock Alert: SKU-9921",
  "Ticket #442 resolved (Field Service)",
  "Item group 'Electronics' synced"
];

function LiveTicker() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const int = setInterval(() => {
      setIdx((prev) => (prev + 1) % activities.length);
    }, 3500);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="absolute bottom-8 right-8 hidden lg:flex items-center gap-3 bg-white/60 backdrop-blur-xl border border-[var(--omni-border)] pl-3 pr-4 py-2 rounded-full shadow-sm z-50 overflow-hidden">
      <div className="relative flex h-2 w-2 ml-1">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--omni-brand)] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--omni-brand)]"></span>
      </div>
      <div className="relative h-[16px] w-[240px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -15, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 text-[11px] font-mono font-bold tracking-wide text-[var(--omni-ink)] whitespace-nowrap flex items-center"
          >
            {activities[idx]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Hero() {
  // Parallax setup
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 100 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const gridX = useTransform(smoothX, [-0.5, 0.5], [-20, 20]);
  const gridY = useTransform(smoothY, [-0.5, 0.5], [-20, 20]);
  const chartX = useTransform(smoothX, [-0.5, 0.5], [-50, 50]);
  const chartY = useTransform(smoothY, [-0.5, 0.5], [-50, 50]);

  const stockLetters = "STOCK".split("");

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-hidden bg-white text-[var(--omni-ink)] flex flex-col justify-center pt-24 pb-16"
    >
      {/* Background Architectural Grid (Light Mode) with Parallax */}
      <motion.div 
        className="absolute inset-[-10%] pointer-events-none opacity-40"
        style={{
          x: gridX,
          y: gridY,
          backgroundImage: "linear-gradient(rgba(10,37,64,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(10,37,64,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          backgroundPosition: "center center",
          maskImage: "radial-gradient(ellipse at 50% 50%, black 20%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, black 20%, transparent 80%)"
        }}
      />
      
      {/* The Step Chart Animation with Parallax */}
      <motion.div 
        className="absolute inset-[-5%] z-0 pointer-events-none flex items-center justify-center"
        style={{ x: chartX, y: chartY }}
      >
        <svg className="w-full h-full opacity-90" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="step-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#635bff" stopOpacity="0" />
              <stop offset="20%" stopColor="#635bff" />
              <stop offset="45%" stopColor="#df1b41" />
              <stop offset="50%" stopColor="#00a86b" />
              <stop offset="80%" stopColor="#00a86b" />
              <stop offset="100%" stopColor="#00a86b" stopOpacity="0" />
            </linearGradient>
            
            <filter id="light-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="rgba(99,91,255,0.15)" />
            </filter>
          </defs>
          
          <path 
            d="M -100 250 L 250 250 L 250 400 L 500 400 L 500 550 L 750 550 L 750 700 L 950 700 L 950 200 L 1150 200 L 1150 350 L 1540 350"
            fill="none" stroke="rgba(10,37,64,0.08)" strokeWidth="2" strokeDasharray="6 6"
          />
          
          <motion.path 
            d="M -100 250 L 250 250 L 250 400 L 500 400 L 500 550 L 750 550 L 750 700 L 950 700 L 950 200 L 1150 200 L 1150 350 L 1540 350"
            fill="none" stroke="url(#step-gradient)" strokeWidth="5" strokeLinecap="square" strokeLinejoin="miter"
            filter="url(#light-shadow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, ease: "easeInOut", delay: 0.2 }}
          />

          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.2, duration: 0.5, type: "spring" }}
            style={{ transformOrigin: "750px 700px" }}
          >
            <circle cx="750" cy="700" r="20" fill="#df1b41" fillOpacity="0.15" className="animate-ping" />
            <circle cx="750" cy="700" r="7" fill="#df1b41" stroke="#fff" strokeWidth="2" />
            <text x="750" y="735" fill="#0a2540" stroke="#fff" strokeWidth="4" paintOrder="stroke" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="2">CRITICAL LOW</text>
          </motion.g>
          
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.4, duration: 0.5, type: "spring" }}
            style={{ transformOrigin: "950px 200px" }}
          >
            <circle cx="950" cy="200" r="24" fill="#00a86b" fillOpacity="0.1" />
            <circle cx="950" cy="200" r="7" fill="#00a86b" stroke="#fff" strokeWidth="2" />
            <text x="950" y="170" fill="#0a2540" stroke="#fff" strokeWidth="4" paintOrder="stroke" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="2">RESTOCK LOGGED</text>
          </motion.g>
        </svg>
      </motion.div>

      <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 w-full flex flex-col items-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[120%] bg-white/70 blur-[40px] -z-10 rounded-[100%]" />

        <h1 className="font-logo font-extrabold uppercase tracking-[-0.02em] leading-[0.85] text-[clamp(3.5rem,10vw,8rem)] flex flex-col items-center drop-shadow-sm mt-8">
          
          {/* Staggered text entrance for STOCK */}
          <div className="flex text-[var(--omni-ink)] overflow-hidden pb-1">
            {stockLetters.map((letter, i) => (
              <motion.span
                key={i}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} 
            className="text-transparent" 
            style={{ WebkitTextStroke: "2px rgba(10,37,64,0.3)" }}
          >
            WITHOUT
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--omni-brand-strong)] via-[var(--omni-brand)] to-[#9D4EDD]"
          >
            GUESSWORK.
          </motion.div>
        </h1>
        
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }}
          className="mt-10 max-w-2xl text-[16px] md:text-[19px] leading-relaxed text-[var(--omni-text-secondary)] font-medium px-4"
        >
          Omnify tracks every item in and out, serial numbers, warehouses and service tickets in one live view — <span className="text-[var(--omni-ink)] font-semibold">so you never oversell or run dry again.</span>
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/sandbox"
            className="group flex items-center justify-center gap-2 rounded-none bg-[var(--omni-ink)] px-8 py-4 text-[14px] font-mono font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-1 shadow-[0_12px_24px_rgba(10,37,64,0.15)] hover:shadow-[0_20px_32px_rgba(10,37,64,0.25)]"
          >
            Try it free
            <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            to="/contact"
            className="group flex items-center justify-center gap-2 rounded-none border border-[var(--omni-border)] bg-transparent px-8 py-4 text-[14px] font-mono font-bold uppercase tracking-widest text-[var(--omni-ink)] transition-colors hover:bg-[var(--omni-bg-muted)] hover:border-gray-300"
          >
            Watch Demo
          </Link>
        </motion.div>
        
        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 1 }}
          className="mt-24 w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-16 pt-10 border-t border-[var(--omni-border)]"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="font-mono text-4xl sm:text-5xl font-bold text-[var(--omni-ink)] mb-2 tracking-tight transition-transform group-hover:scale-110">
                <Counter to={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
              <div className="font-mono text-[11px] font-bold text-[var(--omni-text-muted)] uppercase tracking-[0.2em] transition-colors group-hover:text-[var(--omni-brand)]">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <LiveTicker />
    </section>
  );
}
