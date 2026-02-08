import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { addDays, setHours, setMinutes, subDays } from "date-fns";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed data if empty
  const existingCourses = await storage.getCourses();
  if (existingCourses.length === 0) {
    console.log("Seeding database...");
    const courseData = [
      { code: "CS 159", name: "Intro to Programming", color: "#3b82f6" }, // Blue
      { code: "PHYS 172", name: "Modern Mechanics", color: "#ef4444" },   // Red
      { code: "ENGR 132", name: "Engineering Design", color: "#f59e0b" }, // Amber
      { code: "CHM 115", name: "General Chemistry", color: "#10b981" },   // Emerald
      { code: "MATH 166", name: "Calculus II", color: "#8b5cf6" },        // Violet
    ];

    const createdCourses = await Promise.all(
      courseData.map(c => storage.createCourse(c))
    );

    const now = new Date();
    
    // Helper to get ID by code
    const getId = (code: string) => createdCourses.find(c => c.code === code)?.id!;

    // Seed assignments based on the prompt
    // We adjust dates relative to "today" to make the demo look good immediately
    await storage.createAssignment({
      courseId: getId("CS 159"),
      title: "Homework 2 (Vocareum)",
      type: "homework",
      dueDate: setHours(setMinutes(now, 0), 23), // Today 11:00 PM
      completed: false
    });
    
    await storage.createAssignment({
      courseId: getId("CS 159"),
      title: "Lecture Quiz",
      type: "quiz",
      dueDate: setHours(setMinutes(now, 0), 14), // Today 2:00 PM
      completed: true // One completed for "Today" view reassurance test
    });

    await storage.createAssignment({
      courseId: getId("PHYS 172"),
      title: "Quiz - Chapter 3",
      type: "quiz",
      dueDate: setHours(setMinutes(addDays(now, 1), 0), 9), // Tomorrow 9:00 AM
      completed: false
    });

    await storage.createAssignment({
      courseId: getId("ENGR 132"),
      title: "Lab Report 1",
      type: "lab",
      dueDate: setHours(setMinutes(addDays(now, 2), 59), 23), // Day after tmrw
      completed: false
    });

    await storage.createAssignment({
      courseId: getId("MATH 166"),
      title: "Problem Set 4",
      type: "homework",
      dueDate: setHours(setMinutes(addDays(now, 4), 59), 23), 
      completed: false
    });

    await storage.createAssignment({
      courseId: getId("CHM 115"),
      title: "Read Chapter 5",
      type: "reading",
      dueDate: setHours(setMinutes(addDays(now, 5), 30), 10), 
      completed: false
    });

    await storage.createAssignment({
      courseId: getId("PHYS 172"),
      title: "Exam 1",
      type: "exam",
      dueDate: setHours(setMinutes(addDays(now, 7), 0), 8), 
      completed: false
    });
    
    // Overdue item
    await storage.createAssignment({
      courseId: getId("MATH 166"),
      title: "Calculus Quiz",
      type: "quiz",
      dueDate: subDays(now, 2), // 2 days ago
      completed: false
    });
  }

  // Routes
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

  return httpServer;
}
