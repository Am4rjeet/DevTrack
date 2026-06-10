import { z } from 'zod';

const categories = ['dsa', 'coding', 'learning', 'career', 'other'];
const statuses = ['active', 'completed', 'paused', 'abandoned'];
const priorities = ['low', 'medium', 'high'];

const milestoneSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  completed: z.boolean().optional(),
});

const goalBodySchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(1000).trim().optional(),
  category: z.enum(categories).optional(),
  status: z.enum(statuses).optional(),
  priority: z.enum(priorities).optional(),
  targetDate: z.string().datetime().optional().or(z.coerce.date().optional()),
  milestones: z.array(milestoneSchema).max(20).optional(),
  xpReward: z.coerce.number().int().min(0).max(1000).optional(),
});

export const createGoalSchema = z.object({
  body: goalBodySchema,
});

export const updateGoalSchema = z.object({
  params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid goal ID') }),
  body: goalBodySchema.partial(),
});

export const goalIdSchema = z.object({
  params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid goal ID') }),
});

export const goalListSchema = z.object({
  query: z.object({
    status: z.enum(statuses).optional(),
    category: z.enum(categories).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

export const milestoneParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid goal ID'),
    milestoneId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid milestone ID'),
  }),
  body: z
    .object({
      completed: z.boolean().optional(),
    })
    .optional(),
});

export const xpHistorySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    source: z.enum(['progress', 'goal', 'achievement', 'streak_bonus', 'admin']).optional(),
  }),
});
