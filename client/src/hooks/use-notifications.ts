import { useState, useCallback, useMemo } from "react";
import { format, isToday, isYesterday, isThisWeek, subDays } from "date-fns";

interface AppNotification {
  id: string;
  type: "assignment_due" | "study_time" | "break" | "streak" | "exam_soon" | "achievement";
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  icon: string;
  route?: string;
}

function generateSampleNotifications(): AppNotification[] {
  const now = new Date();
  return [
    {
      id: "n1",
      type: "study_time",
      title: "Time to study!",
      body: "Start: CS Homework 2 (2 hrs)",
      timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
      read: false,
      icon: "BookOpen",
      route: "/schedule",
    },
    {
      id: "n2",
      type: "assignment_due",
      title: "Assignment due soon",
      body: "PHYS Quiz due in 1 hour",
      timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
      read: false,
      icon: "AlertTriangle",
      route: "/all",
    },
    {
      id: "n3",
      type: "break",
      title: "Take a break",
      body: "You've been studying for 2 hours. Rest for 15 min.",
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      icon: "Coffee",
    },
    {
      id: "n4",
      type: "achievement",
      title: "Great job!",
      body: "Completed 8/10 study blocks yesterday",
      timestamp: subDays(now, 1).toISOString(),
      read: true,
      icon: "Trophy",
    },
    {
      id: "n5",
      type: "streak",
      title: "5 day streak!",
      body: "Keep up the great work",
      timestamp: new Date(subDays(now, 1).setHours(20, 0, 0)).toISOString(),
      read: true,
      icon: "Flame",
    },
    {
      id: "n6",
      type: "exam_soon",
      title: "Exam in 3 days",
      body: "PHYS 172 Exam 1 - Have you started reviewing?",
      timestamp: subDays(now, 2).toISOString(),
      read: true,
      icon: "GraduationCap",
      route: "/schedule",
    },
    {
      id: "n7",
      type: "assignment_due",
      title: "MATH 166 Problem Set due tomorrow",
      body: "Don't forget to submit on WebAssign",
      timestamp: subDays(now, 3).toISOString(),
      read: true,
      icon: "FileText",
      route: "/all",
    },
  ];
}

function getStoredNotifications(): AppNotification[] {
  try {
    const stored = localStorage.getItem("studyflow_app_notifications");
    if (stored) return JSON.parse(stored);
  } catch {}
  const defaults = generateSampleNotifications();
  localStorage.setItem("studyflow_app_notifications", JSON.stringify(defaults));
  return defaults;
}

export function useAppNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>(getStoredNotifications);

  const persist = useCallback((updated: AppNotification[]) => {
    setNotifications(updated);
    localStorage.setItem("studyflow_app_notifications", JSON.stringify(updated));
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  const markAsRead = useCallback((id: string) => {
    persist(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  }, [notifications, persist]);

  const markAllRead = useCallback(() => {
    persist(notifications.map(n => ({ ...n, read: true })));
  }, [notifications, persist]);

  const dismiss = useCallback((id: string) => {
    persist(notifications.filter(n => n.id !== id));
  }, [notifications, persist]);

  const grouped = useMemo(() => {
    const groups: { label: string; items: AppNotification[] }[] = [];
    const today: AppNotification[] = [];
    const yesterday: AppNotification[] = [];
    const thisWeek: AppNotification[] = [];
    const older: AppNotification[] = [];

    const sorted = [...notifications].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    for (const n of sorted) {
      const d = new Date(n.timestamp);
      if (isToday(d)) today.push(n);
      else if (isYesterday(d)) yesterday.push(n);
      else if (isThisWeek(d)) thisWeek.push(n);
      else older.push(n);
    }

    if (today.length) groups.push({ label: "Today", items: today });
    if (yesterday.length) groups.push({ label: "Yesterday", items: yesterday });
    if (thisWeek.length) groups.push({ label: "This Week", items: thisWeek });
    if (older.length) groups.push({ label: "Earlier", items: older });

    return groups;
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    grouped,
    markAsRead,
    markAllRead,
    dismiss,
  };
}

export type { AppNotification };
