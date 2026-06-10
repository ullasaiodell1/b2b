import { updateVisitsState, VisitRecord } from '@/components/VisitState';
import { getLeads } from '@/services/api/leads';
import { createVisit, getVisits } from '@/services/api/visit';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useVisits(params?: any) {
  const query = useQuery({
    queryKey: ['visits', params],
    queryFn: async () => {
      const response: any = await getVisits(params);
      
      let rawData: any[] = [];
      if (Array.isArray(response)) {
        rawData = response;
      } else if (Array.isArray(response?.data)) {
        rawData = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        rawData = response.data.data;
      }

      const mapped: VisitRecord[] = rawData.map((item: any) => {
        let displayStatus: 'Pending' | 'Complete' | 'Draft' | 'Bounce' = 'Pending';
        const rawStatus = String(item.status || '').toUpperCase();
        if (rawStatus === 'COMPLETED' || rawStatus === 'COMPLETE') displayStatus = 'Complete';
        else if (rawStatus === 'DRAFT') displayStatus = 'Draft';
        else if (rawStatus === 'BOUNCE') displayStatus = 'Bounce';
        else displayStatus = 'Pending';

        const formatLatitude = (lat: number) => {
          const dir = lat >= 0 ? 'N' : 'S';
          return `${Math.abs(lat).toFixed(4)}° ${dir}`;
        };
        const formatLongitude = (lng: number) => {
          const dir = lng >= 0 ? 'E' : 'W';
          return `${Math.abs(lng).toFixed(4)}° ${dir}`;
        };

        const latStr = item.location_latitude !== undefined && item.location_latitude !== null 
          ? formatLatitude(Number(item.location_latitude)) 
          : '18.4729° N';
        const lngStr = item.location_longitude !== undefined && item.location_longitude !== null 
          ? formatLongitude(Number(item.location_longitude)) 
          : '73.8567° E';

        let scheduledStr = '';
        if (item.scheduled_time) {
          try {
            const date = new Date(item.scheduled_time);
            const d = String(date.getDate()).padStart(2, '0');
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const y = date.getFullYear();
            const hrs = String(date.getHours()).padStart(2, '0');
            const mins = String(date.getMinutes()).padStart(2, '0');
            scheduledStr = `${d}-${m}-${y} ${hrs}:${mins}`;
          } catch {
            scheduledStr = String(item.scheduled_time);
          }
        }

        let imgUri: string | undefined = undefined;
        if (item.image_url) {
          try {
            // image_url may be a JSON string like {"url":"...","thumb":"..."}
            const parsed = JSON.parse(item.image_url);
            const candidate = parsed?.url || parsed?.thumb || parsed?.src;
            // Only use if it's a non-empty string
            if (typeof candidate === 'string' && candidate.length > 0) {
              imgUri = candidate;
            }
          } catch {
            // Not JSON — treat as a direct URL string
            if (typeof item.image_url === 'string' && item.image_url.startsWith('http')) {
              imgUri = item.image_url;
            }
          }
        }

        return {
          id: String(item.id),
          name: item.title || '',
          visitType: item.visit_type || 'Site Visit',
          scheduledDateTime: scheduledStr,
          description: item.description || '',
          locationAddress: item.location_address || '',
          lat: latStr,
          lng: lngStr,
          status: displayStatus,
          imageUri: imgUri || '',
          contactPersonName: item.contact_person_name || '',
          designation: item.contact_person_designation || '',
          phone: item.contact_person_phone || '',
          outcomeSummary: item.outcome_summary || '',
          nextSteps: item.next_steps || '',
          company: item.lead_company_name || item.company || '',
          location: item.location_address || '',
        };
      });

      return mapped;
    }
  });

  const visits = query.data || [];

  useEffect(() => {
    if (query.data) {
      updateVisitsState(query.data);
    }
  }, [query.data]);

  return {
    visits,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useCreateVisit() {
  const queryClient = useQueryClient();

  const mutateAsync = async (data: Partial<VisitRecord> & { leadId?: string }) => {
    let targetLeadId = data.leadId;
    if (!targetLeadId) {
      try {
        const leadsRes = await getLeads({ limit: 1 });
        const firstLead = Array.isArray(leadsRes) ? leadsRes[0] : (leadsRes?.data?.[0] || leadsRes?.data?.data?.[0]);
        if (firstLead) {
          targetLeadId = firstLead.id;
        }
      } catch (err) {
        console.error('Failed to get fallback lead:', err);
      }
    }
    if (!targetLeadId) {
      throw new Error('A valid Lead ID is required to create a visit.');
    }

    let isoTime = null;
    if (data.scheduledDateTime) {
      try {
        const [datePart, timePart] = data.scheduledDateTime.split(' ');
        const [d, m, y] = datePart.split('-').map(Number);
        const [h, min] = timePart.split(':').map(Number);
        const dateObj = new Date(y, m - 1, d, h, min);
        isoTime = dateObj.toISOString();
      } catch {
        isoTime = new Date().toISOString();
      }
    }

    const parseCoord = (str: string | undefined) => {
      if (!str) return null;
      const num = parseFloat(str.replace(/[^0-9.]/g, ''));
      const isSouthOrWest = str.includes('S') || str.includes('W');
      return isSouthOrWest ? -num : num;
    };

    const apiPayload = {
      title: data.name || '',
      description: data.description || '',
      visit_type: data.visitType || 'Site Visit',
      status: 'SCHEDULED',
      scheduled_time: isoTime,
      location_address: data.locationAddress || '',
      location_latitude: parseCoord(data.lat) || 0,
      location_longitude: parseCoord(data.lng) || 0,
      outcome_summary: data.outcomeSummary || '',
      next_steps: data.nextSteps || '',
      contact_person_name: data.contactPersonName || '',
      contact_person_designation: data.designation || '',
      contact_person_phone: data.phone || '',
      image_url: data.imageUri || '',
    };

    const res = await createVisit(targetLeadId, apiPayload as any);
    queryClient.invalidateQueries({ queryKey: ['visits'] });
    return res;
  };

  return { mutateAsync, isPending: false };
}
