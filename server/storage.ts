import { db } from "./db";
import {
  assignments,
  courses,
  type Assignment,
  type InsertAssignment,
  type Course,
  type AssignmentWithCourse
} from "@shared/schema";
import { eq, desc, asc } from "drizzle-orm";

export interface IStorage {
  getCourses(): Promise<Course[]>;
  getAssignments(): Promise<AssignmentWithCourse[]>;
  getAssignment(id: number): Promise<AssignmentWithCourse | undefined>;
  updateAssignment(id: number, updates: Partial<InsertAssignment>): Promise<Assignment>;
  deleteAssignment(id: number): Promise<void>;
  createCourse(course: typeof courses.$inferInsert): Promise<Course>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
}

export class DatabaseStorage implements IStorage {
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  async getAssignments(): Promise<AssignmentWithCourse[]> {
    const results = await db
      .select({
        assignment: assignments,
        course: courses,
      })
      .from(assignments)
      .innerJoin(courses, eq(assignments.courseId, courses.id))
      .orderBy(asc(assignments.dueDate));

    return results.map(row => ({
      ...row.assignment,
      course: row.course,
    }));
  }

  async getAssignment(id: number): Promise<AssignmentWithCourse | undefined> {
    const [result] = await db
      .select({
        assignment: assignments,
        course: courses,
      })
      .from(assignments)
      .innerJoin(courses, eq(assignments.courseId, courses.id))
      .where(eq(assignments.id, id));

    if (!result) return undefined;

    return {
      ...result.assignment,
      course: result.course,
    };
  }

  async updateAssignment(id: number, updates: Partial<InsertAssignment>): Promise<Assignment> {
    const [updated] = await db
      .update(assignments)
      .set(updates)
      .where(eq(assignments.id, id))
      .returning();
    return updated;
  }

  async deleteAssignment(id: number): Promise<void> {
    await db.delete(assignments).where(eq(assignments.id, id));
  }

  async createCourse(course: typeof courses.$inferInsert): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const [newAssignment] = await db.insert(assignments).values(assignment).returning();
    return newAssignment;
  }
}

export const storage = new DatabaseStorage();
