import axios from './httpRequest';

export const getUsers = async (params?: any) => {
  console.log('[API getUsers] Request params:', params);
  const res = await axios({
    method: 'GET',
    url: `/users`,
    params
  });
  console.log('[API getUsers] Response:', res);
  return res;
};

export const listUsers = async (params?: any) => {
  console.log('[API listUsers] Request params:', params);
  const res = await axios({
    method: 'GET',
    url: `/users`,
    params
  });
  console.log('[API listUsers] Response:', res);
  return res;
};

export const getUserDetails = async (id: string) => {
  console.log('[API getUserDetails] Request ID:', id);
  const res = await axios({
    method: 'GET',
    url: `/users/${id}`
  });
  console.log('[API getUserDetails] Response:', res);
  return res;
};

export const createUser = async (data: any) => {
  console.log('[API createUser] Request data:', data);
  const res = await axios({
    method: 'POST',
    url: `/users`,
    data
  });
  console.log('[API createUser] Response:', res);
  return res;
};

export const updateUser = async (id: string, data: any) => {
  console.log(`[API updateUser] Request ID: ${id}, data:`, data);
  const res = await axios({
    method: 'PUT',
    url: `/users/${id}`,
    data
  });
  console.log(`[API updateUser] Response:`, res);
  return res;
};

export const deleteUser = async (id: string) => {
  console.log('[API deleteUser] Request ID:', id);
  const res = await axios({
    method: 'DELETE',
    url: `/users/${id}`
  });
  console.log('[API deleteUser] Response:', res);
  return res;
};
