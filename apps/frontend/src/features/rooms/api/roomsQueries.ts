import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRoom, getRooms, updateRoom, RoomUpdateRequest } from './roomsApi';
import { RoomSearchParams } from '../model/roomTypes';

export const roomQueryKeys = {
  list: (params: RoomSearchParams) => ['rooms', 'list', params] as const,
  detail: (roomId: number) => ['rooms', 'detail', roomId] as const,
};

export function useRoomsQuery(params: RoomSearchParams) {
  return useQuery({
    queryKey: roomQueryKeys.list(params),
    queryFn: () => getRooms(params),
  });
}

export function useRoomQuery(roomId: number) {
  return useQuery({
    queryKey: roomQueryKeys.detail(roomId),
    queryFn: () => getRoom(roomId),
    enabled: Number.isFinite(roomId),
  });
}

export function useUpdateRoomMutation(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RoomUpdateRequest) => updateRoom(roomId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomQueryKeys.detail(roomId) });
    },
  });
}
