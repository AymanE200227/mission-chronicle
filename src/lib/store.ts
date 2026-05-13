import { useSyncExternalStore } from "react";

export type Mission = {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  destination: string;
  objet: string;
};

export type Employee = {
  id: string;
  nom: string;
  prenom: string;
  poste: string;
  email: string;
};

type State = {
  employees: Employee[];
  missions: Mission[];
};

const KEY = "mission-app-v1";

const seed: State = {
  employees: [
    { id: "e1", nom: "Benali", prenom: "Sara", poste: "Ingénieure", email: "s.benali@corp.io" },
    { id: "e2", nom: "Haddad", prenom: "Youssef", poste: "Chef de projet", email: "y.haddad@corp.io" },
    { id: "e3", nom: "Khelifi", prenom: "Amine", poste: "Analyste", email: "a.khelifi@corp.io" },
    { id: "e4", nom: "Trabelsi", prenom: "Lina", poste: "Designer", email: "l.trabelsi@corp.io" },
  ],
  missions: [
    { id: "m1", employeeId: "e1", date: "2026-02-12", destination: "Paris, France", objet: "Conférence tech" },
    { id: "m2", employeeId: "e1", date: "2025-09-03", destination: "Berlin, Allemagne", objet: "Audit client" },
    { id: "m3", employeeId: "e2", date: "2024-06-20", destination: "Tunis, Tunisie", objet: "Lancement produit" },
    { id: "m4", employeeId: "e3", date: "2023-11-08", destination: "Dubai, EAU", objet: "Salon international" },
    { id: "m5", employeeId: "e4", date: "2022-04-15", destination: "Madrid, Espagne", objet: "Workshop design" },
    { id: "m6", employeeId: "e2", date: "2026-05-22", destination: "Casablanca, Maroc", objet: "Réunion partenaires" },
  ],
};

function load(): State {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed;
    return JSON.parse(raw);
  } catch {
    return seed;
  }
}

let state: State = load();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export const store = {
  getState: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  addEmployee: (e: Omit<Employee, "id">) => {
    state = { ...state, employees: [...state.employees, { ...e, id: crypto.randomUUID() }] };
    persist();
  },
  updateEmployee: (id: string, e: Omit<Employee, "id">) => {
    state = { ...state, employees: state.employees.map((x) => (x.id === id ? { ...e, id } : x)) };
    persist();
  },
  deleteEmployee: (id: string) => {
    state = {
      employees: state.employees.filter((x) => x.id !== id),
      missions: state.missions.filter((m) => m.employeeId !== id),
    };
    persist();
  },
  addMission: (m: Omit<Mission, "id">) => {
    state = { ...state, missions: [...state.missions, { ...m, id: crypto.randomUUID() }] };
    persist();
  },
  updateMission: (id: string, m: Omit<Mission, "id">) => {
    state = { ...state, missions: state.missions.map((x) => (x.id === id ? { ...m, id } : x)) };
    persist();
  },
  deleteMission: (id: string) => {
    state = { ...state, missions: state.missions.filter((x) => x.id !== id) };
    persist();
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(seed),
  );
}
