import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelReservation, getReservation, getReservations } from './reservationsApi';

export const reservationQueryKeys = {
  list: ['reservations', 'list'] as const,
  detail: (reservationId: number) => ['reservations', 'detail', reservationId] as const,
};

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
