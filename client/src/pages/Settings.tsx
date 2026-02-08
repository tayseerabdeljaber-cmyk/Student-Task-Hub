import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  User, Link2, Bell, Flame, Moon, Info, LogOut,
  ChevronRight, Plus, RotateCcw, Cloud, RefreshCw,
  Diamond, Clock, Volume2, Star, Trash2, Download, MessageSquare
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useSyncStatus, useNotificationPreferences, useSubscription } from "@/hooks/use-preferences";
import { useToast } from "@/hooks/use-toast";

interface SettingsProps {
  userName: string;
  userEmail: string;
  onLogout: () => void;
}

export default function Settings({ userName, userEmail, onLogout }: SettingsProps) {
  const [, setLocation] = useLocation();
  const sync = useSyncStatus();
  const notifs = useNotificationPreferences();
  const sub = useSubscription();
  const { toast } = useToast();
  const brightspaceConnected = localStorage.getItem("brightspaceConnected") === "true";
  const streak = Number(localStorage.getItem("studyStreak") || "5");
  const darkMode = localStorage.getItem("studyflow_dark_mode") === "true";
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  const handleLogout = () => {
    onLogout();
    setLocation("/login");
  };

  const handleExportData = async () => {
    try {
      const [assignRes, actRes] = await Promise.all([
        fetch("/api/assignments"),
        fetch("/api/activities"),
      ]);
      const assignments = await assignRes.json();
      const activities = await actRes.json();
      const exportData = {
        exportDate: new Date().toISOString(),
        userName,
        userEmail,
        assignments,
        activities,
        preferences: {
          darkMode,
          streak,
          sleepSchedule: JSON.parse(localStorage.getItem("sleepSchedule") || "{}"),
        },
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `studyflow-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Data exported successfully" });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    }
  };

  const handleFeedbackSubmit = () => {
    if (feedbackText.trim()) {
      toast({ title: "Feedback submitted. Thank you!" });
      setFeedbackText("");
      setFeedbackOpen(false);
    }
  };

  const handleDarkMode = (enabled: boolean) => {
    localStorage.setItem("studyflow_dark_mode", String(enabled));
    document.documentElement.classList.toggle("dark", enabled);
  };

  const recurringCount = 9;

  return (
    <div className="pb-24 pt-8 px-4 max-w-md mx-auto min-h-screen bg-background">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold text-foreground mb-6" data-testid="text-settings-title">Settings</h1>

        <Card className="p-5 rounded-2xl mb-4 bg-card border-border">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-indigo-500" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-lg" data-testid="text-profile-name">{userName}</h2>
              <p className="text-sm text-muted-foreground" data-testid="text-profile-email">{userEmail}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Purdue University</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl mb-4 bg-card border-border">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Diamond className="w-4 h-4 text-purple-500" />
            Subscription
          </h3>
          {sub.isPremium ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Current Plan</span>
                <span className="text-sm font-semibold text-purple-600 flex items-center gap-1" data-testid="text-plan-tier">
                  Premium <Star className="w-3 h-3 fill-purple-500 text-purple-500" />
                </span>
              </div>
              {sub.isInTrial && (
                <p className="text-xs text-muted-foreground">Trial: {sub.daysLeftInTrial} days remaining</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">$4.99/month</span>
                <Button variant="outline" size="sm" onClick={sub.downgrade} data-testid="button-cancel-subscription">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Current Plan</span>
                <span className="text-sm font-medium text-muted-foreground" data-testid="text-plan-tier">Free</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Using {Math.min(recurringCount, 3)}/3 activity slots | 1 platform
              </p>
              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                onClick={sub.startTrial}
                data-testid="button-upgrade-premium"
              >
                <Star className="w-4 h-4 mr-2" />
                Start 7-Day Free Trial
              </Button>
            </div>
          )}
        </Card>

        <Card className="p-5 rounded-2xl mb-4 bg-card border-border">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Cloud className="w-4 h-4 text-muted-foreground" />
            Data & Sync
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Auto-sync</span>
              <Switch
                checked={sync.autoSync}
                onCheckedChange={sync.setAutoSync}
                data-testid="switch-auto-sync"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Sync frequency</span>
              <Select value={sync.frequency} onValueChange={(v: any) => sync.setFrequency(v)}>
                <SelectTrigger className="w-[140px] rounded-lg border-border bg-background h-9 text-xs" data-testid="select-sync-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">Every 15 min</SelectItem>
                  <SelectItem value="30">Every 30 min</SelectItem>
                  <SelectItem value="60">Every hour</SelectItem>
                  <SelectItem value="manual">Manual only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last synced</span>
              <span className="text-xs text-muted-foreground" data-testid="text-last-synced">
                {sync.lastSynced
                  ? new Date(sync.lastSynced).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "Never"}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={sync.triggerSync}
                disabled={sync.status === "syncing"}
                data-testid="button-sync-now"
              >
                <RefreshCw className={`w-3 h-3 mr-1.5 ${sync.status === "syncing" ? "animate-spin" : ""}`} />
                Sync Now
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={sync.clearCache}
                data-testid="button-clear-cache"
              >
                <Trash2 className="w-3 h-3 mr-1.5" />
                Clear Cache
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleExportData}
              data-testid="button-export-data"
            >
              <Download className="w-3 h-3 mr-1.5" />
              Export All Data
            </Button>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl mb-4 bg-card border-border">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-muted-foreground" />
            Connected Accounts
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-xs">B</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Brightspace</p>
                  <p className="text-xs text-muted-foreground">{brightspaceConnected ? "Connected" : "Not connected"}</p>
                </div>
              </div>
              <Switch checked={brightspaceConnected} data-testid="switch-brightspace" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xs">G</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Gradescope</p>
                  <p className="text-xs text-muted-foreground">Not connected</p>
                </div>
              </div>
              <button className="text-xs text-indigo-500 font-medium flex items-center gap-1" data-testid="button-reconnect-gradescope">
                <RotateCcw className="w-3 h-3" /> Connect
              </button>
            </div>
            <button className="w-full flex items-center justify-center gap-2 text-sm text-indigo-500 font-medium py-2 border border-dashed border-indigo-200 rounded-xl" data-testid="button-add-platform">
              <Plus className="w-4 h-4" />
              Add Platform
            </button>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl mb-4 bg-card border-border">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-muted-foreground" />
            Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Enable Notifications</span>
              <Switch
                checked={notifs.enabled}
                onCheckedChange={(v) => notifs.update({ enabled: v })}
                data-testid="switch-notifications-enabled"
              />
            </div>

            {notifs.enabled && (
              <>
                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Assignment Reminders</span>
                    <Switch
                      checked={notifs.assignmentReminders}
                      onCheckedChange={(v) => notifs.update({ assignmentReminders: v })}
                      data-testid="switch-assignment-reminders"
                    />
                  </div>
                  {notifs.assignmentReminders && (
                    <div className="ml-4 space-y-2">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input type="checkbox" checked={notifs.reminderDayBefore}
                          onChange={(e) => notifs.update({ reminderDayBefore: e.target.checked })}
                          className="rounded border-border text-indigo-500 w-3.5 h-3.5" />
                        1 day before
                      </label>
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input type="checkbox" checked={notifs.reminderHourBefore}
                          onChange={(e) => notifs.update({ reminderHourBefore: e.target.checked })}
                          className="rounded border-border text-indigo-500 w-3.5 h-3.5" />
                        1 hour before
                      </label>
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input type="checkbox" checked={notifs.reminder15Min}
                          onChange={(e) => notifs.update({ reminder15Min: e.target.checked })}
                          className="rounded border-border text-indigo-500 w-3.5 h-3.5" />
                        15 minutes before
                      </label>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Study Block Reminders</span>
                    <Switch
                      checked={notifs.studyBlockReminders}
                      onCheckedChange={(v) => notifs.update({ studyBlockReminders: v })}
                      data-testid="switch-study-reminders"
                    />
                  </div>
                  {notifs.studyBlockReminders && (
                    <div className="ml-4 space-y-2">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input type="checkbox" checked={notifs.studyReminder5Min}
                          onChange={(e) => notifs.update({ studyReminder5Min: e.target.checked })}
                          className="rounded border-border text-indigo-500 w-3.5 h-3.5" />
                        5 minutes before start
                      </label>
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input type="checkbox" checked={notifs.studyReminderAtStart}
                          onChange={(e) => notifs.update({ studyReminderAtStart: e.target.checked })}
                          className="rounded border-border text-indigo-500 w-3.5 h-3.5" />
                        At start time
                      </label>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Break Reminders</span>
                    <Switch
                      checked={notifs.breakReminders}
                      onCheckedChange={(v) => notifs.update({ breakReminders: v })}
                      data-testid="switch-break-reminders"
                    />
                  </div>
                  {notifs.breakReminders && (
                    <div className="ml-4">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input type="checkbox" checked={notifs.breakAfter2Hours}
                          onChange={(e) => notifs.update({ breakAfter2Hours: e.target.checked })}
                          className="rounded border-border text-indigo-500 w-3.5 h-3.5" />
                        After 2 hours of study
                      </label>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Streak Reminders</span>
                    <Switch
                      checked={notifs.streakReminders}
                      onCheckedChange={(v) => notifs.update({ streakReminders: v })}
                      data-testid="switch-streak-reminders"
                    />
                  </div>
                  {notifs.streakReminders && (
                    <div className="ml-4 space-y-2">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input type="checkbox" checked className="rounded border-border text-indigo-500 w-3.5 h-3.5" readOnly />
                        Daily streak check-in
                      </label>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Time:</span>
                        <input
                          type="time"
                          value={notifs.streakCheckInTime}
                          onChange={(e) => notifs.update({ streakCheckInTime: e.target.value })}
                          className="text-xs border border-border rounded-md px-2 py-1 bg-background"
                          data-testid="input-streak-time"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                      Quiet Hours
                    </span>
                    <Switch
                      checked={notifs.quietHours}
                      onCheckedChange={(v) => notifs.update({ quietHours: v })}
                      data-testid="switch-quiet-hours"
                    />
                  </div>
                  {notifs.quietHours && (
                    <div className="ml-4 flex items-center gap-2">
                      <input
                        type="time"
                        value={notifs.quietStart}
                        onChange={(e) => notifs.update({ quietStart: e.target.value })}
                        className="text-xs border border-border rounded-md px-2 py-1 bg-background"
                        data-testid="input-quiet-start"
                      />
                      <span className="text-xs text-muted-foreground">to</span>
                      <input
                        type="time"
                        value={notifs.quietEnd}
                        onChange={(e) => notifs.update({ quietEnd: e.target.value })}
                        className="text-xs border border-border rounded-md px-2 py-1 bg-background"
                        data-testid="input-quiet-end"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </Card>

        <Card className="p-5 rounded-2xl mb-4 bg-card border-border">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Study Streak
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground" data-testid="text-streak-count">{streak}</p>
              <p className="text-xs text-muted-foreground">day streak</p>
            </div>
            <div className="flex-1 grid grid-cols-7 gap-1">
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-full aspect-square rounded-sm ${
                    i < streak + 2 ? "bg-indigo-500" : i < 10 ? "bg-indigo-200 dark:bg-indigo-800/40" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl mb-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">Dark Mode</span>
            </div>
            <Switch checked={darkMode} onCheckedChange={handleDarkMode} data-testid="switch-dark-mode" />
          </div>
        </Card>

        <Card className="p-5 rounded-2xl mb-4 bg-card border-border">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-muted-foreground" />
            About
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="text-sm text-foreground font-medium" data-testid="text-app-version">1.0.0</span>
            </div>
            <button
              className="w-full flex items-center justify-between text-sm text-foreground py-2"
              onClick={() => setFeedbackOpen(!feedbackOpen)}
              data-testid="button-feedback"
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                Give Feedback
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            {feedbackOpen && (
              <div className="space-y-2 pt-2">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell us what you think..."
                  rows={3}
                  className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  data-testid="textarea-feedback"
                />
                <Button
                  size="sm"
                  onClick={handleFeedbackSubmit}
                  disabled={!feedbackText.trim()}
                  data-testid="button-submit-feedback"
                >
                  Submit Feedback
                </Button>
              </div>
            )}
          </div>
        </Card>

        <Button
          variant="outline"
          onClick={() => setLogoutConfirmOpen(true)}
          className="w-full h-12 rounded-xl text-base font-semibold text-rose-500 border-rose-200 mt-4"
          data-testid="button-logout"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>
      </motion.div>

      <ConfirmDialog
        open={logoutConfirmOpen}
        title="Log Out"
        description="Are you sure you want to log out? You can log back in anytime."
        confirmLabel="Log Out"
        variant="danger"
        onConfirm={() => {
          setLogoutConfirmOpen(false);
          handleLogout();
        }}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </div>
  );
}
