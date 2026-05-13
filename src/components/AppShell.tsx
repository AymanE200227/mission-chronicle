import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";

export function AppShell() {
  const location = useLocation();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Briefcase className="h-4.5 w-4.5" strokeWidth={2.25} />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Missio</div>
              <div className="text-[11px] text-muted-foreground">Gestion des missions</div>
            </div>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <NavLink to="/" label="Accueil" active={location.pathname === "/"} />
            <NavLink to="/annees" label="Années" active={location.pathname.startsWith("/annees")} />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-7xl px-6 py-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Missio — Plateforme premium de gestion des missions
      </footer>
    </div>
  );
}

function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`rounded-md px-3 py-1.5 transition-colors ${
        active ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
      }`}
    >
      {label}
    </Link>
  );
}
