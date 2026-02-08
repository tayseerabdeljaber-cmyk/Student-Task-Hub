import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export * from "./models/auth";

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  color: text("color").notNull(),
});

export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  platform: text("platform").notNull().default("Brightspace"),
  dueDate: timestamp("due_date").notNull(),
  completed: boolean("completed").default(false).notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  icon: text("icon").notNull().default("BookOpen"),
  color: text("color").notNull().default("#3b82f6"),
  frequency: text("frequency").notNull().default("weekly"),
  daysOfWeek: text("days_of_week").array(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time"),
  durationMinutes: integer("duration_minutes"),
  flexible: boolean("flexible").default(false).notNull(),
  location: text("location"),
  priority: text("priority").notNull().default("medium"),
  bufferBefore: integer("buffer_before").default(0).notNull(),
  bufferAfter: integer("buffer_after").default(0).notNull(),
  courseId: integer("course_id"),
  eventDate: timestamp("event_date"),
  completed: boolean("completed").default(false).notNull(),
});

export const scheduleBlocks = pgTable("schedule_blocks", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id"),
  assignmentId: integer("assignment_id"),
  date: timestamp("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  icon: text("icon").notNull().default("BookOpen"),
  color: text("color").notNull().default("#3b82f6"),
  location: text("location"),
  isGenerated: boolean("is_generated").default(false).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
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
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true });
export const insertScheduleBlockSchema = createInsertSchema(scheduleBlocks).omit({ id: true });

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type ScheduleBlock = typeof scheduleBlocks.$inferSelect;
export type InsertScheduleBlock = z.infer<typeof insertScheduleBlockSchema>;

export type AssignmentWithCourse = Assignment & { course: Course };

export type CreateAssignmentRequest = InsertAssignment;
export type UpdateAssignmentRequest = Partial<InsertAssignment>;
