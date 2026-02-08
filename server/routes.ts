import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { addDays, setHours, setMinutes, subDays, subHours } from "date-fns";

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
    // Overdue
    { courseId: getId("MATH 166"), title: "Calculus Quiz", type: "quiz", platform: "Brightspace", dueDate: subDays(now, 2), completed: false },
    { courseId: getId("CHM 115"), title: "Pre-Lab Worksheet 3", type: "homework", platform: "Gradescope", dueDate: subDays(now, 1), completed: false },
    { courseId: getId("CS 159"), title: "Lab Attendance", type: "lab", platform: "Brightspace", dueDate: subHours(now, 5), completed: false },

    // Today
    { courseId: getId("CS 159"), title: "Homework 2 (Vocareum)", type: "homework", platform: "Vocareum", dueDate: setHours(setMinutes(now, 0), 23), completed: false },
    { courseId: getId("CS 159"), title: "Lecture Quiz", type: "quiz", platform: "Brightspace", dueDate: setHours(setMinutes(now, 0), 14), completed: true },
    { courseId: getId("PHYS 172"), title: "Reading Assignment 4", type: "reading", platform: "PearsonMyLab", dueDate: setHours(setMinutes(now, 59), 23), completed: false },

    // Tomorrow
    { courseId: getId("PHYS 172"), title: "Quiz - Chapter 3", type: "quiz", platform: "Brightspace", dueDate: setHours(setMinutes(addDays(now, 1), 0), 9), completed: false },
    { courseId: getId("ENGR 132"), title: "Team Meeting Notes", type: "homework", platform: "Piazza", dueDate: setHours(setMinutes(addDays(now, 1), 0), 17), completed: false },

    // Day after tomorrow
    { courseId: getId("ENGR 132"), title: "Lab Report 1", type: "lab", platform: "Gradescope", dueDate: setHours(setMinutes(addDays(now, 2), 59), 23), completed: false },
    { courseId: getId("CHM 115"), title: "Online Homework 5", type: "homework", platform: "WebAssign", dueDate: setHours(setMinutes(addDays(now, 2), 0), 11), completed: false },

    // This week
    { courseId: getId("MATH 166"), title: "Problem Set 4", type: "homework", platform: "WebAssign", dueDate: setHours(setMinutes(addDays(now, 3), 59), 23), completed: false },
    { courseId: getId("CS 159"), title: "Programming Project 1", type: "project", platform: "Vocareum", dueDate: setHours(setMinutes(addDays(now, 4), 59), 23), completed: false },
    { courseId: getId("CHM 115"), title: "Read Chapter 5", type: "reading", platform: "Brightspace", dueDate: setHours(setMinutes(addDays(now, 5), 30), 10), completed: false },
    { courseId: getId("PHYS 172"), title: "iClicker Participation", type: "homework", platform: "Brightspace", dueDate: setHours(setMinutes(addDays(now, 5), 0), 8), completed: false },

    // Next week
    { courseId: getId("PHYS 172"), title: "Exam 1", type: "exam", platform: "In-Class", dueDate: setHours(setMinutes(addDays(now, 7), 0), 8), completed: false },
    { courseId: getId("MATH 166"), title: "Midterm Review", type: "homework", platform: "WebAssign", dueDate: setHours(setMinutes(addDays(now, 8), 59), 23), completed: false },
    { courseId: getId("ENGR 132"), title: "Design Presentation", type: "project", platform: "Brightspace", dueDate: setHours(setMinutes(addDays(now, 9), 0), 14), completed: false },
    { courseId: getId("CS 159"), title: "Exam 1 - Midterm", type: "exam", platform: "In-Class", dueDate: setHours(setMinutes(addDays(now, 10), 30), 9), completed: false },
    { courseId: getId("CHM 115"), title: "Lab Report 2", type: "lab", platform: "Gradescope", dueDate: setHours(setMinutes(addDays(now, 10), 59), 23), completed: false },

    // Later
    { courseId: getId("MATH 166"), title: "Problem Set 5", type: "homework", platform: "WebAssign", dueDate: setHours(setMinutes(addDays(now, 14), 59), 23), completed: false },
    { courseId: getId("ENGR 132"), title: "Final Project Proposal", type: "project", platform: "Brightspace", dueDate: setHours(setMinutes(addDays(now, 18), 59), 23), completed: false },
    { courseId: getId("CS 159"), title: "Programming Project 2", type: "project", platform: "Vocareum", dueDate: setHours(setMinutes(addDays(now, 21), 59), 23), completed: false },
    { courseId: getId("PHYS 172"), title: "Lab Report 3", type: "lab", platform: "Gradescope", dueDate: setHours(setMinutes(addDays(now, 25), 59), 23), completed: false },
    { courseId: getId("CHM 115"), title: "Final Exam", type: "exam", platform: "In-Class", dueDate: setHours(setMinutes(addDays(now, 30), 0), 8), completed: false },
  ];

  await Promise.all(assignmentData.map(a => storage.createAssignment(a)));
  console.log(`Seeded ${assignmentData.length} assignments across ${courseData.length} courses`);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await seedDatabase();

  app.get(api.courses.list.path, async (req, res) => {
    const courses = await storage.getCourses();
    res.json(courses);
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

  return httpServer;
}
