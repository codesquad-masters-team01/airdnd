import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, logout, mockLogin } from './authApi';

export const authQueryKeys = {
  me: ['auth', 'me'] as const,
};

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: authQueryKeys.me,
    queryFn: getCurrentUser,
  });
}

export function useMockLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mockLogin,
    onSuccess: (user) => {
      queryClient.setQueryData(authQueryKeys.me, user);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(authQueryKeys.me, null);
      queryClient.invalidateQueries();
    },
  });
}
