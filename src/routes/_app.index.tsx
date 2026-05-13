import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, store, type Employee } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRight, Pencil, Plus, Search, Trash2, Users } from "lucide-react";

export const Route = createFileRoute("/_app/")({
  component: AccueilPage,
});

function AccueilPage() {
  const employees = useStore((s) => s.employees);
  const missions = useStore((s) => s.missions);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return employees;
    return employees.filter(
      (e) => e.nom.toLowerCase().includes(t) || e.prenom.toLowerCase().includes(t),
    );
  }, [employees, q]);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Users className="h-3.5 w-3.5" />
            Annuaire des collaborateurs
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">Accueil</h1>
          <p className="text-muted-foreground max-w-xl">
            Recherchez un collaborateur par nom ou prénom, puis ouvrez son historique de missions par année.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Stat label="Collaborateurs" value={employees.length} />
          <Stat label="Missions" value={missions.length} />
        </div>
      </section>

      <div className="rounded-2xl border border-border/60 bg-card/60 p-2 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher par nom ou prénom..."
              className="pl-9 h-10 bg-background/80"
            />
          </div>
          <EmployeeDialog
            trigger={
              <Button size="sm" className="h-10 gap-1.5">
                <Plus className="h-4 w-4" /> Ajouter
              </Button>
            }
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Prénom</th>
                <th className="px-5 py-3 text-left font-medium">Nom</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-t border-border/60 hover:bg-secondary/40 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{e.prenom}</td>
                  <td className="px-5 py-3.5">{e.nom}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1">
                      <EmployeeDialog
                        employee={e}
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
                        onClick={() => store.deleteEmployee(e.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        className="h-8 w-8 group"
                        onClick={() => navigate({ to: "/annees/$employeeId", params: { employeeId: e.id } })}
                        title="Voir les années"
                      >
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-12 text-center text-muted-foreground">
                    Aucun collaborateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/70 px-4 py-2.5 backdrop-blur">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function EmployeeDialog({ employee, trigger }: { employee?: Employee; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Employee, "id">>(
    employee ?? { nom: "", prenom: "", poste: "", email: "" },
  );

  return (
    <Dialog open={open} onOpenChange={(o) => {
      setOpen(o);
      if (o) setForm(employee ?? { nom: "", prenom: "", poste: "", email: "" });
    }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{employee ? "Modifier le collaborateur" : "Nouveau collaborateur"}</DialogTitle>
          <DialogDescription>Renseignez les informations ci-dessous.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Prénom"><Input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} /></Field>
          <Field label="Nom"><Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
          <Button
            onClick={() => {
              if (!form.nom || !form.prenom) return;
              if (employee) store.updateEmployee(employee.id, form);
              else store.addEmployee(form);
              setOpen(false);
            }}
          >
            {employee ? "Enregistrer" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`space-y-1.5 ${full ? "col-span-2" : ""}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
