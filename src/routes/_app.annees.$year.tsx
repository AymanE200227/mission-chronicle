import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, store, type Mission } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Pencil, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_app/annees/$year")({
  component: YearPage,
});

function YearPage() {
  const { year } = Route.useParams();
  const employees = useStore((s) => s.employees);
  const missions = useStore((s) => s.missions);

  const rows = useMemo(() => {
    return missions
      .filter((m) => m.date.startsWith(year))
      .map((m) => {
        const emp = employees.find((e) => e.id === m.employeeId);
        return { ...m, nomComplet: emp ? `${emp.prenom} ${emp.nom}` : "—", poste: emp?.poste ?? "" };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [missions, employees, year]);

  return (
    <div className="space-y-8">
      <div>
        <Link to="/annees" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Toutes les années
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Année</div>
            <h1 className="text-5xl font-semibold tracking-tight">{year}</h1>
            <p className="mt-1 text-muted-foreground">{rows.length} mission{rows.length > 1 ? "s" : ""} enregistrée{rows.length > 1 ? "s" : ""}.</p>
          </div>
          <MissionDialog
            year={year}
            trigger={
              <Button className="gap-1.5"><Plus className="h-4 w-4" /> Nouvelle mission</Button>
            }
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/60 shadow-sm backdrop-blur">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Nom complet</th>
              <th className="px-5 py-3 text-left font-medium">Date</th>
              <th className="px-5 py-3 text-left font-medium">Destination</th>
              <th className="px-5 py-3 text-left font-medium">Objet</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border/60 hover:bg-secondary/40 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="font-medium">{r.nomComplet}</div>
                  <div className="text-xs text-muted-foreground">{r.poste}</div>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground tabular-nums">
                  {new Date(r.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {r.destination}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">{r.objet}</td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-1">
                    <MissionDialog
                      year={year}
                      mission={r}
                      trigger={<Button size="icon" variant="ghost" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => store.deleteMission(r.id)}
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
                  Aucune mission pour {year}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MissionDialog({ year, mission, trigger }: { year: string; mission?: Mission & { nomComplet?: string }; trigger: React.ReactNode }) {
  const employees = useStore((s) => s.employees);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Mission, "id">>(
    mission
      ? { employeeId: mission.employeeId, date: mission.date, destination: mission.destination, objet: mission.objet }
      : { employeeId: employees[0]?.id ?? "", date: `${year}-01-01`, destination: "", objet: "" },
  );

  return (
    <Dialog open={open} onOpenChange={(o) => {
      setOpen(o);
      if (o) {
        setForm(mission
          ? { employeeId: mission.employeeId, date: mission.date, destination: mission.destination, objet: mission.objet }
          : { employeeId: employees[0]?.id ?? "", date: `${year}-01-01`, destination: "", objet: "" });
      }
    }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mission ? "Modifier la mission" : "Nouvelle mission"}</DialogTitle>
          <DialogDescription>Renseignez les détails de la mission.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">Collaborateur</Label>
            <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.prenom} {e.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Date</Label>
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Destination</Label>
            <Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Paris, France" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">Objet</Label>
            <Input value={form.objet} onChange={(e) => setForm({ ...form, objet: e.target.value })} placeholder="Conférence, audit, etc." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={() => {
            if (!form.employeeId || !form.destination) return;
            if (mission) store.updateMission(mission.id, form);
            else store.addMission(form);
            setOpen(false);
          }}>
            {mission ? "Enregistrer" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
