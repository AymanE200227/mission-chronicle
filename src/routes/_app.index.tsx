import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMembres, useMembreMutations, useMissions, type Membre } from "@/lib/store";
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
import { ArrowRight, Pencil, Plus, Search, Trash2, Users, Briefcase } from "lucide-react";

export const Route = createFileRoute("/_app/")({
  component: AccueilPage,
});

function AccueilPage() {
  const { data: membres = [] } = useMembres();
  const { data: missions = [] } = useMissions();
  const { remove } = useMembreMutations();
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return membres;
    return membres.filter(
      (e) => e.nom.toLowerCase().includes(t) || e.prenom.toLowerCase().includes(t),
    );
  }, [membres, q]);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs text-gold-foreground backdrop-blur">
            <Users className="h-3.5 w-3.5" />
            Annuaire des membres
          </div>
          <h1 className="text-5xl font-semibold tracking-tight">
            <span className="bg-royal bg-clip-text text-transparent">Accueil</span>
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Recherchez un membre par nom ou prénom, puis ouvrez son historique de missions par
            année.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Stat label="Membres" value={membres.length} icon={<Users className="h-4 w-4" />} />
          <Stat
            label="Missions"
            value={missions.length}
            icon={<Briefcase className="h-4 w-4" />}
            accent
          />
        </div>
      </section>

      <div className="glass-card rounded-2xl p-2 shadow-elegant">
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
          <MembreDialog
            trigger={
              <Button size="sm" className="h-10 gap-1.5 btn-royal">
                <Plus className="h-4 w-4" /> Nouveau membre
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
              {filtered.map((e, i) => (
                <tr
                  key={e.id}
                  className="border-t border-border/60 hover:bg-accent/40 transition-colors animate-fade-up"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <td className="px-5 py-3.5 font-medium">{e.prenom}</td>
                  <td className="px-5 py-3.5">{e.nom}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1">
                      <MembreDialog
                        membre={e}
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
                        onClick={() => remove.mutate(e.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        className="h-8 w-8 group btn-royal"
                        onClick={() =>
                          navigate({ to: "/annees/$employeeId", params: { employeeId: e.id } })
                        }
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
                    Aucun membre trouvé.
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

function Stat({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className={`glass-card rounded-xl px-4 py-2.5 ${accent ? "border-gold/40" : ""}`}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div
        className={`text-xl font-semibold tracking-tight tabular-nums ${accent ? "text-gold" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

function MembreDialog({ membre, trigger }: { membre?: Membre; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { add, update } = useMembreMutations();
  const initial = (): Omit<Membre, "id"> =>
    membre ? { nom: membre.nom, prenom: membre.prenom } : { nom: "", prenom: "" };
  const [form, setForm] = useState<Omit<Membre, "id">>(initial);

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
          <DialogTitle>{membre ? "Modifier le membre" : "Nouveau membre"}</DialogTitle>
          <DialogDescription>Renseignez les informations ci-dessous.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Prénom">
            <Input
              value={form.prenom}
              onChange={(e) => setForm({ ...form, prenom: e.target.value })}
            />
          </Field>
          <Field label="Nom">
            <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            className="btn-royal"
            onClick={async () => {
              if (!form.nom || !form.prenom) return;
              if (membre) await update.mutateAsync({ id: membre.id, ...form });
              else await add.mutateAsync(form);
              setOpen(false);
            }}
          >
            {membre ? "Enregistrer" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${full ? "col-span-2" : ""}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
