import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, Briefcase, Calendar, MapPin, User } from "lucide-react";
import { useMembres, useMissions, useYears } from "@/lib/store";

export const Route = createFileRoute("/_app/annees/$employeeId/")({
  component: ProfilPage,
});

function ProfilPage() {
  const { employeeId } = Route.useParams();
  const { data: membres = [] } = useMembres();
  const { data: missions = [] } = useMissions({ membreId: employeeId });
  const { data: years = [] } = useYears();

  const membre = membres.find((e) => e.id === employeeId);

  const destinations = useMemo(() => {
    const set = new Set<string>();
    for (const m of missions) {
      if (m.destination_name) set.add(m.destination_name);
    }
    return Array.from(set).sort();
  }, [missions]);

  const missionsByYear = useMemo(() => {
    const map: Record<number, typeof missions> = {};
    for (const y of years) map[y.year] = [];
    for (const m of missions) {
      const y = Number(m.date.slice(0, 4));
      if (map[y]) map[y].push(m);
      else map[y] = [m];
    }
    return map;
  }, [missions, years]);

  const sortedYears = useMemo(
    () =>
      Object.keys(missionsByYear)
        .map(Number)
        .sort((a, b) => b - a),
    [missionsByYear],
  );

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
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
      </Link>

      <div className="glass-card rounded-2xl p-6 shadow-elegant">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-royal text-primary-foreground text-2xl font-semibold shadow-elegant">
            {membre.prenom[0]}
            {membre.nom[0]}
          </div>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Profil membre
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">
              {membre.prenom} {membre.nom}
            </h1>
            {destinations.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {destinations.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary/80 px-2.5 py-0.5 text-xs"
                  >
                    <MapPin className="h-3 w-3 text-gold" />
                    {d}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <div className="glass-card rounded-xl px-4 py-2.5 text-center">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5" />
                Missions
              </div>
              <div className="text-xl font-semibold tracking-tight tabular-nums text-gold">
                {missions.length}
              </div>
            </div>
            <div className="glass-card rounded-xl px-4 py-2.5 text-center">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                Destinations
              </div>
              <div className="text-xl font-semibold tracking-tight tabular-nums">
                {destinations.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {sortedYears.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">Aucune mission enregistrée.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedYears.map((yr) => {
            const yearMissions = missionsByYear[yr]?.sort((a, b) => a.date.localeCompare(b.date));
            if (!yearMissions || yearMissions.length === 0) return null;
            return (
              <div key={yr} className="glass-card rounded-2xl shadow-elegant overflow-hidden">
                <Link
                  to="/annees/$employeeId/$year"
                  params={{ employeeId, year: String(yr) }}
                  className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gold" />
                    <span className="text-lg font-semibold tracking-tight bg-royal bg-clip-text text-transparent">
                      {yr}
                    </span>
                    {yr === currentYear && (
                      <span className="rounded-full bg-gold-gradient px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold-foreground">
                        Actuel
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {yearMissions.length} mission{yearMissions.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Voir détails →
                  </span>
                </Link>
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-5 py-2 text-left font-medium">Date</th>
                      <th className="px-5 py-2 text-left font-medium">Destination</th>
                      <th className="px-5 py-2 text-left font-medium">Mission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearMissions.map((m, i) => (
                      <tr
                        key={m.id}
                        className="border-t border-border/60 hover:bg-accent/40 transition-colors animate-fade-up"
                        style={{ animationDelay: `${i * 25}ms` }}
                      >
                        <td className="px-5 py-3 text-muted-foreground tabular-nums">
                          {new Date(m.date).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-gold" />
                            {m.destination_name || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">{m.mission}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}

      {years.length > 0 &&
        years.some(
          (y) => !sortedYears.includes(y.year) || (missionsByYear[y.year]?.length ?? 0) === 0,
        ) && (
          <div className="glass-card rounded-2xl p-4 shadow-elegant">
            <div className="text-xs text-muted-foreground mb-3">Années sans mission :</div>
            <div className="flex flex-wrap gap-2">
              {years
                .filter((y) => (missionsByYear[y.year]?.length ?? 0) === 0)
                .map((y) => (
                  <Link
                    key={y.id}
                    to="/annees/$employeeId/$year"
                    params={{ employeeId, year: String(y.year) }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/60 px-3 py-1.5 text-sm hover:bg-secondary transition-colors"
                  >
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {y.year}
                  </Link>
                ))}
            </div>
          </div>
        )}
    </div>
  );
}
