import { request } from '../../../shared/api/httpClient';
import {
  CreateReservationInput,
  Reservation,
  reservationSchema,
} from '../model/reservationTypes';

export async function getReservations() {
  const data = await request<Reservation[]>('/api/reservations');
  return reservationSchema.array().parse(data);
}

export async function createReservation(input: CreateReservationInput) {
  const data = await request<Reservation>('/api/reservations', {
    method: 'POST',
    body: input,
  });
  return reservationSchema.parse(data);
}

export async function cancelReservation(reservationId: number) {
  await request<void>(`/api/reservations/${reservationId}`, {
    method: 'DELETE',
  });
}
