import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertAssignment, type Assignment } from "@shared/schema";

// Helper to keep code clean
const credentials = "include" as const;

export function useAssignments() {
  return useQuery({
    queryKey: [api.assignments.list.path],
    queryFn: async () => {
      const res = await fetch(api.assignments.list.path, { credentials });
      if (!res.ok) throw new Error("Failed to fetch assignments");
      return api.assignments.list.responses[200].parse(await res.json());
    },
  });
}

export function useAssignment(id: number) {
  return useQuery({
    queryKey: [api.assignments.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.assignments.get.path, { id });
      const res = await fetch(url, { credentials });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch assignment");
      return api.assignments.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useToggleAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const url = buildUrl(api.assignments.toggleComplete.path, { id });
      const res = await fetch(url, {
        method: api.assignments.toggleComplete.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
        credentials,
      });

      if (!res.ok) throw new Error("Failed to toggle assignment");
      return api.assignments.toggleComplete.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate the list so UI updates immediately
      queryClient.invalidateQueries({ queryKey: [api.assignments.list.path] });
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertAssignment>) => {
      const url = buildUrl(api.assignments.update.path, { id });
      const validated = api.assignments.update.input.parse(updates);
      const res = await fetch(url, {
        method: api.assignments.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials,
      });

      if (!res.ok) throw new Error("Failed to update assignment");
      return api.assignments.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.assignments.list.path] });
    },
  });
}
