import { useState } from "react";
import { Link } from "react-router-dom";
import { Github, Linkedin, Twitter } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", to: "/features" },
      { label: "Sandbox", to: "/sandbox" },
      { label: "Sign in", to: "/login" },
      { label: "Ticket status", to: "/checkTicketStatus" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", to: "/features" },
      { label: "Support", to: "/contact" },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const year = new Date().getFullYear();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    setTimeout(() => {
      setStatus("ok");
      setEmail("");
    }, 1500);
  };

  return (
    <footer className="bg-[var(--omni-ink)] text-white border-t border-white/10 overflow-hidden relative">
      {/* Background Architectural Grid (Dark Mode) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          backgroundPosition: "center center",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 pt-32 pb-10 sm:px-8">
        
        {/* Top Section: Links & Newsletter */}
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-8 border-b border-white/10 pb-24">
           {/* Left: Subscribe */}
           <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                 <h3 className="font-logo text-3xl font-extrabold uppercase tracking-tight">Stay Updated.</h3>
                 <p className="mt-4 max-w-sm font-mono text-[13px] text-white/50 leading-relaxed">
                    Get the latest engineering notes, product updates, and inventory strategies straight to your inbox.
                 </p>
              </div>
              <form onSubmit={submit} className="mt-10 max-w-md relative">
                 <input 
                   type="email" 
                   value={email}
                   onChange={(e) => {
                     setEmail(e.target.value);
                     setStatus("idle");
                   }}
                   placeholder="operator@company.com"
                   className="w-full bg-white/5 border border-white/20 rounded-none px-5 py-4 text-[14px] font-mono outline-none focus:border-[var(--omni-brand)] transition-colors placeholder:text-white/20 text-white" 
                 />
                 <button 
                   type="submit"
                   disabled={status === "loading"}
                   className="absolute right-0 top-0 h-full px-6 bg-white text-[var(--omni-ink)] font-mono text-sm font-bold uppercase hover:bg-[var(--omni-brand)] hover:text-white transition-colors disabled:opacity-80"
                 >
                   {status === "loading" ? "Connecting..." : "Subscribe"}
                 </button>
                 {status === "ok" && <p className="absolute -bottom-6 left-0 text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Thanks for subscribing!</p>}
                 {status === "error" && <p className="absolute -bottom-6 left-0 text-[10px] font-mono text-rose-400 uppercase tracking-widest">Invalid email address.</p>}
              </form>
           </div>
           
           {/* Right: Links */}
           <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10 lg:pl-20">
              {columns.map(col => (
                 <div key={col.title}>
                    <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/30 mb-8">{col.title}</h4>
                    <ul className="space-y-5">
                      {col.links.map(l => (
                         <li key={l.label}>
                            <Link to={l.to} className="font-mono text-[13px] text-white/70 hover:text-[var(--omni-brand)] transition-colors uppercase tracking-wide">
                               {l.label}
                            </Link>
                         </li>
                      ))}
                    </ul>
                 </div>
              ))}
           </div>
        </div>
        
        {/* Massive Typography */}
        <div className="mt-12 flex flex-col items-center">
           <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 mb-12 font-mono text-[10px] uppercase tracking-widest text-white/40">
              <div className="flex items-center gap-6">
                 <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                 <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </div>
              <p className="order-first md:order-none opacity-50">© {year} Omnify</p>
              {/* <div className="flex items-center gap-5">
                {[Twitter, Linkedin, Github].map((Icon, i) => (
                   <a key={i} href="#" className="hover:text-[var(--omni-brand)] transition-colors"><Icon size={16} /></a>
                ))}
              </div> */}
           </div>
           
           {/* The Massive Text */}
           <div className="w-full overflow-hidden flex justify-center">
              <h1 className="font-logo font-extrabold uppercase tracking-tighter text-[clamp(4rem,18vw,16rem)] leading-[0.75] text-white/5 hover:text-white/10 transition-colors cursor-default select-none">
                 OMNIFY
              </h1>
           </div>
        </div>
      </div>
    </footer>
  );
}
