import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createReservation,
  cancelReservation,
  getReservation,
  getReservations,
  getRoomBookedDates,
} from './reservationsApi';
import { roomQueryKeys } from '../../rooms/api/roomsQueries';

export const reservationQueryKeys = {
  list: ['reservations', 'list'] as const,
  detail: (reservationId: number) => ['reservations', 'detail', reservationId] as const,
  bookedDates: (roomId: number) => ['reservations', 'booked-dates', roomId] as const,
};

export function useRoomBookedDatesQuery(roomId: number) {
  return useQuery({
    queryKey: reservationQueryKeys.bookedDates(roomId),
    queryFn: () => getRoomBookedDates(roomId),
    enabled: Number.isFinite(roomId),
  });
}

export function useReservationsQuery() {
  return useQuery({
    queryKey: reservationQueryKeys.list,
    queryFn: getReservations,
  });
}

export function useReservationQuery(reservationId: number) {
  return useQuery({
    queryKey: reservationQueryKeys.detail(reservationId),
    queryFn: () => getReservation(reservationId),
    enabled: Number.isFinite(reservationId),
  });
}

export function useCreateReservationMutation(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationQueryKeys.list });
      queryClient.invalidateQueries({ queryKey: reservationQueryKeys.bookedDates(roomId) });
      queryClient.invalidateQueries({ queryKey: roomQueryKeys.detail(roomId) });
    },
  });
}

export function useCancelReservationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationQueryKeys.list });
      queryClient.invalidateQueries({ queryKey: ['reservations', 'booked-dates'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
