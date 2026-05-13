import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, Calendar } from "lucide-react";
import { useMembres, useMissions, useYears } from "@/lib/store";

export const Route = createFileRoute("/_app/annees/$employeeId/")({
  component: AnneesPage,
});

function AnneesPage() {
  const { employeeId } = Route.useParams();
  const { data: membres = [] } = useMembres();
  const { data: missions = [] } = useMissions({ membreId: employeeId });
  const { data: years = [] } = useYears();

  const membre = membres.find((e) => e.id === employeeId);

  const counts = useMemo(() => {
    const map: Record<number, number> = {};
    for (const y of years) map[y.year] = 0;
    for (const m of missions) {
      const y = Number(m.date.slice(0, 4));
      if (y in map) map[y] += 1;
    }
    return map;
  }, [missions, years]);

  if (!membre) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Membre introuvable.</p>
        <Link to="/" className="text-primary hover:underline mt-2 inline-block">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
        </Link>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-royal text-primary-foreground text-lg font-semibold shadow-elegant">
            {membre.prenom[0]}
            {membre.nom[0]}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Membre</div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {membre.prenom} {membre.nom}
            </h1>
          </div>
        </div>
        <p className="mt-4 text-muted-foreground">
          Sélectionnez une année pour consulter les missions.
        </p>
      </div>

      {years.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">Aucune année configurée.</p>
          <Link to="/years" className="text-primary hover:underline mt-2 inline-block">
            Gérer les années →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {years.map((y, i) => (
            <Link
              key={y.id}
              to="/annees/$employeeId/$year"
              params={{ employeeId, year: String(y.year) }}
              className="group relative overflow-hidden rounded-2xl glass-card p-6 shadow-elegant transition-all hover:-translate-y-1 hover:border-gold/50 hover:shadow-gold animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/15 blur-2xl transition-all group-hover:bg-gold/30" />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" /> Année
                  </div>
                  <div className="mt-2 text-5xl font-semibold tracking-tight bg-royal bg-clip-text text-transparent">
                    {y.year}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {counts[y.year] ?? 0} mission{(counts[y.year] ?? 0) > 1 ? "s" : ""}
                  </div>
                </div>
                {y.year === currentYear && (
                  <span className="rounded-full bg-gold-gradient px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold-foreground shadow-gold">
                    Actuel
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
