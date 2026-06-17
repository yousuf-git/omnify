import { Outlet, ScrollRestoration } from "react-router-dom";
import PublicNav from "./PublicNav";
import Footer from "./Footer";

// Light, marketing-themed shell for all public pages. Forces a light surface
// regardless of the app's dark mode so the marketing site stays on-brand.
export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white text-[var(--omni-ink)]" data-public>
      <PublicNav />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
