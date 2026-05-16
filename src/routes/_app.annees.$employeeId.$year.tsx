import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  useMembres,
  useMissions,
  useMissionMutations,
  useDestinations,
  type Mission,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, MapPin, Pencil, Plus, Trash2, Filter } from "lucide-react";

export const Route = createFileRoute("/_app/annees/$employeeId/$year")({
  component: YearPage,
});

function YearPage() {
  const { employeeId, year } = Route.useParams();
  const { data: membres = [] } = useMembres();
  const { data: missions = [] } = useMissions({ membreId: employeeId });
  const { data: destinations = [] } = useDestinations();
  const { remove } = useMissionMutations();
  const [destFilter, setDestFilter] = useState<string>("all");

  const membre = membres.find((e) => e.id === employeeId);

  const yearMissions = useMemo(
    () =>
      missions.filter((m) => m.date.startsWith(year)).sort((a, b) => a.date.localeCompare(b.date)),
    [missions, year],
  );

  const rows = useMemo(() => {
    if (destFilter === "all") return yearMissions;
    return yearMissions.filter((m) => m.destination_name === destFilter);
  }, [yearMissions, destFilter]);

  const usedDestinations = useMemo(
    () => Array.from(new Set(yearMissions.map((m) => m.destination_name).filter(Boolean))).sort(),
    [yearMissions],
  );

  if (!membre)
    return <div className="py-20 text-center text-muted-foreground">Membre introuvable.</div>;

  const nomComplet = `${membre.prenom} ${membre.nom}`;

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/annees/$employeeId"
          params={{ employeeId }}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Profil de {nomComplet}
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {nomComplet} · Année
            </div>
            <h1 className="text-5xl font-semibold tracking-tight bg-royal bg-clip-text text-transparent">
              {year}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {rows.length} mission{rows.length > 1 ? "s" : ""}
              {destFilter !== "all" ? ` · ${destFilter}` : ""}.
            </p>
          </div>
          <MissionDialog
            membreId={employeeId}
            year={year}
            trigger={
              <Button className="gap-1.5 btn-royal">
                <Plus className="h-4 w-4" /> Nouvelle mission
              </Button>
            }
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4 shadow-elegant flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" /> Filtrer par destination
        </div>
        <Select value={destFilter} onValueChange={setDestFilter}>
          <SelectTrigger className="w-[320px] bg-background/80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les destinations</SelectItem>
            {usedDestinations.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {destFilter !== "all" && (
          <Button variant="ghost" size="sm" onClick={() => setDestFilter("all")}>
            Réinitialiser
          </Button>
        )}
        <div className="ml-auto text-xs text-muted-foreground">
          {destinations.length} destinations enregistrées
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl glass-card shadow-elegant">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Nom complet</th>
              <th className="px-5 py-3 text-left font-medium">Date</th>
              <th className="px-5 py-3 text-left font-medium">Destination</th>
              <th className="px-5 py-3 text-left font-medium">Mission</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.id}
                className="border-t border-border/60 hover:bg-accent/40 transition-colors animate-fade-up"
                style={{ animationDelay: `${i * 25}ms` }}
              >
                <td className="px-5 py-3.5 font-medium">{nomComplet}</td>
                <td className="px-5 py-3.5 text-muted-foreground tabular-nums">
                  {new Date(r.date).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gold" />
                    {r.destination_name}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">{r.mission}</td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-1">
                    <MissionDialog
                      membreId={employeeId}
                      year={year}
                      mission={r}
                      trigger={
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      }
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => remove.mutate(r.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-muted-foreground">
                  Aucune mission {destFilter !== "all" ? `vers "${destFilter}" ` : ""}pour {year}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MissionDialog({
  membreId,
  year,
  mission,
  trigger,
}: {
  membreId: string;
  year: string;
  mission?: Mission;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { data: destinations = [] } = useDestinations();
  const { add, update } = useMissionMutations();

  const initial = (): Omit<Mission, "id"> =>
    mission
      ? {
          membre_id: mission.membre_id,
          destination_id: mission.destination_id,
          destination_name: mission.destination_name,
          mission: mission.mission,
          date: mission.date,
        }
      : {
          membre_id: membreId,
          destination_id: null,
          destination_name: "",
          mission: "",
          date: `${year}-01-01`,
        };
  const [form, setForm] = useState<Omit<Mission, "id">>(initial);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setForm(initial());
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle>{mission ? "Modifier la mission" : "Nouvelle mission"}</DialogTitle>
          <DialogDescription>
            Sélectionnez une destination dans la liste pré-établie.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Date</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label className="text-xs">Destination</Label>
            <Select
              value={form.destination_id ?? ""}
              onValueChange={(v) => {
                const d = destinations.find((x) => x.id === v);
                setForm({ ...form, destination_id: v, destination_name: d?.name ?? "" });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une destination" />
              </SelectTrigger>
              <SelectContent>
                {destinations.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Manque une destination ? Ajoutez-la depuis l'onglet{" "}
              <Link to="/destinations" className="underline">
                Destinations
              </Link>
              .
            </p>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">Mission</Label>
            <Input
              value={form.mission}
              onChange={(e) => setForm({ ...form, mission: e.target.value })}
              placeholder="Inspection, formation, audit..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            className="btn-royal"
            onClick={async () => {
              if (!form.destination_name || !form.mission) return;
              if (mission) await update.mutateAsync({ id: mission.id, ...form });
              else await add.mutateAsync(form);
              setOpen(false);
            }}
          >
            {mission ? "Enregistrer" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
