import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, Calendar } from "lucide-react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_app/annees/$employeeId/")({
  component: AnneesPage,
});

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

function AnneesPage() {
  const { employeeId } = Route.useParams();
  const employee = useStore((s) => s.employees.find((e) => e.id === employeeId));
  const allMissions = useStore((s) => s.missions);

  const counts = useMemo(() => {
    const missions = allMissions.filter((m) => m.employeeId === employeeId);
    return YEARS.reduce<Record<number, number>>((acc, y) => {
      acc[y] = missions.filter((m) => m.date.startsWith(String(y))).length;
      return acc;
    }, {});
  }, [allMissions, employeeId]);

  if (!employee) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Collaborateur introuvable.</p>
        <Link to="/" className="text-primary hover:underline mt-2 inline-block">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
        </Link>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-lg font-semibold shadow-sm">
            {employee.prenom[0]}{employee.nom[0]}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Collaborateur</div>
            <h1 className="text-3xl font-semibold tracking-tight">{employee.prenom} {employee.nom}</h1>
          </div>
        </div>
        <p className="mt-4 text-muted-foreground">Sélectionnez une année pour consulter les missions.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {YEARS.map((y) => (
          <Link
            key={y}
            to="/annees/$employeeId/$year"
            params={{ employeeId, year: String(y) }}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
          >
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/20" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" /> Année
                </div>
                <div className="mt-2 text-5xl font-semibold tracking-tight">{y}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {counts[y]} mission{counts[y] > 1 ? "s" : ""}
                </div>
              </div>
              {y === 2026 && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                  Actuel
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
