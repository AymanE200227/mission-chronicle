import { Link, Outlet, useLocation } from "@tanstack/react-router";
import logo from "@/assets/logo.png";
import { AnimatedBackground } from "./AnimatedBackground";

export function AppShell() {
  const location = useLocation();
  const path = location.pathname;
  return (
    <div className="relative min-h-screen flex flex-col">
      <AnimatedBackground />
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gold-gradient opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-70" />
              <img
                src={logo}
                alt="FAR"
                className="relative h-11 w-11 object-contain drop-shadow crest-spin transition-transform group-hover:scale-105"
              />
            </div>
            <div className="leading-tight">
              <div className="text-base font-semibold tracking-tight bg-royal bg-clip-text text-transparent">
                Missio FAR
              </div>
              <div className="text-[11px] text-muted-foreground">Centre sportif FAR</div>
            </div>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <NavLink to="/" label="Accueil" active={path === "/"} />
            <NavLink
              to="/destinations"
              label="Destinations"
              active={path.startsWith("/destinations")}
            />
            <NavLink to="/years" label="Années" active={path.startsWith("/years")} />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10 animate-fade-up">
        <Outlet />
      </main>
      <footer className="border-t border-border/60 bg-background/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-6 text-xs text-muted-foreground flex items-center justify-between">
          <span>© {new Date().getFullYear()} Missio FAR — Centre sportif FAR</span>
          <span className="text-gold">⭐ Royaume du Maroc</span>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`link-underline relative rounded-md px-3.5 py-1.5 text-sm transition-all ${
        active
          ? "btn-royal font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
      }`}
    >
      {label}
    </Link>
  );
}
