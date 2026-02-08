import { z } from 'zod';
import { insertAssignmentSchema, insertCourseSchema, assignments, courses } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  courses: {
    list: {
      method: 'GET' as const,
      path: '/api/courses' as const,
      responses: {
        200: z.array(z.custom<typeof courses.$inferSelect>()),
      },
    },
  },
  assignments: {
    list: {
      method: 'GET' as const,
      path: '/api/assignments' as const,
      responses: {
        200: z.array(z.custom<typeof assignments.$inferSelect & { course: typeof courses.$inferSelect }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/assignments/:id' as const,
      responses: {
        200: z.custom<typeof assignments.$inferSelect & { course: typeof courses.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/assignments/:id' as const,
      input: insertAssignmentSchema.partial(),
      responses: {
        200: z.custom<typeof assignments.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    toggleComplete: {
      method: 'PATCH' as const,
      path: '/api/assignments/:id/toggle' as const,
      input: z.object({ completed: z.boolean() }),
      responses: {
        200: z.custom<typeof assignments.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
