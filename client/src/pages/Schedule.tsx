import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameDay, isSameMonth, isToday, addWeeks, subWeeks, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, Sparkles, Check, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActivities, useScheduleBlocks, useToggleScheduleBlock } from "@/hooks/use-activities";
import { GenerateScheduleModal } from "@/components/GenerateScheduleModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Activity, ScheduleBlock } from "@shared/schema";

type ViewMode = "month" | "week" | "day" | "agenda";

const TYPE_COLORS: Record<string, string> = {
  class: "#3b82f6",
  study: "#22c55e",
  exercise: "#f97316",
  meal: "#f59e0b",
  sleep: "#64748b",
  work: "#8b5cf6",
  social: "#ec4899",
  personal: "#94a3b8",
  exam: "#ef4444",
};

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function formatTimeShort(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "p" : "a";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${hr}${ampm}` : `${hr}:${m.toString().padStart(2, "0")}${ampm}`;
}

function formatTimeFull(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function getBlocksForDate(date: Date, activities: Activity[], scheduleBlocks: ScheduleBlock[]): Array<{ id: string; title: string; startTime: string; endTime: string; color: string; type: string; location?: string | null; isBlock: boolean; blockId?: number; isCompleted?: boolean }> {
  const dayName = format(date, "EEEE");
  const items: Array<{ id: string; title: string; startTime: string; endTime: string; color: string; type: string; location?: string | null; isBlock: boolean; blockId?: number; isCompleted?: boolean }> = [];

  activities.forEach((a: Activity) => {
    let applies = false;
    if (a.frequency === "daily") applies = true;
    else if (a.frequency === "weekly" && a.daysOfWeek?.includes(dayName)) applies = true;
    else if (a.frequency === "once" && a.eventDate && isSameDay(new Date(a.eventDate), date)) applies = true;

    if (applies && a.endTime) {
      items.push({
        id: `activity-${a.id}-${date.toISOString()}`,
        title: a.name,
        startTime: a.startTime,
        endTime: a.endTime,
        color: a.color,
        type: a.type,
        location: a.location,
        isBlock: false,
      });
    }
  });

  scheduleBlocks.forEach((b: ScheduleBlock) => {
    if (isSameDay(new Date(b.date), date)) {
      items.push({
        id: `block-${b.id}`,
        title: b.title,
        startTime: b.startTime,
        endTime: b.endTime,
        color: b.color,
        type: b.type,
        location: b.location,
        isBlock: true,
        blockId: b.id,
        isCompleted: b.isCompleted,
      });
    }
  });

  items.sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
  return items;
}

function MonthView({ currentDate, onSelectDate, activities, scheduleBlocks }: { currentDate: Date; onSelectDate: (d: Date) => void; activities: Activity[]; scheduleBlocks: ScheduleBlock[] }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let d = calStart;
  while (d <= calEnd) {
    days.push(d);
    d = addDays(d, 1);
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div data-testid="view-month">
      <div className="grid grid-cols-7 mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
        {weeks.flat().map((day, i) => {
          const items = getBlocksForDate(day, activities, scheduleBlocks);
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);
          const totalHours = items.reduce((sum, it) => sum + (parseTime(it.endTime) - parseTime(it.startTime)) / 60, 0);
          const overbooked = totalHours > 12;
          const uniqueColors = Array.from(new Set(items.map(it => it.color))).slice(0, 4);

          return (
            <button key={i} onClick={() => onSelectDate(day)} className={cn("bg-card p-1 min-h-[60px] text-left transition-colors", !inMonth && "opacity-40", today && "ring-1 ring-inset ring-indigo-400")} data-testid={`cell-day-${format(day, "yyyy-MM-dd")}`}>
              <div className={cn("text-xs font-medium mb-0.5", today ? "text-indigo-600 font-bold" : "text-foreground")}>{format(day, "d")}</div>
              {uniqueColors.length > 0 && (
                <div className="flex gap-0.5 mb-0.5">
                  {uniqueColors.map((c, j) => (
                    <div key={j} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                </div>
              )}
              {items.length > 0 && (
                <div className="text-[9px] text-muted-foreground">{items.length}</div>
              )}
              {overbooked && <div className="text-[9px] text-amber-500 font-bold">!</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekTimelineView({ currentDate, activities, scheduleBlocks }: { currentDate: Date; activities: Activity[]; scheduleBlocks: ScheduleBlock[] }) {
  const weekStart = startOfWeek(currentDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);
  const toggleMutation = useToggleScheduleBlock();

  return (
    <div className="overflow-x-auto" data-testid="view-week-timeline">
      <div className="min-w-[600px]">
        <div className="grid grid-cols-8 gap-px bg-muted">
          <div className="bg-card p-1" />
          {days.map(d => (
            <div key={d.toISOString()} className={cn("bg-card p-1 text-center", isToday(d) && "bg-indigo-50 dark:bg-indigo-950/30")}>
              <div className="text-[10px] text-muted-foreground">{format(d, "EEE")}</div>
              <div className={cn("text-xs font-medium", isToday(d) ? "text-indigo-600 font-bold" : "text-foreground")}>{format(d, "d")}</div>
            </div>
          ))}
        </div>
        <div className="relative">
          {hours.map(h => (
            <div key={h} className="grid grid-cols-8 gap-px bg-muted" style={{ height: 48 }}>
              <div className="bg-card flex items-start justify-end pr-1 pt-0.5">
                <span className="text-[9px] text-muted-foreground">{h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`}</span>
              </div>
              {days.map(d => (
                <div key={d.toISOString()} className={cn("bg-card border-t border-border relative", isToday(d) && "bg-indigo-50/30")} />
              ))}
            </div>
          ))}
          {days.map((d, dayIdx) => {
            const items = getBlocksForDate(d, activities, scheduleBlocks);
            return items.map(item => {
              const startMin = parseTime(item.startTime);
              const endMin = parseTime(item.endTime);
              const top = ((startMin - 360) / 60) * 48;
              const height = Math.max(((endMin - startMin) / 60) * 48, 16);
              if (startMin < 360 || startMin >= 1380) return null;

              return (
                <div
                  key={item.id}
                  className={cn("absolute rounded-md px-1 py-0.5 overflow-hidden text-white text-[9px] leading-tight z-10 cursor-pointer", item.isCompleted && "opacity-50")}
                  style={{
                    backgroundColor: item.color,
                    top: top,
                    left: `calc(${(dayIdx + 1) / 8 * 100}% + 1px)`,
                    width: `calc(${1 / 8 * 100}% - 2px)`,
                    height: Math.max(height, 16),
                  }}
                  onClick={() => {
                    if (item.isBlock && item.blockId) {
                      toggleMutation.mutate({ id: item.blockId, isCompleted: !item.isCompleted });
                    }
                  }}
                >
                  <div className="font-medium truncate">{item.title}</div>
                  {height > 24 && <div className="opacity-80">{formatTimeShort(item.startTime)}</div>}
                </div>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
}

function DayView({ currentDate, activities, scheduleBlocks }: { currentDate: Date; activities: Activity[]; scheduleBlocks: ScheduleBlock[] }) {
  const items = getBlocksForDate(currentDate, activities, scheduleBlocks);
  const toggleMutation = useToggleScheduleBlock();

  return (
    <div data-testid="view-day">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-foreground">{format(currentDate, "EEEE, MMMM d, yyyy")}</h3>
        <p className="text-sm text-muted-foreground">{items.length} activities scheduled</p>
      </div>
      {items.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground text-sm">Nothing scheduled for this day</p>
          <p className="text-muted-foreground text-xs mt-1">Generate a schedule or add activities</p>
        </Card>
      ) : (
        <div className="space-y-1">
          {items.map((item, idx) => {
            const startMin = parseTime(item.startTime);
            const endMin = parseTime(item.endTime);
            const durHrs = (endMin - startMin) / 60;
            const prevItem = idx > 0 ? items[idx - 1] : null;
            const gap = prevItem ? (startMin - parseTime(prevItem.endTime)) : 0;

            return (
              <div key={item.id}>
                {gap > 15 && (
                  <div className="flex items-center gap-2 py-1 px-2">
                    <div className="h-px flex-1 bg-muted" />
                    <span className="text-[10px] text-muted-foreground">{gap} min break</span>
                    <div className="h-px flex-1 bg-muted" />
                  </div>
                )}
                <div className={cn("flex gap-3 rounded-xl p-3 transition-all", item.isCompleted && "opacity-50")} data-testid={`block-${item.id}`}>
                  <div className="flex flex-col items-center min-w-[50px]">
                    <span className="text-xs font-medium text-muted-foreground">{formatTimeFull(item.startTime)}</span>
                    <div className="w-0.5 flex-1 my-1 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] text-muted-foreground">{formatTimeFull(item.endTime)}</span>
                  </div>
                  <Card className={cn("flex-1 p-3 relative border-l-4")} style={{ borderLeftColor: item.color }}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className={cn("font-semibold text-sm text-foreground", item.isCompleted && "line-through")}>{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {item.location && (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <MapPin className="w-3 h-3" />{item.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="w-3 h-3" />{durHrs >= 1 ? `${Math.floor(durHrs)}h ${Math.round((durHrs % 1) * 60)}m` : `${Math.round(durHrs * 60)}m`}
                          </span>
                          <Badge variant="secondary" className="text-[9px] capitalize">{item.type}</Badge>
                        </div>
                      </div>
                      {item.isBlock && item.blockId && (
                        <button
                          onClick={() => toggleMutation.mutate({ id: item.blockId!, isCompleted: !item.isCompleted })}
                          className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all", item.isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-border")}
                          data-testid={`button-toggle-block-${item.blockId}`}
                        >
                          {item.isCompleted && <Check className="w-3 h-3 stroke-[4]" />}
                        </button>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AgendaView({ currentDate, activities, scheduleBlocks }: { currentDate: Date; activities: Activity[]; scheduleBlocks: ScheduleBlock[] }) {
  const toggleMutation = useToggleScheduleBlock();
  const daysToShow = 7;
  const days = Array.from({ length: daysToShow }, (_, i) => addDays(startOfDay(currentDate), i));

  return (
    <div className="space-y-4" data-testid="view-agenda">
      {days.map(day => {
        const items = getBlocksForDate(day, activities, scheduleBlocks);
        if (items.length === 0) return null;
        const completedCount = items.filter(it => it.isCompleted).length;

        return (
          <div key={day.toISOString()}>
            <div className="flex items-center gap-2 mb-2">
              <h4 className={cn("text-sm font-bold", isToday(day) ? "text-indigo-600" : "text-foreground")}>
                {isToday(day) ? "TODAY" : format(day, "EEEE").toUpperCase()} - {format(day, "MMM d")}
              </h4>
              {items.length > 0 && (
                <Badge variant="secondary" className="text-[9px]">{completedCount}/{items.length}</Badge>
              )}
            </div>
            <div className="space-y-1.5">
              {items.map(item => (
                <div key={item.id} className={cn("flex items-center gap-3 py-2 px-3 rounded-lg bg-card border border-border", item.isCompleted && "opacity-50")}>
                  {item.isBlock && item.blockId ? (
                    <button
                      onClick={() => toggleMutation.mutate({ id: item.blockId!, isCompleted: !item.isCompleted })}
                      className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0", item.isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-border")}
                    >
                      {item.isCompleted && <Check className="w-3 h-3 stroke-[4]" />}
                    </button>
                  ) : (
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  )}
                  <span className="text-xs text-muted-foreground min-w-[55px]">{formatTimeShort(item.startTime)}</span>
                  <span className={cn("text-sm font-medium text-foreground flex-1", item.isCompleted && "line-through")}>{item.title}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {(() => { const dur = (parseTime(item.endTime) - parseTime(item.startTime)) / 60; return dur >= 1 ? `${Math.round(dur * 10) / 10} hr` : `${Math.round(dur * 60)} min`; })()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Schedule() {
  const { data: activities = [], isLoading: loadingActivities } = useActivities();
  const { data: scheduleBlocks = [], isLoading: loadingBlocks } = useScheduleBlocks();
  const [view, setView] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [generateOpen, setGenerateOpen] = useState(false);

  const navigate = (dir: -1 | 1) => {
    if (view === "month") setCurrentDate(prev => dir === 1 ? addMonths(prev, 1) : subMonths(prev, 1));
    else if (view === "week") setCurrentDate(prev => dir === 1 ? addWeeks(prev, 1) : subWeeks(prev, 1));
    else setCurrentDate(prev => addDays(prev, dir));
  };

  const goToday = () => setCurrentDate(new Date());

  const selectDate = (d: Date) => {
    setCurrentDate(d);
    setView("day");
  };

  const isLoading = loadingActivities || loadingBlocks;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const headerText = view === "month" ? format(currentDate, "MMMM yyyy")
    : view === "week" ? `${format(startOfWeek(currentDate), "MMM d")} - ${format(endOfWeek(currentDate), "MMM d, yyyy")}`
    : format(currentDate, "MMMM d, yyyy");

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-6 pb-3">
        <div className="flex items-center justify-between gap-1 mb-1">
          <h2 className="text-lg font-bold text-foreground truncate" data-testid="text-schedule-header">{headerText}</h2>
          <Button size="sm" className="flex-shrink-0" onClick={() => setGenerateOpen(true)} data-testid="button-generate-schedule">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Generate
          </Button>
        </div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" onClick={() => navigate(-1)} data-testid="button-prev">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={goToday} data-testid="button-today">Today</Button>
            <Button size="icon" variant="ghost" onClick={() => navigate(1)} data-testid="button-next">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-1 bg-muted p-0.5 rounded-lg">
          {(["day", "week", "month", "agenda"] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setView(v)} className={cn("flex-1 py-1.5 rounded-md text-xs font-medium transition-colors capitalize", view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")} data-testid={`button-view-${v}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5">
        {view === "month" && <MonthView currentDate={currentDate} onSelectDate={selectDate} activities={activities as Activity[]} scheduleBlocks={scheduleBlocks as ScheduleBlock[]} />}
        {view === "week" && <WeekTimelineView currentDate={currentDate} activities={activities as Activity[]} scheduleBlocks={scheduleBlocks as ScheduleBlock[]} />}
        {view === "day" && <DayView currentDate={currentDate} activities={activities as Activity[]} scheduleBlocks={scheduleBlocks as ScheduleBlock[]} />}
        {view === "agenda" && <AgendaView currentDate={currentDate} activities={activities as Activity[]} scheduleBlocks={scheduleBlocks as ScheduleBlock[]} />}
      </div>

      <GenerateScheduleModal
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        activities={activities as Activity[]}
      />
    </div>
  );
}
