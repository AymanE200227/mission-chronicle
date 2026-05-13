import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useYears, useYearMutations, useMissions } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_app/years")({
  component: YearsPage,
});

function YearsPage() {
  const { data: years = [] } = useYears();
  const { data: missions = [] } = useMissions();
  const { add, remove } = useYearMutations();
  const [val, setVal] = useState<string>("");

  const counts = years.reduce<Record<number, number>>((acc, y) => {
    acc[y.year] = missions.filter((m) => m.date.startsWith(String(y.year))).length;
    return acc;
  }, {});

  const handleAdd = async () => {
    const n = Number(val);
    if (!Number.isInteger(n) || n < 1900 || n > 2100) return;
    if (years.some((y) => y.year === n)) return;
    await add.mutateAsync(n);
    setVal("");
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs text-gold-foreground">
          <Calendar className="h-3.5 w-3.5" /> Périodes
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          <span className="bg-royal bg-clip-text text-transparent">Années</span>
        </h1>
        <p className="mt-1 text-muted-foreground">
          Ajoutez, supprimez ou consultez les années disponibles dans l'application.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-4 shadow-elegant flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Nouvelle année</label>
          <Input
            type="number"
            min={1900}
            max={2100}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            placeholder="2027"
            className="w-40 bg-background/80"
          />
        </div>
        <Button onClick={handleAdd} className="gap-1.5 bg-royal hover:opacity-90">
          <Plus className="h-4 w-4" /> Ajouter
        </Button>
        <div className="ml-auto text-sm text-muted-foreground">
          {years.length} année{years.length > 1 ? "s" : ""} configurée{years.length > 1 ? "s" : ""}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl glass-card shadow-elegant">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Année</th>
              <th className="px-5 py-3 text-left font-medium">Missions enregistrées</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {years.map((y, i) => (
              <tr
                key={y.id}
                className="border-t border-border/60 hover:bg-accent/40 transition-colors animate-fade-up"
                style={{ animationDelay: `${i * 25}ms` }}
              >
                <td className="px-5 py-3.5">
                  <span className="text-2xl font-semibold tracking-tight bg-royal bg-clip-text text-transparent">
                    {y.year}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground tabular-nums">
                  {counts[y.year] ?? 0}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => remove.mutate(y.id)}
                      title="Supprimer cette année"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {years.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-12 text-center text-muted-foreground">
                  Aucune année. Ajoutez-en une ci-dessus.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
