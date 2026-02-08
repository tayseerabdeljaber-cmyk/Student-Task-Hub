import { db } from "./db";
import {
  assignments,
  courses,
  activities,
  scheduleBlocks,
  type Assignment,
  type InsertAssignment,
  type Course,
  type AssignmentWithCourse,
  type Activity,
  type InsertActivity,
  type ScheduleBlock,
  type InsertScheduleBlock
} from "@shared/schema";
import { eq, desc, asc, and } from "drizzle-orm";

export interface IStorage {
  getCourses(): Promise<Course[]>;
  getAssignments(): Promise<AssignmentWithCourse[]>;
  getAssignment(id: number): Promise<AssignmentWithCourse | undefined>;
  updateAssignment(id: number, updates: Partial<InsertAssignment>): Promise<Assignment>;
  deleteAssignment(id: number): Promise<void>;
  createCourse(course: typeof courses.$inferInsert): Promise<Course>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;

  getActivities(): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, updates: Partial<InsertActivity>): Promise<Activity>;
  deleteActivity(id: number): Promise<void>;

  getScheduleBlocks(): Promise<ScheduleBlock[]>;
  createScheduleBlock(block: InsertScheduleBlock): Promise<ScheduleBlock>;
  createScheduleBlocks(blocks: InsertScheduleBlock[]): Promise<ScheduleBlock[]>;
  updateScheduleBlock(id: number, updates: Partial<InsertScheduleBlock>): Promise<ScheduleBlock>;
  deleteScheduleBlock(id: number): Promise<void>;
  clearGeneratedBlocks(): Promise<void>;
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

  async getActivities(): Promise<Activity[]> {
    return await db.select().from(activities).orderBy(asc(activities.name));
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    const [result] = await db.select().from(activities).where(eq(activities.id, id));
    return result;
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  async updateActivity(id: number, updates: Partial<InsertActivity>): Promise<Activity> {
    const [updated] = await db
      .update(activities)
      .set(updates)
      .where(eq(activities.id, id))
      .returning();
    return updated;
  }

  async deleteActivity(id: number): Promise<void> {
    await db.delete(activities).where(eq(activities.id, id));
  }

  async getScheduleBlocks(): Promise<ScheduleBlock[]> {
    return await db.select().from(scheduleBlocks).orderBy(asc(scheduleBlocks.date), asc(scheduleBlocks.startTime));
  }

  async createScheduleBlock(block: InsertScheduleBlock): Promise<ScheduleBlock> {
    const [newBlock] = await db.insert(scheduleBlocks).values(block).returning();
    return newBlock;
  }

  async createScheduleBlocks(blocks: InsertScheduleBlock[]): Promise<ScheduleBlock[]> {
    if (blocks.length === 0) return [];
    const result = await db.insert(scheduleBlocks).values(blocks).returning();
    return result;
  }

  async updateScheduleBlock(id: number, updates: Partial<InsertScheduleBlock>): Promise<ScheduleBlock> {
    const [updated] = await db
      .update(scheduleBlocks)
      .set(updates)
      .where(eq(scheduleBlocks.id, id))
      .returning();
    return updated;
  }

  async deleteScheduleBlock(id: number): Promise<void> {
    await db.delete(scheduleBlocks).where(eq(scheduleBlocks.id, id));
  }

  async clearGeneratedBlocks(): Promise<void> {
    await db.delete(scheduleBlocks).where(eq(scheduleBlocks.isGenerated, true));
  }
}

export const storage = new DatabaseStorage();
