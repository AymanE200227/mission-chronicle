import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMembres,
  createMembre,
  updateMembre,
  deleteMembre,
  fetchDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  fetchYears,
  createYear,
  deleteYear,
  fetchMissions,
  createMission,
  updateMission,
  deleteMission,
} from "./api";
import type { Membre, Destination, Mission } from "./api";

export type { Membre, Destination, YearRow, Mission } from "./api";

// --- Membres ---
export function useMembres() {
  return useQuery({
    queryKey: ["membres"],
    queryFn: () => fetchMembres(),
  });
}

export function useMembreMutations() {
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ["membres"] });
  return {
    add: useMutation({
      mutationFn: (m: Omit<Membre, "id">) => createMembre({ data: m }),
      onSuccess: inv,
    }),
    update: useMutation({
      mutationFn: (m: Membre) => updateMembre({ data: m }),
      onSuccess: inv,
    }),
    remove: useMutation({
      mutationFn: (id: string) => deleteMembre({ data: { id } }),
      onSuccess: () => {
        inv();
        qc.invalidateQueries({ queryKey: ["missions"] });
      },
    }),
  };
}

// --- Destinations ---
export function useDestinations() {
  return useQuery({
    queryKey: ["destinations"],
    queryFn: () => fetchDestinations(),
  });
}

export function useDestinationMutations() {
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ["destinations"] });
  return {
    add: useMutation({
      mutationFn: (d: Omit<Destination, "id">) => createDestination({ data: d }),
      onSuccess: inv,
    }),
    update: useMutation({
      mutationFn: (d: Destination) => updateDestination({ data: d }),
      onSuccess: inv,
    }),
    remove: useMutation({
      mutationFn: (id: string) => deleteDestination({ data: { id } }),
      onSuccess: inv,
    }),
  };
}

// --- Years ---
export function useYears() {
  return useQuery({
    queryKey: ["years"],
    queryFn: () => fetchYears(),
  });
}

export function useYearMutations() {
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ["years"] });
  return {
    add: useMutation({
      mutationFn: (year: number) => createYear({ data: { year } }),
      onSuccess: inv,
    }),
    remove: useMutation({
      mutationFn: (id: string) => deleteYear({ data: { id } }),
      onSuccess: inv,
    }),
  };
}

// --- Missions ---
export function useMissions(opts?: { membreId?: string }) {
  return useQuery({
    queryKey: ["missions", opts?.membreId ?? "all"],
    queryFn: () => fetchMissions({ data: { membreId: opts?.membreId } }),
  });
}

export function useMissionMutations() {
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ["missions"] });
  return {
    add: useMutation({
      mutationFn: (m: Omit<Mission, "id">) => createMission({ data: m }),
      onSuccess: inv,
    }),
    update: useMutation({
      mutationFn: (m: Mission) => updateMission({ data: m }),
      onSuccess: inv,
    }),
    remove: useMutation({
      mutationFn: (id: string) => deleteMission({ data: { id } }),
      onSuccess: inv,
    }),
  };
}
