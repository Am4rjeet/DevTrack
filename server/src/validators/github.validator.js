import { z } from 'zod';

export const connectGithubSchema = z.object({
  body: z.object({
    githubUsername: z
      .string()
      .min(1, 'GitHub username is required')
      .max(39, 'GitHub username cannot exceed 39 characters')
      .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, 'Invalid GitHub username')
      .transform((v) => v.toLowerCase()),
    accessToken: z.string().min(1).optional(),
  }),
});

export const oauthCallbackSchema = z.object({
  query: z.object({
    code: z.string().min(1),
    state: z.string().min(1),
  }),
});
