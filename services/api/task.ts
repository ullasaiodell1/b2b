import axios from './httpRequest';

export const getTasks = async (params?: any) => {
  console.log('[API getTasks] Request params:', params);
  const res = await axios({
    method: 'GET',
    url: `/tasks`,
    params,
  });
  console.log('[API getTasks] Response:', res);
  return res;
};

export const getTaskById = async (id: string) => {
  console.log('[API getTaskById] Request ID:', id);
  const res = await axios({
    method: 'GET',
    url: `/tasks/${id}`,
  });
  console.log('[API getTaskById] Response:', res);
  return res;
};

export const createTask = async (data: any) => {
  console.log('[API createTask] Request data:', data);
  const res = await axios({
    method: 'POST',
    url: `/tasks`,
    data,
  });
  console.log('[API createTask] Response:', res);
  return res;
};

export const updateTask = async (id: string, data: any) => {
  console.log(`[API updateTask] Request ID: ${id}, data:`, data);
  const res = await axios({
    method: 'PATCH',
    url: `/tasks/${id}`,
    data,
  });
  console.log('[API updateTask] Response:', res);
  return res;
};

export const deleteTask = async (id: string) => {
  console.log('[API deleteTask] Request ID:', id);
  const res = await axios({
    method: 'DELETE',
    url: `/tasks/${id}`,
  });
  console.log('[API deleteTask] Response:', res);
  return res;
};
