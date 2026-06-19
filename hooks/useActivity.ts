import { getLeadActivity, getLeadTimeline } from '@/services/api/activity';
import { useQuery } from '@tanstack/react-query';

export const activityKeys = {
  all: ['activity'] as const,
  lead: (leadId: string) => [...activityKeys.all, 'lead', leadId] as const,
};

export interface ActivityEvent {
  id: string;
  actor: string;          // e.g. "Admi", "jigar"
  action_type: string;    // e.g. "TASK CREATED", "ACTION", "UPDATED", "FOLLOW-UP", "ATTACHED"
  description: string;   // e.g. "Task created: rgtdfb"
  created_at: string;    // ISO datetime
}

// Normalize raw API items to ActivityEvent
function normalizeEvent(item: any, index: number): ActivityEvent {
  return {
    id: String(item.id ?? item.event_id ?? index),
    actor:
      item.actor ||
      item.performed_by ||
      item.created_by_name ||
      item.user_name ||
      item.user ||
      'System',
    action_type:
      item.action_type ||
      item.event_type ||
      item.activity_type ||
      item.type ||
      'ACTION',
    description:
      item.description ||
      item.message ||
      item.details ||
      item.summary ||
      '',
    created_at: item.created_at || item.timestamp || item.date || '',
  };
}

// ── READ lead activity ─────────────────────────────────────────────
export const useLeadActivity = (leadId: string) => {
  return useQuery({
    queryKey: activityKeys.lead(leadId),
    queryFn: async () => {
      // Try primary endpoint first, fall back to timeline
      try {
        const res = await getLeadActivity(leadId);
        const raw = res as any;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data?.data)
          ? raw.data.data
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.results)
          ? raw.results
          : Array.isArray(raw?.events)
          ? raw.events
          : [];
        return list.map(normalizeEvent);
      } catch {
        try {
          const res2 = await getLeadTimeline(leadId);
          const raw2 = res2 as any;
          const list2 = Array.isArray(raw2)
            ? raw2
            : Array.isArray(raw2?.data?.data)
            ? raw2.data.data
            : Array.isArray(raw2?.data)
            ? raw2.data
            : [];
          return list2.map(normalizeEvent);
        } catch {
          return [] as ActivityEvent[];
        }
      }
    },
    enabled: !!leadId,
  });
};
