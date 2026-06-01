import { http, HttpResponse } from 'msw';
import { UserRole } from '../../features/auth/model/authTypes';
import { mockUsers } from '../fixtures/mockData';

let currentRole: UserRole | null = null;

export function getMockUser() {
  return currentRole ? mockUsers[currentRole] : null;
}

export const authHandlers = [
  http.get('/api/auth/me', () => HttpResponse.json(getMockUser())),
  http.post('/api/auth/mock-login', async ({ request }) => {
    const body = (await request.json()) as { role?: UserRole };

    if (!body.role || !mockUsers[body.role]) {
      return HttpResponse.json(
        { code: 'INVALID_ROLE', message: '지원하지 않는 mock 로그인 역할입니다.' },
        { status: 400 },
      );
    }

    currentRole = body.role;
    return HttpResponse.json(mockUsers[currentRole]);
  }),
  http.post('/api/auth/logout', () => {
    currentRole = null;
    return new HttpResponse(null, { status: 204 });
  }),
];
