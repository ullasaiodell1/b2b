import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { User, ApiErrorResponse, UserListResponse } from '@/types/user';
import { listUsers } from '@/services/api/users';

const queryKeys = {
  users: {
    list: (params?: any) => ['users', 'list', params],
  }
};

export const useUsersCombobox = (
  params?: Record<string, unknown>,
  options?: Omit<
    UseQueryOptions<User[], ApiErrorResponse>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<User[], ApiErrorResponse>({
    queryKey: queryKeys.users.list({ ...params, combobox: true }),
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
