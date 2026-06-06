import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, logout } from './authApi';

export const authQueryKeys = {
  me: ['auth', 'me'] as const,
};

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: authQueryKeys.me,
    queryFn: getCurrentUser,
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(authQueryKeys.me, null);
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== 'auth',
      });
    },
  });
}
