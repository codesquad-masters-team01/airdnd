import { useQuery } from '@tanstack/react-query';
import { getRoomReviewSummary } from './reviewsApi';

export function useRoomReviewSummaryQuery(roomId: number) {
  return useQuery({
    queryKey: ['reviews', 'summary', roomId],
    queryFn: () => getRoomReviewSummary(roomId),
    staleTime: 1000 * 60 * 5, // 5분 동안은 캐시된 데이터 사용 (성능 최적화)
  });
}