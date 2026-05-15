import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import {
  useDestinations,
  useMissionsByDestination,
  useAvailableMembres,
  type MissionWithMembre,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, MapPin, Shuffle, SkipForward, User } from "lucide-react";

export const Route = createFileRoute("/_app/ecoles")({
  component: EcolesPage,
});

function EcolesPage() {
  const { data: destinations = [] } = useDestinations();
  const [selected, setSelected] = useState<string>("");

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs text-gold-foreground">
          <GraduationCap className="h-3.5 w-3.5" /> Par école
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          <span className="bg-royal bg-clip-text text-transparent">Écoles</span>
        </h1>
        <p className="mt-1 text-muted-foreground">
          Sélectionnez une école (destination) pour voir toutes les missions associées et tirer un
          membre au hasard.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-4 shadow-elegant flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" /> École / Destination
        </div>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-[320px] bg-background/80">
            <SelectValue placeholder="Choisir une école..." />
          </SelectTrigger>
          <SelectContent>
            {destinations.map((d) => (
              <SelectItem key={d.id} value={d.name}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selected && (
          <Button variant="ghost" size="sm" onClick={() => setSelected("")}>
            Réinitialiser
          </Button>
        )}
      </div>

      {selected && (
        <>
          <RandomMembreSection destinationName={selected} />
          <MissionsByDestinationTable destinationName={selected} />
        </>
      )}

      {!selected && (
        <div className="glass-card rounded-2xl shadow-elegant px-5 py-16 text-center text-muted-foreground">
          Sélectionnez une école ci-dessus pour afficher les missions.
        </div>
      )}
    </div>
  );
}

function RandomMembreSection({ destinationName }: { destinationName: string }) {
  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const { data: available = [], isLoading } = useAvailableMembres(destinationName, skippedIds);

  const pick = useCallback(() => {
    if (available.length === 0) return;
    const idx = Math.floor(Math.random() * available.length);
    setCurrentIndex(idx);
  }, [available]);

  const skip = useCallback(() => {
    if (currentIndex === null || available.length === 0) return;
    const skipped = available[currentIndex];
    setSkippedIds((prev) => [...prev, skipped.id]);
    setCurrentIndex(null);
  }, [currentIndex, available]);

  const reset = useCallback(() => {
    setSkippedIds([]);
    setCurrentIndex(null);
  }, []);

  const current = currentIndex !== null && available[currentIndex] ? available[currentIndex] : null;

  return (
    <div className="glass-card rounded-2xl p-6 shadow-elegant space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Shuffle className="h-4 w-4 text-gold" />
        Tirage au sort — Nouveau membre pour{" "}
        <span className="text-gold font-semibold">{destinationName}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Les membres ayant déjà une mission à cette destination sont exclus automatiquement.
        {skippedIds.length > 0 && ` ${skippedIds.length} membre(s) ignoré(s) manuellement.`}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={pick} className="gap-1.5 btn-royal" disabled={available.length === 0}>
          <Shuffle className="h-4 w-4" />
          {current ? "Nouveau tirage" : "Tirer un membre"}
        </Button>

        {current && (
          <Button onClick={skip} variant="outline" className="gap-1.5">
            <SkipForward className="h-4 w-4" /> Passer
          </Button>
        )}

        {skippedIds.length > 0 && (
          <Button onClick={reset} variant="ghost" size="sm">
            Réinitialiser les exclusions
          </Button>
        )}

        <span className="ml-auto text-xs text-muted-foreground">
          {isLoading ? "Chargement..." : `${available.length} membre(s) disponible(s)`}
        </span>
      </div>

      {current && (
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-gold/40 bg-gold/5 px-5 py-4 animate-fade-up">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-royal text-primary-foreground">
            <User className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-lg">
              {current.prenom} {current.nom}
            </div>
            <div className="text-xs text-muted-foreground">
              Disponible pour une mission à {destinationName}
            </div>
          </div>
        </div>
      )}

      {!current && available.length === 0 && !isLoading && (
        <div className="rounded-xl border border-border/60 px-5 py-4 text-sm text-muted-foreground text-center">
          Aucun membre disponible — tous ont déjà une mission à cette destination
          {skippedIds.length > 0 ? " ou ont été ignorés" : ""}.
        </div>
      )}
    </div>
  );
}

function MissionsByDestinationTable({ destinationName }: { destinationName: string }) {
  const { data: missions = [], isLoading } = useMissionsByDestination(destinationName);

  return (
    <div className="overflow-hidden rounded-2xl glass-card shadow-elegant">
      <div className="px-5 py-3 border-b border-border/60 bg-secondary/30">
        <h2 className="text-sm font-medium">
          Missions à <span className="text-gold">{destinationName}</span>{" "}
          <span className="text-muted-foreground">({missions.length})</span>
        </h2>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-5 py-3 text-left font-medium">Membre</th>
            <th className="px-5 py-3 text-left font-medium">Date</th>
            <th className="px-5 py-3 text-left font-medium">Mission</th>
          </tr>
        </thead>
        <tbody>
          {missions.map((m, i) => (
            <tr
              key={m.id}
              className="border-t border-border/60 hover:bg-accent/40 transition-colors animate-fade-up"
              style={{ animationDelay: `${i * 25}ms` }}
            >
              <td className="px-5 py-3.5 font-medium">
                {m.membre_prenom} {m.membre_nom}
              </td>
              <td className="px-5 py-3.5 text-muted-foreground tabular-nums">
                {new Date(m.date).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="px-5 py-3.5 text-muted-foreground">{m.mission}</td>
            </tr>
          ))}
          {missions.length === 0 && !isLoading && (
            <tr>
              <td colSpan={3} className="px-5 py-12 text-center text-muted-foreground">
                Aucune mission trouvée pour {destinationName}.
              </td>
            </tr>
          )}
          {isLoading && (
            <tr>
              <td colSpan={3} className="px-5 py-12 text-center text-muted-foreground">
                Chargement...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
