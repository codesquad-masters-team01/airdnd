import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createReservation, cancelReservation, getReservations } from './reservationsApi';
import { roomQueryKeys } from '../../rooms/api/roomsQueries';

export const reservationQueryKeys = {
  list: ['reservations', 'list'] as const,
};

export function useReservationsQuery() {
  return useQuery({
    queryKey: reservationQueryKeys.list,
    queryFn: getReservations,
  });
}

export function useCreateReservationMutation(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationQueryKeys.list });
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
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
