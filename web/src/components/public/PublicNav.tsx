import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/features", label: "Features" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function PublicNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-[var(--omni-border)] bg-white/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="group flex items-baseline gap-0.5">
          <span
            className={`font-logo text-2xl font-extrabold tracking-[-0.04em] transition-colors text-[var(--omni-ink)]`}
          >
            omnify
          </span>
          <span className="h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-[var(--omni-brand)] transition-transform group-hover:scale-150" />
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-[var(--omni-brand)] ${
                  isActive
                    ? "text-[var(--omni-brand)]"
                    : "text-[var(--omni-text-secondary)]"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <span className={`h-4 w-px bg-[var(--omni-border)]`} />
          <Link
            to="/login"
            className={`text-sm font-semibold transition-colors hover:text-[var(--omni-brand)] text-[var(--omni-ink)]`}
          >
            Sign in
          </Link>
        </div>

        <button
          className={`grid h-10 w-10 place-items-center rounded-lg transition-colors md:hidden text-[var(--omni-ink)]`}
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-[var(--omni-border)] bg-white px-5 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--omni-text-secondary)] hover:bg-[var(--omni-bg-muted)]"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--omni-ink)]"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
