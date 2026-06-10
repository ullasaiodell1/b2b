import { updateLeadsState } from '@/components/LeadState';
import { createLead, deleteLead, getLeadDetails, getLeads, getLeadSources, getLeadStatuses, updateLead } from '@/services/api/leads';
import { getUsers } from '@/services/api/users';
import { LeadRecord } from '@/types/leads';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useLeads(params?: any) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['leads', params],
    queryFn: async () => {
      // httpRequest interceptor unwraps response.data → res = JSON body
      // Backend returns: { total: N, data: [...leads] }
      const response = await getLeads(params);
      console.log('[useLeads] Raw response type:', typeof response, Array.isArray(response));
      console.log('[useLeads] Raw response keys:', response ? Object.keys(response) : 'null');

      // Handle all possible response shapes
      let rawData: any[] = [];
      if (Array.isArray(response)) {
        // Direct array
        rawData = response;
      } else if (Array.isArray(response?.data)) {
        // { total, data: [...] }
        rawData = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        // double-nested { data: { data: [...] } }
        rawData = response.data.data;
      }

      console.log('[useLeads] rawData length:', rawData.length);

      const mapped: LeadRecord[] = rawData.map((item: any) => {
        let priority: 'High' | 'Normal' | 'Low' = 'Normal';
        const rawPriority = (item.priority || '').toUpperCase();
        if (rawPriority === 'HOT' || rawPriority === 'HIGH') priority = 'High';
        else if (rawPriority === 'WARM' || rawPriority === 'NORMAL') priority = 'Normal';
        else if (rawPriority === 'COLD' || rawPriority === 'LOW') priority = 'Low';

        const tag = (item.tags && Array.isArray(item.tags) && item.tags[0]?.name)
          || item.tag
          || '';

        return {
          id: String(item.id),
          name: item.name || '',
          company: item.company_name || item.company || '',
          email: item.email || '',
          phone: item.phone || '',
          tag: tag,
          priority: priority,
          owner: item.assigned_to_name || item.owner || '',
          status: item.status_name || item.status || '',
          source: item.source_name || item.source || '',
          ...item,
        } as any;
      });

      return mapped;
    },
  });

  const leads = query.data || [];

  useEffect(() => {
    if (query.data) {
      console.log('[useLeads] Query success data count:', query.data.length);
      updateLeadsState(query.data);
    }
  }, [query.data]);

  useEffect(() => {
    if (query.isError) {
      console.error('[useLeads] Query error:', query.error);
    }
  }, [query.isError, query.error]);

  const createMutation = useMutation({
    mutationFn: (newLeadData: any) => createLead(newLeadData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateLead(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leadDetails', variables.id] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });

  return {
    leads,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
    createLead: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateLead: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteLead: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export function useLeadDetails(id: string) {
  return useQuery({
    queryKey: ['leadDetails', id],
    queryFn: async () => {
      if (!id) return null;
      // Backend: GET /leads/:id returns { total:1, data: [lead] }
      // httpRequest interceptor returns the JSON body, so res = { total, data: [lead] }
      const res = await getLeadDetails(id);
      const raw = Array.isArray(res?.data) ? res.data[0] : res?.data || null;
      if (raw) {
        let priority: 'High' | 'Normal' | 'Low' = 'Normal';
        if (raw.priority === 'HOT') priority = 'High';
        else if (raw.priority === 'WARM') priority = 'Normal';
        else if (raw.priority === 'COLD') priority = 'Low';

        const tag = (raw.tags && raw.tags[0]?.name) || raw.tag || '';

        return {
          id: String(raw.id),
          name: raw.name || '',
          company: raw.company_name || raw.company || '',
          email: raw.email || '',
          phone: raw.phone || '',
          tag: tag,
          priority: priority,
          owner: raw.assigned_to_name || raw.owner || '',
          status: raw.status_name || raw.status || '',
          source: raw.source_name || raw.source || '',
          ...raw
        } as any;
      }
      return null;
    },
    enabled: !!id
  });
}

export function useLeadStatuses() {
  return useQuery({
    queryKey: ['leadStatuses'],
    queryFn: async () => {
      // Backend: { total, data: [...statuses] } — interceptor already unwraps to JSON body
      const res = await getLeadStatuses();
      return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    }
  });
}

export function useLeadSources() {
  return useQuery({
    queryKey: ['leadSources'],
    queryFn: async () => {
      // Backend: { total, data: [...sources] } — interceptor already unwraps to JSON body
      const res = await getLeadSources();
      return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    }
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Backend: { total, data: [...users] } — interceptor already unwraps to JSON body
      const res = await getUsers();
      return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    }
  });
}

