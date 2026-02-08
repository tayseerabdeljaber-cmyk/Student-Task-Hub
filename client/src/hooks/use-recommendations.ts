import { useMemo } from "react";
import type { AssignmentWithCourse, ScheduleBlock } from "@shared/schema";

interface Recommendation {
  id: string;
  type: "start_early" | "balance_workload" | "exam_prep" | "break_needed" | "office_hours" | "on_track";
  priority: "low" | "medium" | "high";
  title: string;
  description: string;
  actionLabel?: string;
  actionRoute?: string;
  dismissible: boolean;
}

function daysUntil(date: string | Date): number {
  const d = new Date(date);
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function estimateHours(type: string): number {
  const map: Record<string, number> = {
    homework: 2,
    quiz: 1.5,
    exam: 6,
    lab: 3,
    project: 8,
    reading: 1,
  };
  return map[type] || 2;
}

export function useRecommendations(
  assignments?: AssignmentWithCourse[],
  scheduleBlocks?: ScheduleBlock[]
): Recommendation[] {
  return useMemo(() => {
    if (!assignments) return [];
    const recs: Recommendation[] = [];
    const incomplete = assignments.filter(a => !a.completed);
    const now = new Date();

    incomplete
      .filter(a => estimateHours(a.type) >= 4 && daysUntil(a.dueDate) >= 3)
      .slice(0, 1)
      .forEach(a => {
        recs.push({
          id: `start_early_${a.id}`,
          type: "start_early",
          priority: "high",
          title: `Start ${a.course.code} ${a.type} early`,
          description: `This ${a.type} typically takes ${estimateHours(a.type)}+ hours. Start now to avoid last-minute stress.`,
          actionLabel: "Schedule now",
          actionRoute: "/schedule",
          dismissible: true,
        });
      });

    incomplete
      .filter(a => a.type === "exam" && daysUntil(a.dueDate) <= 7 && daysUntil(a.dueDate) > 0)
      .slice(0, 2)
      .forEach(a => {
        const days = daysUntil(a.dueDate);
        const studyScheduled = scheduleBlocks
          ? scheduleBlocks.filter(b => b.assignmentId === a.id).length * 1.5
          : 0;

        if (studyScheduled < 4) {
          recs.push({
            id: `exam_prep_${a.id}`,
            type: "exam_prep",
            priority: "high",
            title: `${a.course.code} exam in ${days} day${days > 1 ? "s" : ""}`,
            description: `You've scheduled ~${Math.round(studyScheduled)} hours of study. Consider adding more review sessions.`,
            actionLabel: "Add study time",
            actionRoute: "/schedule",
            dismissible: true,
          });
        }
      });

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekEnd = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thisWeekAssignments = incomplete.filter(a => {
      const d = new Date(a.dueDate);
      return d >= todayStart && d <= weekEnd;
    });
    const dayLoads = new Map<string, number>();
    thisWeekAssignments.forEach(a => {
      const dayKey = new Date(a.dueDate).toDateString();
      dayLoads.set(dayKey, (dayLoads.get(dayKey) || 0) + estimateHours(a.type));
    });
    const heavyDays = [...dayLoads.entries()].filter(([, hrs]) => hrs >= 6);
    if (heavyDays.length > 0) {
      recs.push({
        id: "balance_workload",
        type: "balance_workload",
        priority: "medium",
        title: "Heavy workload ahead",
        description: `You have ${thisWeekAssignments.length} assignments this week. Consider spreading study time across lighter days.`,
        actionLabel: "View schedule",
        actionRoute: "/schedule",
        dismissible: true,
      });
    }

    const completedCount = assignments.filter(a => a.completed).length;
    const totalCount = assignments.length;
    if (totalCount > 0 && completedCount / totalCount > 0.7) {
      recs.push({
        id: "on_track",
        type: "on_track",
        priority: "low",
        title: "You're on track!",
        description: `${Math.round((completedCount / totalCount) * 100)}% of assignments complete. Keep up the great work.`,
        dismissible: true,
      });
    }

    const streak = Number(localStorage.getItem("studyStreak") || "0");
    if (scheduleBlocks && scheduleBlocks.filter(b => b.isCompleted).length > 10) {
      recs.push({
        id: "break_needed",
        type: "break_needed",
        priority: "medium",
        title: "You've been working hard",
        description: "Remember to take breaks to avoid burnout. A 15-minute walk can boost focus.",
        actionLabel: "Schedule free time",
        actionRoute: "/activities",
        dismissible: true,
      });
    }

    return recs.sort((a, b) => {
      const order = { high: 3, medium: 2, low: 1 };
      return order[b.priority] - order[a.priority];
    }).slice(0, 3);
  }, [assignments, scheduleBlocks]);
}

export type { Recommendation };
