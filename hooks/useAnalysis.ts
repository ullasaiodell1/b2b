import { getAnalysis } from '@/services/api/analysis';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export const analysisKeys = {
  all: ['analysis'] as const,
  lists: () => [...analysisKeys.all, 'list'] as const,
  list: () => [...analysisKeys.lists()] as const,
  analysisFilter: (params?: any) => [...analysisKeys.lists(), params] as const,
};

// ── READ ───────────────────────────────────────────────────────────
export function useAnalysis(params?: any) {
  const query = useQuery({
    queryKey: analysisKeys.analysisFilter(params),
    queryFn: async () => {
      const raw = await getAnalysis(params);
      return raw;
    },
  });
  useEffect(() => {
    if (query.data) {
      console.log('[useAnalysis] Query success data:', query.data);
    }
  }, [query.data]);
  useEffect(() => {
    if (query.isError) {
      console.error('[useAnalysis] Query error:', query.error);
    }
  }, [query.isError, query.error]);
  return query;
}
