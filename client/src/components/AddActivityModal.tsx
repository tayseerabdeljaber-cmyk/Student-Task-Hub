import { useState, useEffect } from "react";
import { X, BookOpen, Coffee, UtensilsCrossed, Dumbbell, Briefcase, Trophy, Users, Heart, Gamepad2, Music, Palette, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateActivity, useUpdateActivity } from "@/hooks/use-activities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Activity } from "@shared/schema";

const QUICK_TEMPLATES = [
  { name: "Study Session", icon: "BookOpen", type: "study", color: "#3b82f6", defaults: { startTime: "09:00", durationMinutes: 120, frequency: "weekly", priority: "medium" } },
  { name: "Gym / Workout", icon: "Dumbbell", type: "exercise", color: "#f97316", defaults: { startTime: "06:30", durationMinutes: 60, frequency: "weekly", priority: "medium" } },
  { name: "Meal", icon: "UtensilsCrossed", type: "meal", color: "#f59e0b", defaults: { startTime: "12:00", durationMinutes: 45, frequency: "daily", priority: "low" } },
  { name: "Work / Job", icon: "Briefcase", type: "work", color: "#8b5cf6", defaults: { startTime: "14:00", durationMinutes: 180, frequency: "weekly", priority: "high" } },
  { name: "Club / Org", icon: "Trophy", type: "social", color: "#10b981", defaults: { startTime: "18:00", durationMinutes: 120, frequency: "weekly", priority: "medium" } },
  { name: "Sports", icon: "Users", type: "exercise", color: "#06b6d4", defaults: { startTime: "20:00", durationMinutes: 120, frequency: "weekly", priority: "medium" } },
  { name: "Free Time", icon: "Gamepad2", type: "personal", color: "#94a3b8", defaults: { startTime: "21:00", durationMinutes: 60, frequency: "daily", priority: "low" } },
  { name: "Custom", icon: "Pencil", type: "personal", color: "#6366f1", defaults: { startTime: "12:00", durationMinutes: 60, frequency: "once", priority: "medium" } },
];

