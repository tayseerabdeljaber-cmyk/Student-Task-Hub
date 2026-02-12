import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { api } from "@shared/routes";
import { z } from "zod";
import { addDays, setHours, setMinutes, subDays, subHours } from "date-fns";
import crypto from "crypto";
import {
  setupAuth,
  registerAuthRoutes,
  registerLocalDevAuthRoutes,
} from "./replit_integrations/auth";
import { isAuthenticated } from "./replit_integrations/auth/replitAuth";
import { companionDevices, companionTokens, courses, assignments } from "@shared/schema";
import { and, eq, isNull } from "drizzle-orm";

function isLocalDevAuthBypassEnabled(): boolean {
  const value = (process.env.LOCAL_DEV_AUTH_BYPASS ?? "").toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function getLocalDevUserId(): string {
  return process.env.LOCAL_DEV_USER_ID ?? "local-dev-user";
}

function requireWebAuth(req: any, res: any, next: any) {
  if (isLocalDevAuthBypassEnabled()) return next();
  return isAuthenticated(req, res, next);
}

function getCurrentUserId(req: any): string | null {
  if (isLocalDevAuthBypassEnabled()) return getLocalDevUserId();
  return req?.user?.claims?.sub ?? null;
}

function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

async function seedDatabase() {
  const existingCourses = await storage.getCourses();
  if (existingCourses.length > 0) return;

  console.log("Seeding database with 20+ assignments...");

  const courseData = [
    { code: "CS 159", name: "Intro to Programming", color: "#3b82f6" },
    { code: "PHYS 172", name: "Modern Mechanics", color: "#a855f7" },
    { code: "ENGR 132", name: "Engineering Design", color: "#f97316" },
    { code: "CHM 115", name: "General Chemistry", color: "#22c55e" },
    { code: "MATH 166", name: "Calculus II", color: "#ef4444" },
  ];

  const createdCourses = await Promise.all(
    courseData.map(c => storage.createCourse(c))
  );

  const now = new Date();
  const getId = (code: string) => createdCourses.find(c => c.code === code)?.id!;

  const assignmentData = [
    { courseId: getId("MATH 166"), title: "Calculus Quiz", type: "quiz", platform: "Brightspace", dueDate: subDays(now, 2), completed: false },
    { courseId: getId("CHM 115"), title: "Pre-Lab Worksheet 3", type: "homework", platform: "Gradescope", dueDate: subDays(now, 1), completed: false },
    { courseId: getId("CS 159"), title: "Lab Attendance", type: "lab", platform: "Brightspace", dueDate: subHours(now, 5), completed: false },
    { courseId: getId("CS 159"), title: "Homework 2 (Vocareum)", type: "homework", platform: "Vocareum", dueDate: setHours(setMinutes(now, 0), 23), completed: false },
    { courseId: getId("CS 159"), title: "Lecture Quiz", type: "quiz", platform: "Brightspace", dueDate: setHours(setMinutes(now, 0), 14), completed: true },
    { courseId: getId("PHYS 172"), title: "Reading Assignment 4", type: "reading", platform: "PearsonMyLab", dueDate: setHours(setMinutes(now, 59), 23), completed: false },
    { courseId: getId("PHYS 172"), title: "Quiz - Chapter 3", type: "quiz", platform: "Brightspace", dueDate: setHours(setMinutes(addDays(now, 1), 0), 9), completed: false },
    { courseId: getId("ENGR 132"), title: "Team Meeting Notes", type: "homework", platform: "Piazza", dueDate: setHours(setMinutes(addDays(now, 1), 0), 17), completed: false },
    { courseId: getId("ENGR 132"), title: "Lab Report 1", type: "lab", platform: "Gradescope", dueDate: setHours(setMinutes(addDays(now, 2), 59), 23), completed: false },
    { courseId: getId("CHM 115"), title: "Online Homework 5", type: "homework", platform: "WebAssign", dueDate: setHours(setMinutes(addDays(now, 2), 0), 11), completed: false },
    { courseId: getId("MATH 166"), title: "Problem Set 4", type: "homework", platform: "WebAssign", dueDate: setHours(setMinutes(addDays(now, 3), 59), 23), completed: false },
    { courseId: getId("CS 159"), title: "Programming Project 1", type: "project", platform: "Vocareum", dueDate: setHours(setMinutes(addDays(now, 4), 59), 23), completed: false },
    { courseId: getId("CHM 115"), title: "Read Chapter 5", type: "reading", platform: "Brightspace", dueDate: setHours(setMinutes(addDays(now, 5), 30), 10), completed: false },
    { courseId: getId("PHYS 172"), title: "iClicker Participation", type: "homework", platform: "Brightspace", dueDate: setHours(setMinutes(addDays(now, 5), 0), 8), completed: false },
    { courseId: getId("PHYS 172"), title: "Exam 1", type: "exam", platform: "In-Class", dueDate: setHours(setMinutes(addDays(now, 7), 0), 8), completed: false },
    { courseId: getId("MATH 166"), title: "Midterm Review", type: "homework", platform: "WebAssign", dueDate: setHours(setMinutes(addDays(now, 8), 59), 23), completed: false },
    { courseId: getId("ENGR 132"), title: "Design Presentation", type: "project", platform: "Brightspace", dueDate: setHours(setMinutes(addDays(now, 9), 0), 14), completed: false },
    { courseId: getId("CS 159"), title: "Exam 1 - Midterm", type: "exam", platform: "In-Class", dueDate: setHours(setMinutes(addDays(now, 10), 30), 9), completed: false },
    { courseId: getId("CHM 115"), title: "Lab Report 2", type: "lab", platform: "Gradescope", dueDate: setHours(setMinutes(addDays(now, 10), 59), 23), completed: false },
    { courseId: getId("MATH 166"), title: "Problem Set 5", type: "homework", platform: "WebAssign", dueDate: setHours(setMinutes(addDays(now, 14), 59), 23), completed: false },
    { courseId: getId("ENGR 132"), title: "Final Project Proposal", type: "project", platform: "Brightspace", dueDate: setHours(setMinutes(addDays(now, 18), 59), 23), completed: false },
    { courseId: getId("CS 159"), title: "Programming Project 2", type: "project", platform: "Vocareum", dueDate: setHours(setMinutes(addDays(now, 21), 59), 23), completed: false },
    { courseId: getId("PHYS 172"), title: "Lab Report 3", type: "lab", platform: "Gradescope", dueDate: setHours(setMinutes(addDays(now, 25), 59), 23), completed: false },
    { courseId: getId("CHM 115"), title: "Final Exam", type: "exam", platform: "In-Class", dueDate: setHours(setMinutes(addDays(now, 30), 0), 8), completed: false },
  ];

  await Promise.all(assignmentData.map(a => storage.createAssignment(a)));
  console.log(`Seeded ${assignmentData.length} assignments across ${courseData.length} courses`);
}

async function seedActivities() {
  const existing = await storage.getActivities();
  if (existing.length > 0) return;

  console.log("Seeding activities...");

  const courses = await storage.getCourses();
  const getId = (code: string) => courses.find(c => c.code === code)?.id || null;
  const getColor = (code: string) => courses.find(c => c.code === code)?.color || "#3b82f6";

  const activityData = [
    { name: "CS 159 Lecture", type: "class", icon: "BookOpen", color: getColor("CS 159"), frequency: "weekly", daysOfWeek: ["Monday", "Wednesday", "Friday"], startTime: "09:00", endTime: "09:50", location: "Lawson 1142", priority: "critical", courseId: getId("CS 159"), flexible: false, bufferBefore: 5, bufferAfter: 5, completed: false },
    { name: "PHYS 172 Lecture", type: "class", icon: "BookOpen", color: getColor("PHYS 172"), frequency: "weekly", daysOfWeek: ["Tuesday", "Thursday"], startTime: "08:00", endTime: "09:15", location: "Physics 114", priority: "critical", courseId: getId("PHYS 172"), flexible: false, bufferBefore: 5, bufferAfter: 5, completed: false },
    { name: "ENGR 132 Lecture", type: "class", icon: "BookOpen", color: getColor("ENGR 132"), frequency: "weekly", daysOfWeek: ["Monday", "Wednesday"], startTime: "13:30", endTime: "14:20", location: "Armstrong Hall", priority: "critical", courseId: getId("ENGR 132"), flexible: false, bufferBefore: 5, bufferAfter: 5, completed: false },
    { name: "CHM 115 Lecture", type: "class", icon: "BookOpen", color: getColor("CHM 115"), frequency: "weekly", daysOfWeek: ["Tuesday", "Thursday"], startTime: "10:30", endTime: "11:45", location: "WTHR 200", priority: "critical", courseId: getId("CHM 115"), flexible: false, bufferBefore: 5, bufferAfter: 5, completed: false },
    { name: "MATH 166 Lecture", type: "class", icon: "BookOpen", color: getColor("MATH 166"), frequency: "weekly", daysOfWeek: ["Monday", "Wednesday", "Friday"], startTime: "11:00", endTime: "11:50", location: "MATH 175", priority: "critical", courseId: getId("MATH 166"), flexible: false, bufferBefore: 5, bufferAfter: 5, completed: false },

    { name: "Gym Workout", type: "exercise", icon: "Dumbbell", color: "#f97316", frequency: "weekly", daysOfWeek: ["Monday", "Wednesday", "Friday"], startTime: "06:30", endTime: "07:30", location: "CoRec", priority: "medium", flexible: false, bufferBefore: 0, bufferAfter: 15, completed: false },
    { name: "Breakfast", type: "meal", icon: "Coffee", color: "#f59e0b", frequency: "daily", daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], startTime: "07:30", endTime: "08:00", location: "Dining Court", priority: "low", flexible: true, bufferBefore: 0, bufferAfter: 0, completed: false },
    { name: "Lunch", type: "meal", icon: "UtensilsCrossed", color: "#f59e0b", frequency: "daily", daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], startTime: "12:00", endTime: "12:45", location: "Dining Court", priority: "low", flexible: true, bufferBefore: 0, bufferAfter: 0, completed: false },
    { name: "Dinner", type: "meal", icon: "UtensilsCrossed", color: "#f59e0b", frequency: "daily", daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], startTime: "18:00", endTime: "19:00", location: "Dining Court", priority: "low", flexible: true, bufferBefore: 0, bufferAfter: 0, completed: false },
    { name: "Data Mine Meeting", type: "work", icon: "Briefcase", color: "#8b5cf6", frequency: "weekly", daysOfWeek: ["Tuesday", "Thursday"], startTime: "16:30", endTime: "18:00", location: "Lawson B148", priority: "high", flexible: false, bufferBefore: 5, bufferAfter: 0, completed: false },
    { name: "Club Basketball", type: "exercise", icon: "Trophy", color: "#10b981", frequency: "weekly", daysOfWeek: ["Wednesday"], startTime: "20:00", endTime: "22:00", location: "CoRec Court 3", priority: "medium", flexible: false, bufferBefore: 10, bufferAfter: 10, completed: false },
    { name: "Study Group - CS", type: "study", icon: "Users", color: "#3b82f6", frequency: "weekly", daysOfWeek: ["Sunday"], startTime: "14:00", endTime: "16:00", location: "WALC", priority: "medium", flexible: true, bufferBefore: 0, bufferAfter: 0, completed: false },

    { name: "Doctor Appointment", type: "personal", icon: "Heart", color: "#ec4899", frequency: "once", startTime: "14:00", endTime: "15:00", location: "PUSH", priority: "high", eventDate: new Date(Date.now() + 5 * 86400000), flexible: false, bufferBefore: 15, bufferAfter: 0, completed: false },
    { name: "Advisor Meeting", type: "personal", icon: "MessageSquare", color: "#6366f1", frequency: "once", startTime: "10:00", endTime: "10:30", location: "Lawson 2nd Floor", priority: "high", eventDate: new Date(Date.now() + 3 * 86400000), flexible: false, bufferBefore: 10, bufferAfter: 0, completed: false },
  ];

  await Promise.all(activityData.map(a => storage.createActivity(a)));
  console.log(`Seeded ${activityData.length} activities`);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  if (isLocalDevAuthBypassEnabled()) {
    console.warn(
      "LOCAL_DEV_AUTH_BYPASS enabled: skipping Replit OIDC and using local dev auth routes."
    );
    registerLocalDevAuthRoutes(app);
  } else {
    await setupAuth(app);
    registerAuthRoutes(app);
  }

  await seedDatabase();
  await seedActivities();

  // --- Companion pairing + import endpoints ---
  const pairInput = z.object({
    deviceId: z.string().min(1),
    code: z.string().optional(),
  });

  app.post("/api/companion/pair", requireWebAuth, async (req, res) => {
    const parsed = pairInput.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0]?.message ?? "Invalid input" });
    }

    const userId = getCurrentUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { deviceId } = parsed.data;

    await db
      .insert(companionDevices)
      .values({
        deviceId,
        userId,
        lastPairedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: companionDevices.deviceId,
        set: { userId, lastPairedAt: new Date() },
      });

    const token = crypto.randomBytes(32).toString("base64url");
    const tokenHash = sha256Hex(token);
    const expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000); // ~180 days

    await db.insert(companionTokens).values({
      tokenHash,
      deviceId,
      userId,
      expiresAt,
      lastUsedAt: new Date(),
    });

    res.json({ token, deviceId });
  });

  function getBearerToken(req: any): string | null {
    const header = req.headers["authorization"] ?? "";
    if (typeof header !== "string") return null;
    const m = header.match(/^Bearer (.+)$/i);
    return m ? m[1] : null;
  }

  async function verifyCompanionToken(req: any) {
    const token = getBearerToken(req);
    if (!token) return null;
    const tokenHash = sha256Hex(token);
    const [row] = await db.select().from(companionTokens).where(eq(companionTokens.tokenHash, tokenHash));
    if (!row) return null;
    if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return null;
    await db
      .update(companionTokens)
      .set({ lastUsedAt: new Date() })
      .where(eq(companionTokens.tokenHash, tokenHash));
    return row;
  }

  app.get("/api/companion/token/verify", async (req, res) => {
    const verified = await verifyCompanionToken(req);
    if (!verified) return res.status(401).json({ ok: false });
    res.json({ ok: true, deviceId: verified.deviceId, userId: verified.userId ?? null });
  });

  const importedAssignmentSchema = z.object({
    source: z.string().optional(),
    platform: z.string().optional(),
    type: z.string().optional(),
    course: z.object({
      code: z.string().optional(),
      name: z.string().min(1),
      section: z.string().optional().nullable(),
    }),
    title: z.string().min(1),
    due_at: z.string().min(1),
    points: z.number().optional().nullable(),
    status: z.string().optional().nullable(),
    deep_link_url: z.string().optional().nullable(),
  });

  const importBody = z.object({
    deviceId: z.string().min(1),
    assignments: z.array(importedAssignmentSchema),
  });

  app.post("/api/companion/import/assignments", async (req, res) => {
    const verified = await verifyCompanionToken(req);
    if (!verified) return res.status(401).json({ message: "Unauthorized" });

    const parsed = importBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0]?.message ?? "Invalid input" });
    }

    if (parsed.data.deviceId !== verified.deviceId) {
      return res.status(403).json({ message: "Device mismatch" });
    }

    let imported = 0;
    let updated = 0;

    for (const a of parsed.data.assignments) {
      const dueDate = new Date(a.due_at);
      if (Number.isNaN(dueDate.getTime())) continue;

      const courseCode = a.course.code ?? a.course.name;
      const courseSection = a.course.section ?? null;

      const existingCourse = await db
        .select()
        .from(courses)
        .where(
          and(
            eq(courses.code, courseCode),
            courseSection === null ? isNull(courses.section) : eq(courses.section, courseSection)
          )
        );

      let courseId: number;
      if (existingCourse.length > 0) {
        courseId = existingCourse[0]!.id;
      } else {
        const color = `#${sha256Hex(`${courseCode}|${courseSection ?? ""}`).slice(0, 6)}`;
        const [created] = await db
          .insert(courses)
          .values({ code: courseCode, name: a.course.name, color, section: courseSection })
          .returning();
        courseId = created!.id;
      }

      const dedupeKey = sha256Hex(
        a.deep_link_url && a.deep_link_url.trim().length > 0
          ? `url|${a.deep_link_url}`
          : `fallback|${a.course.name}|${courseSection ?? ""}|${a.title}|${dueDate.toISOString()}`
      );

      const [existingAssignment] = await db
        .select()
        .from(assignments)
        .where(eq(assignments.dedupeKey, dedupeKey));

      const completed =
        typeof a.status === "string" &&
        ["submitted", "complete", "completed", "done"].includes(a.status.toLowerCase());

      const values = {
        courseId,
        title: a.title,
        type: a.type ?? "homework",
        platform: a.platform ?? "Brightspace",
        dueDate,
        completed,
        points: a.points ?? null,
        status: a.status ?? null,
        deepLinkUrl: a.deep_link_url ?? null,
        source: a.source ?? "unknown",
        dedupeKey,
      };

      if (existingAssignment) {
        await db.update(assignments).set(values).where(eq(assignments.id, existingAssignment.id));
        updated += 1;
      } else {
        await db.insert(assignments).values(values);
        imported += 1;
      }
    }

    res.json({ ok: true, imported, updated });
  });

  app.get(api.courses.list.path, async (req, res) => {
    const courses = await storage.getCourses();
    res.json(courses);
  });

  app.post(api.assignments.create.path, async (req, res) => {
    try {
      const input = api.assignments.create.input.parse(req.body);
      const assignment = await storage.createAssignment(input);
      res.status(201).json(assignment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.assignments.list.path, async (req, res) => {
    const assignments = await storage.getAssignments();
    res.json(assignments);
  });

  app.get(api.assignments.get.path, async (req, res) => {
    const assignment = await storage.getAssignment(Number(req.params.id));
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.json(assignment);
  });

  app.patch(api.assignments.update.path, async (req, res) => {
    try {
      const input = api.assignments.update.input.parse(req.body);
      const updated = await storage.updateAssignment(Number(req.params.id), input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.assignments.toggleComplete.path, async (req, res) => {
    try {
      const { completed } = api.assignments.toggleComplete.input.parse(req.body);
      const updated = await storage.updateAssignment(Number(req.params.id), { completed });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete(api.assignments.remove.path, async (req, res) => {
    try {
      await storage.deleteAssignment(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ message: "Assignment not found" });
    }
  });

  app.get(api.activities.list.path, async (req, res) => {
    const activities = await storage.getActivities();
    res.json(activities);
  });

  app.get(api.activities.get.path, async (req, res) => {
    const activity = await storage.getActivity(Number(req.params.id));
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    res.json(activity);
  });

  app.post(api.activities.create.path, async (req, res) => {
    try {
      const input = api.activities.create.input.parse(req.body);
      const activity = await storage.createActivity(input);
      res.status(201).json(activity);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.activities.update.path, async (req, res) => {
    try {
      const input = api.activities.update.input.parse(req.body);
      const updated = await storage.updateActivity(Number(req.params.id), input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.activities.remove.path, async (req, res) => {
    try {
      await storage.deleteActivity(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ message: "Activity not found" });
    }
  });

  app.get(api.scheduleBlocks.list.path, async (req, res) => {
    const blocks = await storage.getScheduleBlocks();
    res.json(blocks);
  });

  app.post(api.scheduleBlocks.create.path, async (req, res) => {
    try {
      const input = api.scheduleBlocks.create.input.parse(req.body);
      const block = await storage.createScheduleBlock(input);
      res.status(201).json(block);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.scheduleBlocks.bulkCreate.path, async (req, res) => {
    try {
      const blocks = req.body.blocks;
      if (!Array.isArray(blocks)) {
        return res.status(400).json({ message: "blocks must be an array" });
      }
      const parsedBlocks = blocks.map((b: any) => ({
        ...b,
        date: new Date(b.date),
        activityId: b.activityId || null,
        assignmentId: b.assignmentId || null,
      }));
      const created = await storage.createScheduleBlocks(parsedBlocks);
      res.status(201).json(created);
    } catch (err: any) {
      console.error("Bulk create error:", err?.message || err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.scheduleBlocks.update.path, async (req, res) => {
    try {
      const input = api.scheduleBlocks.update.input.parse(req.body);
      const updated = await storage.updateScheduleBlock(Number(req.params.id), input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.scheduleBlocks.toggleComplete.path, async (req, res) => {
    try {
      const { isCompleted } = api.scheduleBlocks.toggleComplete.input.parse(req.body);
      const updated = await storage.updateScheduleBlock(Number(req.params.id), { isCompleted });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete(api.scheduleBlocks.clearGenerated.path, async (req, res) => {
    try {
      await storage.clearGeneratedBlocks();
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.scheduleBlocks.remove.path, async (req, res) => {
    try {
      await storage.deleteScheduleBlock(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ message: "Schedule block not found" });
    }
  });

  return httpServer;
}
