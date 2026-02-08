import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(), // e.g., "CS 159"
  name: text("name").notNull(), // e.g., "Intro to Programming"
  color: text("color").notNull(), // e.g., "#ef4444"
});

export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: text("title").notNull(), // e.g., "Homework 2"
  type: text("type").notNull(), // e.g., "homework", "quiz", "exam", "lab"
  dueDate: timestamp("due_date").notNull(),
  completed: boolean("completed").default(false).notNull(),
});

export const coursesRelations = relations(courses, ({ many }) => ({
  assignments: many(assignments),
}));

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  course: one(courses, {
    fields: [assignments.courseId],
    references: [courses.id],
  }),
}));

export const insertCourseSchema = createInsertSchema(courses).omit({ id: true });
export const insertAssignmentSchema = createInsertSchema(assignments).omit({ id: true });

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;

// API Types
export type AssignmentWithCourse = Assignment & { course: Course };

// Request types
export type CreateAssignmentRequest = InsertAssignment;
export type UpdateAssignmentRequest = Partial<InsertAssignment>;
