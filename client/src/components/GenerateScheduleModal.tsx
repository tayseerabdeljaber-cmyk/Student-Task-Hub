import { useState } from "react";
import { X, Sparkles, Check, Loader2, BookOpen, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBulkCreateScheduleBlocks, useClearGeneratedBlocks } from "@/hooks/use-activities";
import { useAssignments } from "@/hooks/use-assignments";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Activity, AssignmentWithCourse, InsertScheduleBlock } from "@shared/schema";
import { addDays, format, startOfDay, isBefore, isAfter } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activities: Activity[];
}

type GenerationRange = "today" | "week" | "two_weeks" | "month";
type GenerationStep = "options" | "generating" | "summary";

const EFFORT_ESTIMATES: Record<string, number> = {
  homework: 2,
  reading: 1,
  quiz: 1.5,
  exam: 6,
  lab: 2.5,
  project: 8,
};

const STUDY_COLORS: Record<string, string> = {
  default: "#22c55e",
};

function generateScheduleBlocks(
  assignments: AssignmentWithCourse[],
  activities: Activity[],
  options: {
    range: GenerationRange;
    spreadExamPrep: boolean;
    startEarly: boolean;
    includeBreaks: boolean;
    respectSleep: boolean;
    allowWeekend: boolean;
  }
): InsertScheduleBlock[] {
  const now = new Date();
  const today = startOfDay(now);

  const rangeDays = options.range === "today" ? 1 : options.range === "week" ? 7 : options.range === "two_weeks" ? 14 : 30;
  const endDate = addDays(today, rangeDays);

  const upcoming = assignments.filter(a => !a.completed && isBefore(today, new Date(a.dueDate)) && isBefore(new Date(a.dueDate), addDays(endDate, 7)));

  const sleepSchedule = (() => {
    const stored = localStorage.getItem("sleepSchedule");
    return stored ? JSON.parse(stored) : { bedtime: "22:00", wakeTime: "06:00" };
  })();

  const [wakeH] = sleepSchedule.wakeTime.split(":").map(Number);
  const [bedH] = sleepSchedule.bedtime.split(":").map(Number);

  const busySlots: Map<string, Array<{ start: number; end: number }>> = new Map();

  for (let i = 0; i < rangeDays; i++) {
    const d = addDays(today, i);
    const key = format(d, "yyyy-MM-dd");
    const dayName = format(d, "EEEE");
    const daySlots: Array<{ start: number; end: number }> = [];

    activities.forEach(a => {
      if (!a.endTime) return;
      let applies = false;
      if (a.frequency === "daily") applies = true;
      else if (a.frequency === "weekly" && a.daysOfWeek?.includes(dayName)) applies = true;

      if (applies) {
        const [sH, sM] = a.startTime.split(":").map(Number);
        const [eH, eM] = a.endTime!.split(":").map(Number);
        daySlots.push({ start: sH * 60 + sM - a.bufferBefore, end: eH * 60 + eM + a.bufferAfter });
      }
    });

    busySlots.set(key, daySlots);
  }

  const studyTasks: Array<{ assignmentId: number; title: string; course: string; courseColor: string; effort: number; dueDate: Date; priority: number }> = [];

  upcoming.forEach(a => {
    const baseEffort = EFFORT_ESTIMATES[a.type] || 2;
    const daysUntilDue = Math.max(1, (new Date(a.dueDate).getTime() - now.getTime()) / (86400000));
    const priority = baseEffort / daysUntilDue;

    studyTasks.push({
      assignmentId: a.id,
      title: `Study: ${a.title}`,
      course: a.course.code,
      courseColor: a.course.color,
      effort: baseEffort,
      dueDate: new Date(a.dueDate),
      priority,
    });
  });

  studyTasks.sort((a, b) => b.priority - a.priority);

  const blocks: InsertScheduleBlock[] = [];

  for (const task of studyTasks) {
    let remainingEffort = task.effort;
    const maxSessionHours = 2;
    const sessionCount = Math.ceil(remainingEffort / maxSessionHours);

    const startDay = options.startEarly ? 0 : Math.max(0, Math.floor((task.dueDate.getTime() - today.getTime()) / 86400000) - sessionCount - 1);

    for (let session = 0; session < sessionCount && remainingEffort > 0; session++) {
      const sessionDuration = Math.min(remainingEffort, maxSessionHours);
      const sessionMins = Math.round(sessionDuration * 60);

      for (let dayOffset = startDay + session; dayOffset < rangeDays; dayOffset++) {
        const d = addDays(today, dayOffset);
        const key = format(d, "yyyy-MM-dd");
        const dayOfWeek = d.getDay();

        if (!options.allowWeekend && (dayOfWeek === 0 || dayOfWeek === 6)) continue;

        if (isAfter(d, task.dueDate)) break;

        const busy = busySlots.get(key) || [];
        const existingBlocks = blocks.filter(b => format(new Date(b.date as any), "yyyy-MM-dd") === key);
        const allBusy = [...busy, ...existingBlocks.map(b => {
          const [sH, sM] = (b.startTime as string).split(":").map(Number);
          const [eH, eM] = (b.endTime as string).split(":").map(Number);
          return { start: sH * 60 + sM, end: eH * 60 + eM };
        })];

        allBusy.sort((a, b) => a.start - b.start);

        const studyStart = options.respectSleep ? wakeH * 60 + 30 : 6 * 60;
        const studyEnd = options.respectSleep ? bedH * 60 - 30 : 23 * 60;

        let placed = false;
        let current = studyStart;
        for (const slot of allBusy) {
          if (current + sessionMins <= slot.start && current + sessionMins <= studyEnd) {
            const startH = Math.floor(current / 60);
            const startM = current % 60;
            const endTotal = current + sessionMins;
            const endH = Math.floor(endTotal / 60);
            const endM = endTotal % 60;

            blocks.push({
              activityId: null,
              assignmentId: task.assignmentId,
              date: d,
              startTime: `${startH.toString().padStart(2, "0")}:${startM.toString().padStart(2, "0")}`,
              endTime: `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`,
              title: task.title,
              type: "study",
              icon: "BookOpen",
              color: task.courseColor,
              location: null,
              isGenerated: true,
              isLocked: false,
              isCompleted: false,
            });
            placed = true;
            break;
          }
          current = Math.max(current, slot.end + (options.includeBreaks ? 15 : 5));
        }

        if (!placed && current + sessionMins <= studyEnd) {
          const startH = Math.floor(current / 60);
          const startM = current % 60;
          const endTotal = current + sessionMins;
          const endH = Math.floor(endTotal / 60);
          const endM = endTotal % 60;

          blocks.push({
            activityId: null,
            assignmentId: task.assignmentId,
            date: d,
            startTime: `${startH.toString().padStart(2, "0")}:${startM.toString().padStart(2, "0")}`,
            endTime: `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`,
            title: task.title,
            type: "study",
            icon: "BookOpen",
            color: task.courseColor,
            location: null,
            isGenerated: true,
            isLocked: false,
            isCompleted: false,
          });
          placed = true;
        }

        if (placed) {
          remainingEffort -= sessionDuration;
          break;
        }
      }
    }
  }

  return blocks;
}

