import { ProfileData } from '../types/profile';
export { ProfileData };

export let profileData: ProfileData = {
  fullName: '',
  mobile: '',
  dob: '',
  email: '',
  gender: 'Male',
  gstNo: '',
  panNo: '',
  address: '',
  photoUri: null,
};

const listeners = new Set<() => void>();

export function subscribeToProfile(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function updateProfileData(newData: Partial<ProfileData>) {
  profileData = { ...profileData, ...newData };
  listeners.forEach((l) => l());
}
