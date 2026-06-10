import axios from './httpRequest';

export const getProfile = async () => {
  const response: any = await axios({
    method: 'GET',
    url: `/users/profile`
  });
  console.log('[API getProfile] Response type:', typeof response);
  if (response && typeof response === 'object') {
    console.log('[API getProfile] Response keys:', Object.keys(response));
    console.log('[API getProfile] response.data:', JSON.stringify(response.data)?.slice(0, 200));
  }
  return response;
};

export const updateProfile = async (backendData: any) => {
  console.log('[API updateProfile] Request data:', backendData);
  const response: any = await axios({
    method: 'PATCH',
    url: `/users/profile`,
    data: backendData
  });
  console.log('[API updateProfile] Response raw data:', response?.data || response);
  return response;
};

export const uploadAvatar = async (photoUri: string): Promise<string | null> => {
  const formData = new FormData();
  formData.append('file', {
    uri: photoUri,
    name: 'avatar.jpg',
    type: 'image/jpeg',
  } as any);

  console.log('[API uploadAvatar] Request URI:', photoUri);

  const res: any = await axios({
    method: 'POST',
    url: `/files/uploads`,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  console.log('[API uploadAvatar] Response:', JSON.stringify(res));

  // Interceptor returns response.data — try all known shapes
  const url: string | null =
    (typeof res === 'string' ? res : null) ||
    res?.url ||
    res?.file_url ||
    res?.location ||
    res?.path ||
    res?.key ||
    res?.data?.url ||
    res?.data?.file_url ||
    res?.data?.location ||
    res?.data?.path ||
    res?.data?.key ||
    null;

  console.log('[API uploadAvatar] Resolved URL:', url);
  return url;
};
