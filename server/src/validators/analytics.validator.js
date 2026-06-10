import { z } from 'zod';
import { PERIODS } from '../utils/period.utils.js';

const dateRangeQuery = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  days: z.coerce.number().int().min(1).max(365).optional(),
});

export const analyticsQuerySchema = z.object({
  query: dateRangeQuery,
});

export const hoursChartQuerySchema = z.object({
  query: dateRangeQuery.extend({
    granularity: z.enum(['day', 'week']).optional(),
  }),
});

export const heatmapQuerySchema = z.object({
  query: z.object({
    days: z.coerce.number().int().min(7).max(365).optional(),
  }),
});

export const leaderboardQuerySchema = z.object({
  query: z.object({
    period: z.enum(PERIODS).optional(),
  }),
});

export const usernameParamSchema = z.object({
  params: z.object({
    username: z
      .string()
      .min(3)
      .max(30)
      .regex(/^[a-zA-Z0-9_]+$/),
  }),
});
