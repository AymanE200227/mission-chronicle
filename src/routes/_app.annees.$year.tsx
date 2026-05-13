import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { ArrowLeft, Calendar, MapPin, Users, Briefcase } from "lucide-react";

export const Route = createFileRoute("/_app/annees/$year")({
  component: YearOverviewPage,
});

function YearOverviewPage() {
  const { year } = Route.useParams();
  const employees = useStore((s) => s.employees);
  const missions = useStore((s) => s.missions);

  const rows = useMemo(() => {
    return missions
      .filter((m) => m.date.startsWith(year))
      .map((m) => {
        const emp = employees.find((e) => e.id === m.employeeId);
        return {
          ...m,
          nomComplet: emp ? `${emp.prenom} ${emp.nom}` : "—",
          poste: emp?.poste ?? "",
          initials: emp ? `${emp.prenom[0]}${emp.nom[0]}` : "?",
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [missions, employees, year]);

  const uniqueEmployees = new Set(rows.map((r) => r.employeeId)).size;
  const uniqueDestinations = new Set(rows.map((r) => r.destination)).size;

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> Vue d'ensemble · Année
            </div>
            <h1 className="mt-1 text-5xl font-semibold tracking-tight">{year}</h1>
            <p className="mt-2 text-muted-foreground">
              Toutes les missions des collaborateurs pour cette année.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={<Briefcase className="h-4 w-4" />} label="Missions" value={rows.length} />
        <StatCard icon={<Users className="h-4 w-4" />} label="Collaborateurs" value={uniqueEmployees} />
        <StatCard icon={<MapPin className="h-4 w-4" />} label="Destinations" value={uniqueDestinations} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/60 shadow-sm backdrop-blur">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Collaborateur</th>
              <th className="px-5 py-3 text-left font-medium">Date</th>
              <th className="px-5 py-3 text-left font-medium">Destination</th>
              <th className="px-5 py-3 text-left font-medium">Objet</th>
              <th className="px-5 py-3 text-right font-medium">Détails</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border/60 hover:bg-secondary/40 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {r.initials}
                    </div>
                    <div className="leading-tight">
                      <div className="font-medium">{r.nomComplet}</div>
                      <div className="text-xs text-muted-foreground">{r.poste}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground tabular-nums">
                  {new Date(r.date).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {r.destination}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">{r.objet}</td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    to="/annees/$employeeId/$year"
                    params={{ employeeId: r.employeeId, year }}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Voir →
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-muted-foreground">
                  Aucune mission enregistrée pour {year}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm backdrop-blur">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}
