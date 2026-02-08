import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertAssignment, type AssignmentWithCourse } from "@shared/schema";

const credentials = "include" as const;

export function useAssignments() {
  return useQuery<AssignmentWithCourse[]>({
    queryKey: [api.assignments.list.path],
    queryFn: async () => {
      const res = await fetch(api.assignments.list.path, { credentials });
      if (!res.ok) throw new Error("Failed to fetch assignments");
      return res.json();
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
      return res.json();
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
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.assignments.list.path] });
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertAssignment>) => {
      const url = buildUrl(api.assignments.update.path, { id });
      const res = await fetch(url, {
        method: api.assignments.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials,
      });
      if (!res.ok) throw new Error("Failed to update assignment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.assignments.list.path] });
    },
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAssignment) => {
      const res = await fetch(api.assignments.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials,
      });
      if (!res.ok) throw new Error("Failed to create assignment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.assignments.list.path] });
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.assignments.remove.path, { id });
      const res = await fetch(url, {
        method: "DELETE",
        credentials,
      });
      if (!res.ok) throw new Error("Failed to delete assignment");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.assignments.list.path] });
    },
  });
}
