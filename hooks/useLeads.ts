import { updateLeadsState } from '@/components/LeadState';
import { createLead, deleteLead, getLeadDetails, getLeads, getLeadSources, getLeadStatuses, getLeadTags, updateLead } from '@/services/api/leads';
import { getUsers } from '@/services/api/users';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: () => [...leadKeys.lists()] as const,
  leadFilter: (params?: any) => [...leadKeys.lists(), params] as const,
  details: (id: string) => [...leadKeys.all, 'details', id] as const,
  statuses: () => [...leadKeys.all, 'statuses'] as const,
  sources: () => [...leadKeys.all, 'sources'] as const,
  users: () => [...leadKeys.all, 'users'] as const,
  tags: () => [...leadKeys.all, 'tags'] as const,
};

export function useLeadDetails(id: string) {
  return useQuery({
    queryKey: leadKeys.details(id),
    queryFn: async () => {
      if (!id) return null;
      const res = await getLeadDetails(id);
      const raw = Array.isArray(res?.data) ? res.data[0] : res?.data || null;
      return raw;
    },
    enabled: !!id
  });
}

export function useLeadStatuses() {
  return useQuery({
    queryKey: leadKeys.statuses(),
    queryFn: async () => {
      const res = await getLeadStatuses();
      return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    }
  });
}

export function useLeadSources() {
  return useQuery({
    queryKey: leadKeys.sources(),
    queryFn: async () => {
      const res = await getLeadSources();
      return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    }
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateLead(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.details(variables.id) });
    }
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
    }
  });
}

export function useUsers() {
  return useQuery({
    queryKey: leadKeys.users(),
    queryFn: async () => {
      const res = await getUsers();
      return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    }
  });
}

export function useLeadTags() {
  return useQuery({
    queryKey: leadKeys.tags(),
    queryFn: async () => {
      const res = await getLeadTags();
      return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    }
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newLeadData: any) => createLead(newLeadData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
    }
  });
}

export function useLeads(params?: any) {
  const query = useQuery({
    queryKey: leadKeys.leadFilter(params),
    queryFn: async () => {
      const response = await getLeads(params);
      console.log('[useLeads] Raw response type:', typeof response, Array.isArray(response));
      console.log('[useLeads] Raw response keys:', response ? Object.keys(response) : 'null');
      let rawData: any[] = [];
      if (Array.isArray(response)) {
        rawData = response;
      } else if (Array.isArray(response?.data)) {
        rawData = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        rawData = response.data.data;
      }
      console.log('[useLeads] rawData length:', rawData.length);
      return rawData;
    },
  });
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
  return query;
}