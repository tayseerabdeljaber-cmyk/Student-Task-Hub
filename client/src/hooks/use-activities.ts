import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertActivity, InsertScheduleBlock } from "@shared/schema";

const credentials = "include" as const;

export function useActivities() {
  return useQuery({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      const res = await fetch("/api/activities", { credentials });
      if (!res.ok) throw new Error("Failed to fetch activities");
      return res.json();
    },
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (activity: InsertActivity) => {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activity),
        credentials,
      });
      if (!res.ok) throw new Error("Failed to create activity");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertActivity>) => {
      const url = buildUrl("/api/activities/:id", { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials,
      });
      if (!res.ok) throw new Error("Failed to update activity");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl("/api/activities/:id", { id });
      const res = await fetch(url, {
        method: "DELETE",
        credentials,
      });
      if (!res.ok) throw new Error("Failed to delete activity");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    },
  });
}

export function useScheduleBlocks() {
  return useQuery({
    queryKey: ["/api/schedule-blocks"],
    queryFn: async () => {
      const res = await fetch("/api/schedule-blocks", { credentials });
      if (!res.ok) throw new Error("Failed to fetch schedule blocks");
      return res.json();
    },
  });
}

export function useCreateScheduleBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (block: InsertScheduleBlock) => {
      const res = await fetch("/api/schedule-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(block),
        credentials,
      });
      if (!res.ok) throw new Error("Failed to create schedule block");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule-blocks"] });
    },
  });
}

export function useBulkCreateScheduleBlocks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (blocks: InsertScheduleBlock[]) => {
      const res = await fetch("/api/schedule-blocks/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
        credentials,
      });
      if (!res.ok) throw new Error("Failed to create schedule blocks");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule-blocks"] });
    },
  });
}

export function useToggleScheduleBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isCompleted }: { id: number; isCompleted: boolean }) => {
      const url = buildUrl("/api/schedule-blocks/:id/toggle", { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted }),
        credentials,
      });
      if (!res.ok) throw new Error("Failed to toggle block");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule-blocks"] });
    },
  });
}

export function useDeleteScheduleBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl("/api/schedule-blocks/:id", { id });
      const res = await fetch(url, {
        method: "DELETE",
        credentials,
      });
      if (!res.ok) throw new Error("Failed to delete schedule block");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule-blocks"] });
    },
  });
}

export function useClearGeneratedBlocks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/schedule-blocks/generated", {
        method: "DELETE",
        credentials,
      });
      if (!res.ok) throw new Error("Failed to clear generated blocks");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule-blocks"] });
    },
  });
}
