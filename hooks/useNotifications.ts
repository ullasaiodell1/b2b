import { getNotifications } from '@/services/api/notifications';
import { useQuery } from '@tanstack/react-query';

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params?: any) => [...notificationKeys.lists(), params] as const,
};

export const useNotifications = (params?: any) => {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: async () => {
      console.log('[useNotifications] Fetching notifications with params:', JSON.stringify(params));
      const res = await getNotifications(params);
      console.log('[useNotifications] Raw API Response:', JSON.stringify(res));
      return res;
    },
    enabled: true,
  });
};
