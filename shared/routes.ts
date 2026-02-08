import { z } from 'zod';
import { insertAssignmentSchema, insertCourseSchema, insertActivitySchema, insertScheduleBlockSchema, assignments, courses, activities, scheduleBlocks } from './schema';

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
    },
    create: {
      method: 'POST' as const,
      path: '/api/assignments' as const,
      input: insertAssignmentSchema,
      responses: {
        201: z.custom<typeof assignments.$inferSelect>(),
      },
    },
    remove: {
      method: 'DELETE' as const,
      path: '/api/assignments/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  activities: {
    list: {
      method: 'GET' as const,
      path: '/api/activities' as const,
    },
    get: {
      method: 'GET' as const,
      path: '/api/activities/:id' as const,
    },
    create: {
      method: 'POST' as const,
      path: '/api/activities' as const,
      input: insertActivitySchema,
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/activities/:id' as const,
      input: insertActivitySchema.partial(),
    },
    remove: {
      method: 'DELETE' as const,
      path: '/api/activities/:id' as const,
    },
  },
  scheduleBlocks: {
    list: {
      method: 'GET' as const,
      path: '/api/schedule-blocks' as const,
    },
    create: {
      method: 'POST' as const,
      path: '/api/schedule-blocks' as const,
      input: insertScheduleBlockSchema,
    },
    bulkCreate: {
      method: 'POST' as const,
      path: '/api/schedule-blocks/bulk' as const,
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/schedule-blocks/:id' as const,
      input: insertScheduleBlockSchema.partial(),
    },
    toggleComplete: {
      method: 'PATCH' as const,
      path: '/api/schedule-blocks/:id/toggle' as const,
      input: z.object({ isCompleted: z.boolean() }),
    },
    remove: {
      method: 'DELETE' as const,
      path: '/api/schedule-blocks/:id' as const,
    },
    clearGenerated: {
      method: 'DELETE' as const,
      path: '/api/schedule-blocks/generated' as const,
    },
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
