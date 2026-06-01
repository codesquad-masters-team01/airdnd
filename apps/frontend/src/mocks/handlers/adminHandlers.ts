import { http, HttpResponse } from 'msw';
import { mockAdminDashboard } from '../fixtures/mockData';
import { getMockUser } from './authHandlers';

export const adminHandlers = [
  http.get('/api/admin/dashboard', () => {
    const user = getMockUser();

    if (!user) {
      return HttpResponse.json(
        { code: 'UNAUTHENTICATED', message: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    if (user.role !== 'ADMIN') {
      return HttpResponse.json(
        { code: 'FORBIDDEN', message: '권한이 없습니다.' },
        { status: 403 },
      );
    }

    return HttpResponse.json(mockAdminDashboard);
  }),
];
