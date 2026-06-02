import { adminHandlers } from './adminHandlers';
import { authHandlers } from './authHandlers';
import { hostHandlers } from './hostHandlers';
import { notificationHandlers } from './notificationHandlers';
import { reservationHandlers } from './reservationHandlers';
import { roomHandlers } from './roomHandlers';

export const handlers = [
  ...authHandlers,
  ...roomHandlers,
  ...reservationHandlers,
  ...hostHandlers,
  ...adminHandlers,
  ...notificationHandlers,
];
