import { z } from 'zod';

export const reviewSummarySchema = z.object({
  rating: z.number(),
  reviewCount: z.number(),
});

export type ReviewSummary = z.infer<typeof reviewSummarySchema>;