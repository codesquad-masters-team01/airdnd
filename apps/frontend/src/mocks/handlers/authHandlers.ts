import { http, HttpResponse } from 'msw';
import { User } from '../../features/auth/model/authTypes';

export function getMockUser(): User | null {
  return null;
}

export const authHandlers = [
  http.get('/api/auth/me', () => HttpResponse.json(getMockUser())),
  http.post('/api/auth/logout', () => new HttpResponse(null, { status: 204 })),
];
