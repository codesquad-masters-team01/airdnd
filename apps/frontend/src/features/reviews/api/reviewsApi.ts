import { request } from '../../../shared/api/httpClient';
import { ReviewSummary, reviewSummarySchema } from '../model/reviewTypes';

export async function getRoomReviewSummary(roomId: number) {
  const data = await request<ReviewSummary>(`/api/rooms/${roomId}/reviews/summary`);
  return reviewSummarySchema.parse(data);
}