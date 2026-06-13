import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { User, ApiErrorResponse, UserListResponse } from '@/types/user';
import { listUsers } from '@/services/api/users';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: () => [...userKeys.lists()] as const,
  userFilter: (params?: any) => [...userKeys.lists(), params] as const,
};

export const useUsersCombobox = (
  params?: Record<string, unknown>,
  options?: Omit<
    UseQueryOptions<User[], ApiErrorResponse>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<User[], ApiErrorResponse>({
    queryKey: userKeys.userFilter({ ...params, combobox: true }),
    queryFn: async () => {
      const response = await listUsers({
        ...params,
        combobox: true,
      });
      const data = response as unknown as UserListResponse;
      return data.data || [];
    },
    ...options,
  });
};
