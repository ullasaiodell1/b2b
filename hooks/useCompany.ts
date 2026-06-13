import { useQuery } from '@tanstack/react-query';
import { getCompanyAccounts } from '@/services/api/company';

export const companyKeys = {
  all: ['companyAccounts'] as const,
  lists: () => [...companyKeys.all, 'list'] as const,
  list: () => [...companyKeys.lists()] as const,
  details: (companyId: string) => [...companyKeys.all, 'details', companyId] as const,
};

export function useCompanyAccounts(companyId: string) {
  return useQuery({
    queryKey: companyKeys.details(companyId),
    queryFn: async () => {
      if (!companyId) return [];
      const res = await getCompanyAccounts(companyId);
      return (res && Array.isArray(res)) ? res : (res && Array.isArray((res as any).data)) ? (res as any).data : [];
    },
    enabled: !!companyId
  });
}
