import { useQuery } from '@tanstack/react-query';
import { getAdminDashboard } from './adminApi';

export const adminQueryKeys = {
  dashboard: ['admin', 'dashboard'] as const,
};

export function useAdminDashboardQuery() {
  return useQuery({
    queryKey: adminQueryKeys.dashboard,
    queryFn: getAdminDashboard,
  });
}