export function GenerateScheduleModal({ open, onOpenChange, activities }: Props) {
  const { data: assignments = [] } = useAssignments();
  const bulkCreateMutation = useBulkCreateScheduleBlocks();
  const clearMutation = useClearGeneratedBlocks();

  const [step, setStep] = useState<GenerationStep>("options");
  const [range, setRange] = useState<GenerationRange>("week");
  const [spreadExamPrep, setSpreadExamPrep] = useState(true);
  const [startEarly, setStartEarly] = useState(true);
  const [includeBreaks, setIncludeBreaks] = useState(true);
  const [respectSleep, setRespectSleep] = useState(true);
  const [allowWeekend, setAllowWeekend] = useState(false);
  const [generatedBlocks, setGeneratedBlocks] = useState<InsertScheduleBlock[]>([]);
  const [loadingMsg, setLoadingMsg] = useState("");

  const upcomingCount = (assignments as AssignmentWithCourse[]).filter(a => !a.completed).length;
  const classCount = activities.filter((a: Activity) => a.type === "class").length;
  const recurringCount = activities.filter((a: Activity) => a.frequency !== "once").length;

  const handleGenerate = async () => {
    setStep("generating");
    setLoadingMsg("Analyzing your assignments...");

    await new Promise(r => setTimeout(r, 800));
    setLoadingMsg("Finding optimal study times...");

    await new Promise(r => setTimeout(r, 800));
    setLoadingMsg("Balancing your workload...");

    const blocks = generateScheduleBlocks(assignments as AssignmentWithCourse[], activities, {
      range,
      spreadExamPrep,
      startEarly,
      includeBreaks,
      respectSleep,
      allowWeekend,
    });

    await new Promise(r => setTimeout(r, 600));

    await clearMutation.mutateAsync();
    if (blocks.length > 0) {
      await bulkCreateMutation.mutateAsync(blocks);
    }

    setGeneratedBlocks(blocks);
    setStep("summary");
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("options");
      setGeneratedBlocks([]);
    }, 300);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-end sm:items-center justify-center" onClick={handleClose}>
      <div className="bg-card w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl mb-[env(safe-area-inset-bottom)] sm:mb-0 pb-20 sm:pb-0" onClick={e => e.stopPropagation()} data-testid="modal-generate-schedule">
        <div className="sticky top-0 bg-card z-10 px-5 pt-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-foreground">AI Schedule Generation</h2>
            </div>
            <Button size="icon" variant="ghost" onClick={handleClose} data-testid="button-close-generate">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="px-5 py-4">
          {step === "options" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Generate schedule for:</label>
                <div className="space-y-1.5">
                  {([["today", "Today only"], ["week", "This week (recommended)"], ["two_weeks", "Next 2 weeks"], ["month", "Entire month"]] as [GenerationRange, string][]).map(([val, label]) => (
                    <button key={val} onClick={() => setRange(val)} className={cn("flex items-center gap-2 w-full p-2.5 rounded-lg text-sm text-left transition-colors", range === val ? "bg-primary/10 text-primary" : "text-muted-foreground")} data-testid={`button-range-${val}`}>
                      <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", range === val ? "border-primary" : "border-muted-foreground/30")}>
                        {range === val && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <Card className="p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Based on:</p>
                <div className="space-y-1 text-sm text-foreground">
                  <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" />{upcomingCount} upcoming assignments</div>
                  <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" />Your class schedule ({classCount} classes)</div>
                  <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" />Your activities ({recurringCount} recurring)</div>
                </div>
              </Card>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Options:</p>
                <div className="space-y-2">
                  {[
                    { checked: spreadExamPrep, onChange: setSpreadExamPrep, label: "Spread exam prep over multiple days", id: "spread-exam" },
                    { checked: startEarly, onChange: setStartEarly, label: "Start assignments early", id: "start-early" },
                    { checked: includeBreaks, onChange: setIncludeBreaks, label: "Include study breaks", id: "include-breaks" },
                    { checked: respectSleep, onChange: setRespectSleep, label: "Respect sleep schedule", id: "respect-sleep" },
                    { checked: allowWeekend, onChange: setAllowWeekend, label: "Allow weekend study", id: "allow-weekend" },
                  ].map(opt => (
                    <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={opt.checked} onChange={e => opt.onChange(e.target.checked)} className="rounded" data-testid={`checkbox-${opt.id}`} />
                      <span className="text-sm text-muted-foreground">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3">
                This will clear existing AI study blocks, keep your classes & activities, and add optimized study sessions.
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
                <Button onClick={handleGenerate} className="flex-1" data-testid="button-confirm-generate">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />Generate Schedule
                </Button>
              </div>
            </div>
          )}

          {step === "generating" && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">{loadingMsg}</p>
            </div>
          )}

          {step === "summary" && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Schedule Generated</h3>
              </div>

              <Card className="p-4" data-testid="card-generation-summary">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold text-sm text-foreground">Summary</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Study blocks added</span>
                    <span className="font-medium text-foreground" data-testid="text-blocks-count">{generatedBlocks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total study time</span>
                    <span className="font-medium text-foreground">
                      {Math.round(generatedBlocks.reduce((sum, b) => {
                        const [sH, sM] = (b.startTime as string).split(":").map(Number);
                        const [eH, eM] = (b.endTime as string).split(":").map(Number);
                        return sum + (eH * 60 + eM - sH * 60 - sM) / 60;
                      }, 0))} hours
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assignments covered</span>
                    <span className="font-medium text-foreground">{new Set(generatedBlocks.map(b => b.assignmentId)).size}</span>
                  </div>
                </div>
              </Card>

              {generatedBlocks.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {generatedBlocks.slice(0, 10).map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs py-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color as string }} />
                      <span className="text-muted-foreground">{format(new Date(b.date as any), "EEE M/d")}</span>
                      <span className="font-medium text-foreground flex-1 truncate">{b.title}</span>
                      <span className="text-muted-foreground">{b.startTime}-{b.endTime}</span>
                    </div>
                  ))}
                  {generatedBlocks.length > 10 && <p className="text-xs text-muted-foreground text-center">...and {generatedBlocks.length - 10} more</p>}
                </div>
              )}

              <Button onClick={handleClose} className="w-full" data-testid="button-view-schedule">View Schedule</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
