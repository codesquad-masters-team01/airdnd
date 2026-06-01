import { z } from 'zod';

export const adminDashboardSchema = z.object({
  pendingRooms: z.number(),
  activeUsers: z.number(),
  reservationsToday: z.number(),
  waitQueueSize: z.number(),
});

export type AdminDashboard = z.infer<typeof adminDashboardSchema>;
