import { getHolidays } from '@/services/api/holidays';
import { useQuery } from '@tanstack/react-query';

export const holidayKeys = {
  all: ['holidays'] as const,
};

export function useHolidays() {
  return useQuery({
    queryKey: holidayKeys.all,
    queryFn: async () => {
      const res = await getHolidays();
      const raw = res as any;
      return (Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.data?.data)
          ? raw.data.data
          : Array.isArray(raw)
            ? raw
            : []) as any[];
    },
  });
}
