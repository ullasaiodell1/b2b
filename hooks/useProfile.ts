import { getProfile, updateProfile } from '@/services/api/profile';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const profileKeys = {
  all: ["userProfile"] as const,
  lists: () => [...profileKeys.all, 'list'] as const,
  list: () => [...profileKeys.lists()] as const,
};

// ── READ / UPDATE ──────────────────────────────────────────────────
export function useProfile() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: profileKeys.list(),
    queryFn: async () => {
      const response = await getProfile();
      return response?.data || response || {};
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (backendData: any) => {
      await updateProfile(backendData);
      return backendData;
    },
    onSuccess: (updatedData) => {
      queryClient.setQueryData(profileKeys.list(), (old: any) => {
        if (!old) return old;
        return { ...old, ...updatedData };
      });
      queryClient.invalidateQueries({ queryKey: profileKeys.lists() });
    },
  });

  return {
    profile: profileQuery.data,
    ...profileQuery,
    updateProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
