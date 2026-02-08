import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, Moon, Sun, Clock, MapPin, BookOpen, Coffee, UtensilsCrossed, Dumbbell, Briefcase, Trophy, Users, Heart, MessageSquare, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActivities, useDeleteActivity, useUpdateActivity } from "@/hooks/use-activities";
import { AddActivityModal } from "@/components/AddActivityModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Activity } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ICON_MAP: Record<string, typeof BookOpen> = {
  BookOpen, Coffee, UtensilsCrossed, Dumbbell, Briefcase, Trophy, Users, Heart, MessageSquare,
};

function getIcon(iconName: string) {
  return ICON_MAP[iconName] || BookOpen;
}

function formatDays(days: string[] | null): string {
  if (!days || days.length === 0) return "";
  if (days.length === 7) return "Daily";
  const abbr: Record<string, string> = {
    Monday: "M", Tuesday: "T", Wednesday: "W", Thursday: "Th", Friday: "F", Saturday: "Sa", Sunday: "Su"
  };
  const mwf = ["Monday", "Wednesday", "Friday"];
  const tth = ["Tuesday", "Thursday"];
  if (days.length === 3 && mwf.every(d => days.includes(d))) return "MWF";
  if (days.length === 2 && tth.every(d => days.includes(d))) return "TTh";
  return days.map(d => abbr[d] || d).join("");
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function ActivityCard({ activity, onEdit, onDelete }: { activity: Activity; onEdit: (a: Activity) => void; onDelete: (id: number) => void }) {
  const Icon = getIcon(activity.icon);

  return (
    <Card
      className="p-4 relative"
      data-testid={`card-activity-${activity.id}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${activity.color}20` }}>
          <Icon className="w-4.5 h-4.5" style={{ color: activity.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground text-sm truncate" data-testid={`text-activity-name-${activity.id}`}>{activity.name}</h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {activity.frequency === "daily" ? "Daily" : formatDays(activity.daysOfWeek)} {formatTime(activity.startTime)}-{activity.endTime ? formatTime(activity.endTime) : ""}
            </span>
            {activity.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {activity.location}
              </span>
            )}
          </div>
          {activity.frequency !== "once" && (
            <div className="mt-1">
              <Badge variant="secondary" className="text-[10px]">
                Repeats: {activity.frequency === "daily" ? "Daily" : "Weekly"}
              </Badge>
            </div>
          )}
          {activity.frequency === "once" && activity.eventDate && (
            <div className="mt-1 text-xs text-muted-foreground">
              {new Date(activity.eventDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button size="icon" variant="ghost" onClick={() => onEdit(activity)} data-testid={`button-edit-activity-${activity.id}`}>
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onDelete(activity.id)} data-testid={`button-delete-activity-${activity.id}`}>
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function CollapsibleSection({ title, count, defaultOpen = true, children }: { title: string; count: number; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-4">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 w-full text-left py-2" data-testid={`button-toggle-section-${title.toLowerCase().replace(/\s+/g, "-")}`}>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        <span className="font-semibold text-foreground text-sm">{title}</span>
        <Badge variant="secondary" className="text-[10px]">{count}</Badge>
      </button>
      {open && <div className="space-y-2 mt-1">{children}</div>}
    </div>
  );
}

export default function Activities() {
  const { data: activities = [], isLoading } = useActivities();
  const deleteMutation = useDeleteActivity();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const sleepSchedule = useMemo(() => {
    const stored = localStorage.getItem("sleepSchedule");
    return stored ? JSON.parse(stored) : { bedtime: "22:00", wakeTime: "06:00" };
  }, []);

  const [bedtime, setBedtime] = useState(sleepSchedule.bedtime);
  const [wakeTime, setWakeTime] = useState(sleepSchedule.wakeTime);
  const [editingSleep, setEditingSleep] = useState(false);

  const saveSleep = () => {
    localStorage.setItem("sleepSchedule", JSON.stringify({ bedtime, wakeTime }));
    setEditingSleep(false);
  };

  const classes = useMemo(() => (activities as Activity[]).filter((a: Activity) => a.type === "class"), [activities]);
  const recurring = useMemo(() => (activities as Activity[]).filter((a: Activity) => a.type !== "class" && a.frequency !== "once"), [activities]);
  const events = useMemo(() => (activities as Activity[]).filter((a: Activity) => a.frequency === "once" && !a.completed), [activities]);

  const dailyActivities = recurring.filter((a: Activity) => a.frequency === "daily");
  const weeklyActivities = recurring.filter((a: Activity) => a.frequency === "weekly");

  const sleepHours = useMemo(() => {
    const [bH, bM] = bedtime.split(":").map(Number);
    const [wH, wM] = wakeTime.split(":").map(Number);
    let diff = (wH * 60 + wM) - (bH * 60 + bM);
    if (diff < 0) diff += 24 * 60;
    return Math.round(diff / 60 * 10) / 10;
  }, [bedtime, wakeTime]);

  const stats = useMemo(() => {
    let classHrs = 0;
    let activityHrs = 0;
    (activities as Activity[]).forEach((a: Activity) => {
      if (!a.endTime || !a.startTime) return;
      const [sH, sM] = a.startTime.split(":").map(Number);
      const [eH, eM] = a.endTime.split(":").map(Number);
      const dur = ((eH * 60 + eM) - (sH * 60 + sM)) / 60;
      if (dur <= 0) return;
      const daysPerWeek = a.frequency === "daily" ? 7 : (a.daysOfWeek?.length || 1);
      const weeklyHrs = dur * daysPerWeek;
      if (a.type === "class") classHrs += weeklyHrs;
      else activityHrs += weeklyHrs;
    });
    const totalScheduled = classHrs + activityHrs;
    const available = Math.max(0, (24 - sleepHours) * 7 - totalScheduled);
    return { classHrs: Math.round(classHrs), activityHrs: Math.round(activityHrs), totalScheduled: Math.round(totalScheduled), available: Math.round(available) };
  }, [activities, sleepHours]);

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    if (deleteTarget !== null) {
      deleteMutation.mutate(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const handleAddNew = () => {
    setEditingActivity(null);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-activities-title">My Activities</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your classes and recurring commitments</p>
          </div>
          <Button size="icon" onClick={handleAddNew} data-testid="button-add-activity">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="px-5">
        <CollapsibleSection title="Classes" count={classes.length}>
          {classes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No classes added yet</p>
          ) : (
            classes.map((a: Activity) => (
              <ActivityCard key={a.id} activity={a} onEdit={handleEdit} onDelete={handleDelete} />
            ))
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Recurring Activities" count={recurring.length}>
          {dailyActivities.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 pl-1">Daily</p>
              <div className="space-y-2">
                {dailyActivities.map((a: Activity) => (
                  <ActivityCard key={a.id} activity={a} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
          {weeklyActivities.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 pl-1">Weekly</p>
              <div className="space-y-2">
                {weeklyActivities.map((a: Activity) => (
                  <ActivityCard key={a.id} activity={a} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
          {recurring.length === 0 && <p className="text-sm text-muted-foreground py-2">No recurring activities</p>}
        </CollapsibleSection>

        <CollapsibleSection title="Upcoming Events" count={events.length} defaultOpen={events.length > 0}>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No upcoming one-time events</p>
          ) : (
            events.map((a: Activity) => (
              <ActivityCard key={a.id} activity={a} onEdit={handleEdit} onDelete={handleDelete} />
            ))
          )}
        </CollapsibleSection>

        <div className="mb-4">
          <div className="flex items-center gap-2 py-2">
            <Moon className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-foreground text-sm">Sleep Schedule</span>
          </div>
          <Card className="p-4" data-testid="card-sleep-schedule">
            {editingSleep ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Bedtime</label>
                    <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" data-testid="input-bedtime" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Wake Time</label>
                    <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" data-testid="input-waketime" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveSleep} data-testid="button-save-sleep">Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingSleep(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setEditingSleep(true)} data-testid="button-edit-sleep">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span className="font-medium">{formatTime(bedtime)}</span>
                    <span className="text-muted-foreground">-</span>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="font-medium">{formatTime(wakeTime)}</span>
                  </div>
                </div>
                <Badge variant="secondary">{sleepHours} hrs</Badge>
              </div>
            )}
          </Card>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 py-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-foreground text-sm">Weekly Summary</span>
          </div>
          <Card className="p-4" data-testid="card-weekly-stats">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Class hours</p>
                <p className="text-lg font-bold text-foreground" data-testid="text-class-hours">{stats.classHrs} hrs</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Activity hours</p>
                <p className="text-lg font-bold text-foreground" data-testid="text-activity-hours">{stats.activityHrs} hrs</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total scheduled</p>
                <p className="text-lg font-bold text-indigo-600">{stats.totalScheduled} hrs</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Available study time</p>
                <p className="text-lg font-bold text-emerald-600" data-testid="text-available-hours">{stats.available} hrs</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <AddActivityModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editingActivity={editingActivity}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Activity"
        description="Are you sure you want to delete this activity? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
