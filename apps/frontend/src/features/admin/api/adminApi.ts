import { request } from '../../../shared/api/httpClient';
import { AdminDashboard, adminDashboardSchema } from '../model/adminTypes';

export async function getAdminDashboard() {
  const data = await request<AdminDashboard>('/api/admin/dashboard');
  return adminDashboardSchema.parse(data);
}