const CATEGORIES = ["class", "study", "work", "exercise", "meal", "sleep", "social", "personal"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_ABBR: Record<string, string> = { Monday: "M", Tuesday: "T", Wednesday: "W", Thursday: "Th", Friday: "F", Saturday: "Sa", Sunday: "Su" };
const COLORS = ["#3b82f6", "#a855f7", "#f97316", "#22c55e", "#ef4444", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6", "#10b981", "#94a3b8", "#6366f1"];
const PRIORITY_OPTIONS = ["low", "medium", "high", "critical"];
const LOCATIONS = ["CoRec", "WALC", "HSSE", "MATH", "Lawson", "PMU", "Dining Court", "Armstrong Hall", "Physics Building", "WTHR"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingActivity: Activity | null;
}

export function AddActivityModal({ open, onOpenChange, editingActivity }: Props) {
  const createMutation = useCreateActivity();
  const updateMutation = useUpdateActivity();
  const [tab, setTab] = useState<"quick" | "detailed">("quick");

  const [name, setName] = useState("");
  const [type, setType] = useState("personal");
  const [icon, setIcon] = useState("BookOpen");
  const [color, setColor] = useState("#3b82f6");
  const [frequency, setFrequency] = useState("weekly");
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("medium");
  const [flexible, setFlexible] = useState(false);
  const [bufferBefore, setBufferBefore] = useState(0);
  const [bufferAfter, setBufferAfter] = useState(0);
  const [eventDate, setEventDate] = useState("");

  useEffect(() => {
    if (editingActivity) {
      setTab("detailed");
      setName(editingActivity.name);
      setType(editingActivity.type);
      setIcon(editingActivity.icon);
      setColor(editingActivity.color);
      setFrequency(editingActivity.frequency);
      setDaysOfWeek(editingActivity.daysOfWeek || []);
      setStartTime(editingActivity.startTime);
      setEndTime(editingActivity.endTime || "");
      setLocation(editingActivity.location || "");
      setPriority(editingActivity.priority);
      setFlexible(editingActivity.flexible);
      setBufferBefore(editingActivity.bufferBefore);
      setBufferAfter(editingActivity.bufferAfter);
      setEventDate(editingActivity.eventDate ? new Date(editingActivity.eventDate).toISOString().split("T")[0] : "");
    } else {
      resetForm();
    }
  }, [editingActivity, open]);

  const resetForm = () => {
    setName(""); setType("personal"); setIcon("BookOpen"); setColor("#3b82f6");
    setFrequency("weekly"); setDaysOfWeek([]); setStartTime("09:00"); setEndTime("10:00");
    setLocation(""); setPriority("medium"); setFlexible(false); setBufferBefore(0); setBufferAfter(0);
    setEventDate(""); setTab("quick");
  };

  const applyTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
    setName(template.name === "Custom" ? "" : template.name);
    setType(template.type);
    setIcon(template.icon);
    setColor(template.color);
    setFrequency(template.defaults.frequency);
    setStartTime(template.defaults.startTime);
    const endMins = parseInt(template.defaults.startTime.split(":")[0]) * 60 + parseInt(template.defaults.startTime.split(":")[1]) + template.defaults.durationMinutes;
    const endH = Math.floor(endMins / 60) % 24;
    const endM = endMins % 60;
    setEndTime(`${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`);
    setPriority(template.defaults.priority);
    if (template.defaults.frequency === "daily") {
      setDaysOfWeek(DAYS);
    } else {
      setDaysOfWeek([]);
    }
    setTab("detailed");
  };

  const toggleDay = (day: string) => {
    setDaysOfWeek(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleSave = async (addAnother = false) => {
    if (!name.trim()) return;
    const data: any = {
      name: name.trim(),
      type,
      icon,
      color,
      frequency,
      daysOfWeek: frequency === "daily" ? DAYS : frequency === "weekly" ? daysOfWeek : null,
      startTime,
      endTime: endTime || null,
      location: location || null,
      priority,
      flexible,
      bufferBefore,
      bufferAfter,
      completed: false,
      eventDate: frequency === "once" && eventDate ? new Date(eventDate) : null,
    };

    if (editingActivity) {
      await updateMutation.mutateAsync({ id: editingActivity.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }

    if (addAnother) {
      resetForm();
      setTab("quick");
    } else {
      onOpenChange(false);
      resetForm();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center" onClick={() => onOpenChange(false)}>
      <div className="bg-card w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl" onClick={e => e.stopPropagation()} data-testid="modal-add-activity">
        <div className="sticky top-0 bg-card z-10 px-5 pt-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">{editingActivity ? "Edit Activity" : "Add Activity"}</h2>
            <Button size="icon" variant="ghost" onClick={() => onOpenChange(false)} data-testid="button-close-modal">
              <X className="w-4 h-4" />
            </Button>
          </div>
          {!editingActivity && (
            <div className="flex gap-1">
              <button onClick={() => setTab("quick")} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", tab === "quick" ? "bg-indigo-100 text-indigo-700" : "text-muted-foreground")} data-testid="tab-quick-add">
                Quick Add
              </button>
              <button onClick={() => setTab("detailed")} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", tab === "detailed" ? "bg-indigo-100 text-indigo-700" : "text-muted-foreground")} data-testid="tab-detailed">
                Detailed
              </button>
            </div>
          )}
        </div>

        <div className="px-5 py-4">
          {tab === "quick" && !editingActivity ? (
            <div className="grid grid-cols-2 gap-2" data-testid="grid-quick-templates">
              {QUICK_TEMPLATES.map((t) => (
                <button key={t.name} onClick={() => applyTemplate(t)} className="flex items-center gap-2 p-3 rounded-xl border border-border text-left transition-colors hover-elevate" data-testid={`button-template-${t.name.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${t.color}20` }}>
                    <span className="text-sm" style={{ color: t.color }}>
                      {t.icon === "BookOpen" && <BookOpen className="w-4 h-4" />}
                      {t.icon === "Dumbbell" && <Dumbbell className="w-4 h-4" />}
                      {t.icon === "UtensilsCrossed" && <UtensilsCrossed className="w-4 h-4" />}
                      {t.icon === "Briefcase" && <Briefcase className="w-4 h-4" />}
                      {t.icon === "Trophy" && <Trophy className="w-4 h-4" />}
                      {t.icon === "Users" && <Users className="w-4 h-4" />}
                      {t.icon === "Gamepad2" && <Gamepad2 className="w-4 h-4" />}
                      {t.icon === "Pencil" && <Pencil className="w-4 h-4" />}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{t.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Activity Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Gym Workout" className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" data-testid="input-activity-name" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setType(c)} className={cn("px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors", type === c ? "bg-indigo-100 text-indigo-700" : "bg-background text-muted-foreground")} data-testid={`button-category-${c}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setColor(c)} className={cn("w-7 h-7 rounded-full transition-transform", color === c && "ring-2 ring-offset-2 ring-indigo-500 scale-110")} style={{ backgroundColor: c }} data-testid={`button-color-${c.slice(1)}`} />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Frequency</label>
                <div className="flex gap-1.5">
                  {["once", "daily", "weekly"].map(f => (
                    <button key={f} onClick={() => { setFrequency(f); if (f === "daily") setDaysOfWeek(DAYS); }} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors", frequency === f ? "bg-indigo-100 text-indigo-700" : "bg-background text-muted-foreground")} data-testid={`button-frequency-${f}`}>
                      {f === "once" ? "One-time" : f}
                    </button>
                  ))}
                </div>
              </div>

              {frequency === "weekly" && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Days of Week</label>
                  <div className="flex gap-1">
                    {DAYS.map(d => (
                      <button key={d} onClick={() => toggleDay(d)} className={cn("w-9 h-9 rounded-lg text-xs font-medium transition-colors", daysOfWeek.includes(d) ? "bg-indigo-500 text-white" : "bg-muted text-muted-foreground")} data-testid={`button-day-${d.toLowerCase()}`}>
                        {DAY_ABBR[d]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {frequency === "once" && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Date</label>
                  <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" data-testid="input-event-date" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Start Time</label>
                  <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" data-testid="input-start-time" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">End Time</label>
                  <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" data-testid="input-end-time" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Location</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Lawson 1142" list="location-suggestions" className="w-full rounded-lg border border-border px-3 py-2 text-sm" data-testid="input-location" />
                <datalist id="location-suggestions">
                  {LOCATIONS.map(l => <option key={l} value={l} />)}
                </datalist>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
                <div className="flex gap-1.5">
                  {PRIORITY_OPTIONS.map(p => (
                    <button key={p} onClick={() => setPriority(p)} className={cn("px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors", priority === p ? "bg-indigo-100 text-indigo-700" : "bg-background text-muted-foreground")} data-testid={`button-priority-${p}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={flexible} onChange={e => setFlexible(e.target.checked)} className="rounded" data-testid="checkbox-flexible" />
                  <span className="text-xs text-muted-foreground">Flexible timing (AI can adjust)</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Buffer Before (min)</label>
                  <input type="number" min={0} max={30} value={bufferBefore} onChange={e => setBufferBefore(Number(e.target.value))} className="w-full rounded-lg border border-border px-3 py-2 text-sm" data-testid="input-buffer-before" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Buffer After (min)</label>
                  <input type="number" min={0} max={30} value={bufferAfter} onChange={e => setBufferAfter(Number(e.target.value))} className="w-full rounded-lg border border-border px-3 py-2 text-sm" data-testid="input-buffer-after" />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={() => handleSave(false)} disabled={!name.trim() || createMutation.isPending || updateMutation.isPending} className="flex-1" data-testid="button-save-activity">
                  {editingActivity ? "Save Changes" : "Save Activity"}
                </Button>
                {!editingActivity && (
                  <Button variant="outline" onClick={() => handleSave(true)} disabled={!name.trim() || createMutation.isPending} data-testid="button-save-and-add">
                    Save & Add
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
