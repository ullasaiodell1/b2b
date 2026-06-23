import { getHolidays } from '@/services/api/holidays';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export const holidayKeys = {
  all: ['holidays'] as const,
};

export function useHolidays() {
  const query = useQuery({
    queryKey: holidayKeys.all,
    queryFn: async () => {
      const response = await getHolidays();
      console.log('[useHolidays] Raw response:', response);
      let rawData: any[] = [];
      if (Array.isArray(response)) {
        rawData = response;
      } else if (Array.isArray(response?.data)) {
        rawData = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        rawData = response.data.data;
      } else if (response?.data && typeof response.data === 'object') {
        const dataVal = response.data;
        if (Array.isArray(dataVal)) {
          rawData = dataVal;
        } else if (dataVal.data && Array.isArray(dataVal.data)) {
          rawData = dataVal.data;
        } else {
          rawData = [dataVal];
        }
      }
      console.log('[useHolidays] parsed rawData:', rawData);
      return rawData;
    },
  });

  useEffect(() => {
    if (query.data) {
      console.log('[useHolidays] Query success data:', query.data);
    }
  }, [query.data]);

  useEffect(() => {
    if (query.isError) {
      console.error('[useHolidays] Query error:', query.error);
    }
  }, [query.isError, query.error]);

  return query;
}
