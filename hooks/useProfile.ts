import { ProfileData, profileData, subscribeToProfile, updateProfileData } from '@/components/ProfileState';
import { getProfile, updateProfile } from '@/services/api/profile';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export const profileKeys = {
  all: ["userProfile"] as const,
  lists: () => [...profileKeys.all, 'list'] as const,
  list: () => [...profileKeys.lists()] as const,
};

export function useProfile() {
  const queryClient = useQueryClient();
  const [localProfile, setLocalProfile] = useState<ProfileData>(profileData);

  // Sync state with ProfileState pub/sub
  useEffect(() => {
    return subscribeToProfile(() => {
      setLocalProfile({ ...profileData });
    });
  }, []);

  // Fetch profile via React Query
  // Backend GET /users/profile returns: { data: { ...user, allocations } }
  // httpRequest interceptor unwraps response.data → res = JSON body
  // So res = { data: { ...user } } and res.data is the user object itself
  const profileQuery = useQuery({
    queryKey: profileKeys.list(),
    queryFn: async (): Promise<ProfileData> => {
      const response = await getProfile();
      console.log('[useProfile] Raw response:', JSON.stringify(response));

      // After axios interceptor: response = { data: { ...user, allocations } }
      // So user = response.data
      const user = response?.data || response || {};

      console.log('[useProfile] User object:', JSON.stringify(user));
      console.log('[useProfile] image_url field:', user.image_url);

      const mapped: ProfileData = {
        fullName: user.name || '',
        mobile: user.phone_number || '',
        // Normalize dob: backend may return "YYYY-MM-DD" or "Month D, YYYY"
        dob: user.date_of_birth || '',
        email: user.personal_email || user.email || '',
        gender: user.gender
          ? (user.gender.charAt(0).toUpperCase() + user.gender.slice(1)) as 'Male' | 'Female'
          : 'Male',
        gstNo: user.gst_number || '',
        panNo: user.pan_number || '',
        address: user.address || '',
        photoUri: user.image_url || null,
      };

      console.log('[useProfile] Mapped profile:', mapped);
      return mapped;
    },
  });

  // Whenever query succeeds, sync with ProfileState
  useEffect(() => {
    if (profileQuery.data) {
      console.log('[useProfile] Query success data:', profileQuery.data);
      updateProfileData(profileQuery.data);
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (profileQuery.isError) {
      console.error('[useProfile] Query error:', profileQuery.error);
    }
  }, [profileQuery.isError, profileQuery.error]);

  // Mutation for updating profile
  // Backend PATCH /users/profile returns: { data: { id, name, email } } — only partial fields
  // So after a successful update we invalidate and let the GET query refetch full profile data
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<ProfileData>): Promise<Partial<ProfileData>> => {
      const backendData: any = {};
      if (data.fullName !== undefined) backendData.name = data.fullName;
      if (data.mobile !== undefined) backendData.phone_number = data.mobile;
      if (data.dob !== undefined) backendData.date_of_birth = data.dob;
      if (data.email !== undefined) backendData.personal_email = data.email;
      if (data.email !== undefined) backendData.email = data.email;
      if (data.gender !== undefined) backendData.gender = data.gender.toLowerCase();
      if (data.gstNo !== undefined) backendData.gst_number = data.gstNo;
      if (data.panNo !== undefined) backendData.pan_number = data.panNo;
      if (data.address !== undefined) backendData.address = data.address;
      if (data.photoUri !== undefined) backendData.image_url = data.photoUri;

      console.log('[useProfile] updateMutation payload:', backendData);
      await updateProfile(backendData);

      // Return the original data so onSuccess can use it for optimistic update
      return data;
    },
    onSuccess: (updatedData) => {
      // Optimistically merge the new values into the cached profile immediately
      queryClient.setQueryData<ProfileData>(profileKeys.list(), (old) => {
        if (!old) return old;
        return { ...old, ...updatedData };
      });
      // Also update the global ProfileState so all subscribers see the new image
      const current = queryClient.getQueryData<ProfileData>(profileKeys.list());
      if (current) updateProfileData(current);
      // Then invalidate so we eventually get the authoritative server data
      queryClient.invalidateQueries({ queryKey: profileKeys.lists() });
    },
  });

  // Use query data directly if available, fall back to local pub/sub state
  const profile = profileQuery.data || localProfile;

  return {
    profile,
    isLoading: profileQuery.isLoading,
    isFetching: profileQuery.isFetching,
    isError: profileQuery.isError,
    refetch: profileQuery.refetch,
    updateProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
