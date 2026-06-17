import { getCompanies, getCompanyAccounts } from '@/services/api/company';
import { useQuery } from '@tanstack/react-query';

export const companyKeys = {
  all: ['companyAccounts'] as const,
  lists: () => [...companyKeys.all, 'list'] as const,
  list: () => [...companyKeys.lists()] as const,
  details: (companyId: string) => [...companyKeys.all, 'details', companyId] as const,
  companiesAll: ['companies'] as const,
  companiesList: (params?: any) => [...companyKeys.companiesAll, 'list', params] as const,
};

// ── READ ───────────────────────────────────────────────────────────
export function useCompanies(params?: any) {
  return useQuery({
    queryKey: companyKeys.companiesList(params),
    queryFn: async () => {
      const response = await getCompanies(params);
      let rawData: any[] = [];
      if (Array.isArray(response)) {
        rawData = response;
      } else if (Array.isArray(response?.data)) {
        rawData = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        rawData = response.data.data;
      }
      return rawData;
    }
  });
}

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
