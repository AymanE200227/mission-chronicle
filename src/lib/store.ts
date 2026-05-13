import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Employee = { id: string; nom: string; prenom: string; poste: string; email: string };
export type Destination = { id: string; name: string; category: string };
export type YearRow = { id: string; year: number };
export type Mission = {
  id: string;
  employee_id: string;
  destination_id: string | null;
  destination_name: string;
  mission: string;
  date: string;
};

// --- Employees ---
export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async (): Promise<Employee[]> => {
      const { data, error } = await supabase.from("employees").select("*").order("nom");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useEmployeeMutations() {
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ["employees"] });
  return {
    add: useMutation({
      mutationFn: async (e: Omit<Employee, "id">) => {
        const { error } = await supabase.from("employees").insert(e);
        if (error) throw error;
      },
      onSuccess: inv,
    }),
    update: useMutation({
      mutationFn: async ({ id, ...e }: Employee) => {
        const { error } = await supabase.from("employees").update(e).eq("id", id);
        if (error) throw error;
      },
      onSuccess: inv,
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from("employees").delete().eq("id", id);
        if (error) throw error;
      },
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
    queryFn: async (): Promise<Destination[]> => {
      const { data, error } = await supabase.from("destinations").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useDestinationMutations() {
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ["destinations"] });
  return {
    add: useMutation({
      mutationFn: async (d: Omit<Destination, "id">) => {
        const { error } = await supabase.from("destinations").insert(d);
        if (error) throw error;
      },
      onSuccess: inv,
    }),
    update: useMutation({
      mutationFn: async ({ id, ...d }: Destination) => {
        const { error } = await supabase.from("destinations").update(d).eq("id", id);
        if (error) throw error;
      },
      onSuccess: inv,
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from("destinations").delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: inv,
    }),
  };
}

// --- Years ---
export function useYears() {
  return useQuery({
    queryKey: ["years"],
    queryFn: async (): Promise<YearRow[]> => {
      const { data, error } = await supabase.from("years").select("*").order("year", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useYearMutations() {
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ["years"] });
  return {
    add: useMutation({
      mutationFn: async (year: number) => {
        const { error } = await supabase.from("years").insert({ year });
        if (error) throw error;
      },
      onSuccess: inv,
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from("years").delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: inv,
    }),
  };
}

// --- Missions ---
export function useMissions(opts?: { employeeId?: string }) {
  return useQuery({
    queryKey: ["missions", opts?.employeeId ?? "all"],
    queryFn: async (): Promise<Mission[]> => {
      let q = supabase.from("missions").select("*").order("date", { ascending: false });
      if (opts?.employeeId) q = q.eq("employee_id", opts.employeeId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMissionMutations() {
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ["missions"] });
  return {
    add: useMutation({
      mutationFn: async (m: Omit<Mission, "id">) => {
        const { error } = await supabase.from("missions").insert(m);
        if (error) throw error;
      },
      onSuccess: inv,
    }),
    update: useMutation({
      mutationFn: async ({ id, ...m }: Mission) => {
        const { error } = await supabase.from("missions").update(m).eq("id", id);
        if (error) throw error;
      },
      onSuccess: inv,
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from("missions").delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: inv,
    }),
  };
}
