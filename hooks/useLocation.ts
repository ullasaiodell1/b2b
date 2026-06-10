import { useQuery } from '@tanstack/react-query';
import { getCityStateCountry } from '@/services/api/location';

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: () => getCityStateCountry() as Promise<any>,
  });
}

export function useStates(country?: string) {
  return useQuery({
    queryKey: ['states', country],
    queryFn: () => getCityStateCountry({ country }) as Promise<any>,
    enabled: !!country,
  });
}

export function useCities(stateName?: string) {
  return useQuery({
    queryKey: ['cities', stateName],
    queryFn: () => getCityStateCountry({ state: stateName }) as Promise<any>,
    enabled: !!stateName,
  });
}
