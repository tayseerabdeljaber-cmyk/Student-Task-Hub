import { useMemo } from "react";
import { useLocation } from "wouter";
import { useAssignments } from "@/hooks/use-assignments";
import { useScheduleBlocks } from "@/hooks/use-activities";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, Legend,
} from "recharts";
import {
  ArrowLeft, TrendingUp, Clock, Target, BookOpen,
  CheckCircle2, Flame, BarChart3
} from "lucide-react";
import { format, subDays, startOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import type { AssignmentWithCourse, ScheduleBlock } from "@shared/schema";

const COLORS = [
  "#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#818cf8",
  "#7c3aed", "#5b21b6", "#4338ca", "#4f46e5", "#6d28d9",
];

function getCourseName(a: AssignmentWithCourse) {
  return a.course?.code || "Unknown";
}

export default function Analytics() {
  const { data: assignments, isLoading } = useAssignments();
  const { data: scheduleBlocks } = useScheduleBlocks();
  const [, setLocation] = useLocation();

  const stats = useMemo(() => {
    if (!assignments) return null;
    const total = assignments.length;
    const completed = assignments.filter((a: AssignmentWithCourse) => a.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const streak = Number(localStorage.getItem("studyStreak") || "0");

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 0 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: now });
    const weeklyActivity = weekDays.map(day => {
      const dayCompleted = assignments.filter((a: AssignmentWithCourse) => {
        if (!a.completed) return false;
        const due = new Date(a.dueDate);
        return isSameDay(due, day);
      }).length;
      return {
        day: format(day, "EEE"),
        completed: dayCompleted,
        due: assignments.filter((a: AssignmentWithCourse) => {
          const due = new Date(a.dueDate);
          return isSameDay(due, day);
        }).length,
      };
    });

    const courseDistribution = new Map<string, number>();
    assignments.forEach((a: AssignmentWithCourse) => {
      const code = getCourseName(a);
      courseDistribution.set(code, (courseDistribution.get(code) || 0) + 1);
    });
    const courseData = Array.from(courseDistribution.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    const typeDistribution = new Map<string, { total: number; completed: number }>();
    assignments.forEach((a: AssignmentWithCourse) => {
      const existing = typeDistribution.get(a.type) || { total: 0, completed: 0 };
      existing.total++;
      if (a.completed) existing.completed++;
      typeDistribution.set(a.type, existing);
    });
    const typeData = Array.from(typeDistribution.entries()).map(([type, data]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      total: data.total,
      completed: data.completed,
      rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    }));

    const upcomingDays = eachDayOfInterval({ start: now, end: subDays(now, -7) });
    const upcomingWorkload = upcomingDays.map(day => {
      const hoursMap: Record<string, number> = {
        homework: 2, quiz: 1.5, exam: 6, lab: 3, project: 8, reading: 1,
      };
      const dayAssignments = assignments.filter((a: AssignmentWithCourse) => {
        if (a.completed) return false;
        return isSameDay(new Date(a.dueDate), day);
      });
      const hours = dayAssignments.reduce((sum: number, a: AssignmentWithCourse) =>
        sum + (hoursMap[a.type] || 2), 0
      );
      return {
        day: format(day, "MMM d"),
        hours: Math.round(hours * 10) / 10,
        tasks: dayAssignments.length,
      };
    });

    const totalStudyBlocks = scheduleBlocks?.length || 0;
    const completedBlocks = scheduleBlocks?.filter((b: ScheduleBlock) => b.isCompleted).length || 0;

    return {
      total,
      completed,
      pending,
      completionRate,
      streak,
      weeklyActivity,
      courseData,
      typeData,
      upcomingWorkload,
      totalStudyBlocks,
      completedBlocks,
    };
  }, [assignments, scheduleBlocks]);

  if (isLoading || !stats) {
    return (
      <div className="pb-24 px-4 pt-8 max-w-md mx-auto min-h-screen bg-background">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-8 max-w-md mx-auto min-h-screen bg-background">
      <header className="mb-6 flex items-center gap-3">
        <button
          onClick={() => setLocation("/")}
          className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center"
          data-testid="button-back-analytics"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground" data-testid="text-analytics-title">Study Insights</h1>
          <p className="text-xs text-muted-foreground">Your progress at a glance</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-4 bg-card rounded-2xl border-border" data-testid="stat-completion-rate">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-medium text-muted-foreground">Completion</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.completionRate}%</p>
          <p className="text-[10px] text-muted-foreground">{stats.completed} of {stats.total}</p>
        </Card>
        <Card className="p-4 bg-card rounded-2xl border-border" data-testid="stat-streak">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-medium text-muted-foreground">Streak</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.streak}</p>
          <p className="text-[10px] text-muted-foreground">day streak</p>
        </Card>
        <Card className="p-4 bg-card rounded-2xl border-border" data-testid="stat-pending">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-muted-foreground">Pending</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
          <p className="text-[10px] text-muted-foreground">assignments left</p>
        </Card>
        <Card className="p-4 bg-card rounded-2xl border-border" data-testid="stat-study-blocks">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-muted-foreground">Study Blocks</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.completedBlocks}</p>
          <p className="text-[10px] text-muted-foreground">of {stats.totalStudyBlocks} completed</p>
        </Card>
      </div>

      <Card className="p-4 bg-card rounded-2xl border-border mb-6" data-testid="chart-weekly-activity">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          This Week's Activity
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={stats.weeklyActivity} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
              cursor={{ fill: "rgba(99,102,241,0.05)" }}
            />
            <Bar dataKey="due" fill="#e2e8f0" name="Due" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completed" fill="#6366f1" name="Done" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4 bg-card rounded-2xl border-border mb-6" data-testid="chart-upcoming-workload">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-500" />
          Upcoming Workload
        </h3>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={stats.upcomingWorkload} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="workloadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} label={{ value: "hrs", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "#94a3b8" } }} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
            />
            <Area type="monotone" dataKey="hours" stroke="#8b5cf6" fill="url(#workloadGrad)" strokeWidth={2} name="Est. Hours" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4 bg-card rounded-2xl border-border mb-6" data-testid="chart-course-distribution">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-500" />
          By Course
        </h3>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie
                data={stats.courseData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={55}
                paddingAngle={2}
              >
                {stats.courseData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-1.5">
            {stats.courseData.map((c, i) => (
              <div key={c.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-muted-foreground font-medium">{c.name}</span>
                <span className="text-muted-foreground ml-auto">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-card rounded-2xl border-border mb-6" data-testid="chart-by-type">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-500" />
          Completion by Type
        </h3>
        <div className="space-y-3">
          {stats.typeData.map(t => (
            <div key={t.type}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">{t.type}</span>
                <span className="text-[10px] text-muted-foreground">{t.completed}/{t.total} ({t.rate}%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${t.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
