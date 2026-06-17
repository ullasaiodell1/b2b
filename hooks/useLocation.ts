import { useQuery } from '@tanstack/react-query';
import { getCityStateCountry } from '@/services/api/location';

export const locationKeys = {
  all: ['location'] as const,
  countries: (search: string = '') => [...locationKeys.all, 'countries', search] as const,
  states: (countryId?: string, search: string = '') => [...locationKeys.all, 'states', countryId, search] as const,
  cities: (stateId?: string, search: string = '') => [...locationKeys.all, 'cities', stateId, search] as const,
};

// ── READ ───────────────────────────────────────────────────────────
export function useCountries(search: string = '') {
  return useQuery({
    queryKey: locationKeys.countries(search),
    queryFn: async () => {
      const res = await getCityStateCountry({ search, combobox: true, limit: 100 });
      return (res && Array.isArray(res)) ? res : (res && Array.isArray((res as any).data)) ? (res as any).data : [];
    }
  });
}

export function useStates(countryId?: string, search: string = '') {
  return useQuery({
    queryKey: locationKeys.states(countryId, search),
    queryFn: async () => {
      const res = await getCityStateCountry({ search, combobox: true, limit: 100, country_id: countryId });
      return (res && Array.isArray(res)) ? res : (res && Array.isArray((res as any).data)) ? (res as any).data : [];
    },
    enabled: !!countryId,
  });
}

export function useCities(stateId?: string, search: string = '') {
  return useQuery({
    queryKey: locationKeys.cities(stateId, search),
    queryFn: async () => {
      const res = await getCityStateCountry({ search, combobox: true, limit: 100, state_id: stateId });
      return (res && Array.isArray(res)) ? res : (res && Array.isArray((res as any).data)) ? (res as any).data : [];
    },
    enabled: !!stateId,
  });
}
