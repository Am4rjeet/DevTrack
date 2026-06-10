import { z } from 'zod';

const activityTypes = ['coding', 'dsa', 'learning', 'project', 'other'];
const platforms = ['leetcode', 'hackerrank', 'codeforces', 'codewars', 'other'];
const difficulties = ['easy', 'medium', 'hard'];

const metadataSchema = z
  .object({
    platform: z.enum(platforms).optional(),
    difficulty: z.enum(difficulties).optional(),
    problemUrl: z.string().url().optional().or(z.literal('')),
    tags: z.array(z.string().trim()).max(10).optional(),
    solved: z.boolean().optional(),
  })
  .optional();

const progressBodySchema = z.object({
  type: z.enum(activityTypes),
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(1000).trim().optional(),
  durationMinutes: z.coerce.number().int().min(1).max(1440),
  date: z.coerce.date({ invalid_type_error: 'Invalid activity date' }),
  metadata: metadataSchema,
});

export const createProgressSchema = z.object({
  body: progressBodySchema,
});

export const updateProgressSchema = z.object({
  params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid entry ID') }),
  body: progressBodySchema.partial(),
});

export const progressIdSchema = z.object({
  params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid entry ID') }),
});

export const progressListSchema = z.object({
  query: z.object({
    type: z.enum(activityTypes).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

export const progressSummarySchema = z.object({
  query: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});
