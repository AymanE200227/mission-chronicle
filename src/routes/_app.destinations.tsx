import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useDestinations, useDestinationMutations, type Destination } from "@/lib/store";
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
import { MapPin, Pencil, Plus, Search, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_app/destinations")({
  component: DestinationsPage,
});

function DestinationsPage() {
  const { data: destinations = [] } = useDestinations();
  const { remove } = useDestinationMutations();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return destinations;
    return destinations.filter((d) => d.name.toLowerCase().includes(t));
  }, [destinations, q]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs text-gold-foreground">
            <MapPin className="h-3.5 w-3.5" /> Catalogue
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            <span className="bg-royal bg-clip-text text-transparent">Destinations</span>
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gérez la liste des écoles et bases militaires utilisées dans les missions.
          </p>
        </div>
        <DestinationDialog
          trigger={
            <Button className="gap-1.5 btn-royal">
              <Plus className="h-4 w-4" /> Nouvelle destination
            </Button>
          }
        />
      </div>

      <div className="glass-card rounded-2xl p-2 shadow-elegant">
        <div className="p-4">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher une destination..."
              className="pl-9 h-10 bg-background/80"
            />
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Nom</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr
                  key={d.id}
                  className="border-t border-border/60 hover:bg-accent/40 transition-colors animate-fade-up"
                  style={{ animationDelay: `${i * 25}ms` }}
                >
                  <td className="px-5 py-3.5 font-medium">
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-gold" />
                      {d.name}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1">
                      <DestinationDialog
                        destination={d}
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
                        onClick={() => remove.mutate(d.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-5 py-12 text-center text-muted-foreground">
                    Aucune destination trouvée.
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

function DestinationDialog({
  destination,
  trigger,
}: {
  destination?: Destination;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { add, update } = useDestinationMutations();
  const initial = (): Omit<Destination, "id"> =>
    destination ? { name: destination.name } : { name: "" };
  const [form, setForm] = useState<Omit<Destination, "id">>(initial);

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
          <DialogTitle>
            {destination ? "Modifier la destination" : "Nouvelle destination"}
          </DialogTitle>
          <DialogDescription>Ex. ARM, ERA, ERN, base militaire...</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Nom</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="ARM - Académie Royale Militaire (Meknès)"
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
              if (!form.name) return;
              if (destination) await update.mutateAsync({ id: destination.id, ...form });
              else await add.mutateAsync(form);
              setOpen(false);
            }}
          >
            {destination ? "Enregistrer" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
