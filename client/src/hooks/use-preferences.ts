import { useState, useCallback, useEffect, useRef } from "react";

type SyncStatus = "synced" | "syncing" | "error";
type SyncFrequency = "15" | "30" | "60" | "manual";
type SubscriptionTier = "free" | "premium";
type StudyPreference = "morning" | "night" | "flexible";

interface SyncState {
  status: SyncStatus;
  lastSynced: string | null;
  autoSync: boolean;
  frequency: SyncFrequency;
}

interface NotificationPreferences {
  enabled: boolean;
  assignmentReminders: boolean;
  reminderDayBefore: boolean;
  reminderHourBefore: boolean;
  reminder15Min: boolean;
  studyBlockReminders: boolean;
  studyReminder5Min: boolean;
  studyReminderAtStart: boolean;
  breakReminders: boolean;
  breakAfter2Hours: boolean;
  streakReminders: boolean;
  streakCheckInTime: string;
  quietHours: boolean;
  quietStart: string;
  quietEnd: string;
}

interface SubscriptionState {
  tier: SubscriptionTier;
  trialStarted: string | null;
  trialDismissed: boolean;
}

const DEFAULTS = {
  sync: {
    status: "synced" as SyncStatus,
    lastSynced: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    autoSync: true,
    frequency: "30" as SyncFrequency,
  },
  notifications: {
    enabled: true,
    assignmentReminders: true,
    reminderDayBefore: true,
    reminderHourBefore: true,
    reminder15Min: false,
    studyBlockReminders: true,
    studyReminder5Min: true,
    studyReminderAtStart: true,
    breakReminders: true,
    breakAfter2Hours: true,
    streakReminders: true,
    streakCheckInTime: "20:00",
    quietHours: true,
    quietStart: "22:00",
    quietEnd: "07:00",
  },
  subscription: {
    tier: "free" as SubscriptionTier,
    trialStarted: null as string | null,
    trialDismissed: false,
  },
};

function useLocalStorage<T>(key: string, defaultValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setAndPersist = useCallback((val: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof val === "function" ? (val as (prev: T) => T)(prev) : val;
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }, [key]);

  return [value, setAndPersist];
}

export function useSyncStatus() {
  const [sync, setSync] = useLocalStorage<SyncState>("studyflow_sync", DEFAULTS.sync);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerSync = useCallback(async () => {
    setSync(prev => ({ ...prev, status: "syncing" }));
    await new Promise(r => setTimeout(r, 1200));
    setSync(prev => ({
      ...prev,
      status: "synced",
      lastSynced: new Date().toISOString(),
    }));
  }, [setSync]);

  const setAutoSync = useCallback((enabled: boolean) => {
    setSync(prev => ({ ...prev, autoSync: enabled }));
  }, [setSync]);

  const setFrequency = useCallback((freq: SyncFrequency) => {
    setSync(prev => ({ ...prev, frequency: freq }));
  }, [setSync]);

  const clearCache = useCallback(async () => {
    setSync(prev => ({ ...prev, status: "syncing" }));
    await new Promise(r => setTimeout(r, 2000));
    setSync(prev => ({
      ...prev,
      status: "synced",
      lastSynced: new Date().toISOString(),
    }));
  }, [setSync]);

  useEffect(() => {
    if (sync.autoSync && sync.frequency !== "manual") {
      const ms = parseInt(sync.frequency) * 60 * 1000;
      timerRef.current = setInterval(triggerSync, ms);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [sync.autoSync, sync.frequency, triggerSync]);

  const timeSinceSync = sync.lastSynced
    ? Math.floor((Date.now() - new Date(sync.lastSynced).getTime()) / 60000)
    : null;

  return {
    ...sync,
    timeSinceSync,
    triggerSync,
    setAutoSync,
    setFrequency,
    clearCache,
  };
}

export function useNotificationPreferences() {
  const [prefs, setPrefs] = useLocalStorage<NotificationPreferences>(
    "studyflow_notifications",
    DEFAULTS.notifications
  );

  const update = useCallback((updates: Partial<NotificationPreferences>) => {
    setPrefs(prev => ({ ...prev, ...updates }));
  }, [setPrefs]);

  return { ...prefs, update };
}

export function useSubscription() {
  const [sub, setSub] = useLocalStorage<SubscriptionState>(
    "studyflow_subscription",
    DEFAULTS.subscription
  );

  const isPremium = sub.tier === "premium";

  const isInTrial = (() => {
    if (!sub.trialStarted) return false;
    const trialEnd = new Date(sub.trialStarted).getTime() + 7 * 24 * 60 * 60 * 1000;
    return Date.now() < trialEnd;
  })();

  const hasAccess = (feature: string): boolean => {
    const premiumFeatures = [
      "ai_schedule_generation",
      "multiple_platform_sync",
      "unlimited_activities",
      "advanced_recommendations",
      "study_analytics",
      "custom_themes",
    ];
    if (!premiumFeatures.includes(feature)) return true;
    return isPremium || isInTrial;
  };

  const startTrial = useCallback(() => {
    setSub(prev => ({
      ...prev,
      tier: "premium",
      trialStarted: new Date().toISOString(),
    }));
  }, [setSub]);

  const upgrade = useCallback(() => {
    setSub(prev => ({ ...prev, tier: "premium" }));
  }, [setSub]);

  const downgrade = useCallback(() => {
    setSub(prev => ({ ...prev, tier: "free", trialStarted: null }));
  }, [setSub]);

  const dismissTrialBanner = useCallback(() => {
    setSub(prev => ({ ...prev, trialDismissed: true }));
  }, [setSub]);

  const daysLeftInTrial = (() => {
    if (!sub.trialStarted) return 0;
    const trialEnd = new Date(sub.trialStarted).getTime() + 7 * 24 * 60 * 60 * 1000;
    return Math.max(0, Math.ceil((trialEnd - Date.now()) / (24 * 60 * 60 * 1000)));
  })();

  return {
    tier: sub.tier,
    isPremium,
    isInTrial,
    daysLeftInTrial,
    trialDismissed: sub.trialDismissed,
    hasAccess,
    startTrial,
    upgrade,
    downgrade,
    dismissTrialBanner,
  };
}

export function useStudyPreferences() {
  const [prefs, setPrefs] = useLocalStorage<{
    studyPreference: StudyPreference;
    sleepBedtime: string;
    sleepWakeup: string;
  }>("studyflow_study_prefs", {
    studyPreference: "morning",
    sleepBedtime: "22:00",
    sleepWakeup: "06:00",
  });

  const update = useCallback((updates: Partial<typeof prefs>) => {
    setPrefs(prev => ({ ...prev, ...updates }));
  }, [setPrefs]);

  return { ...prefs, update };
}

export type { SyncStatus, SyncFrequency, SubscriptionTier, NotificationPreferences };
