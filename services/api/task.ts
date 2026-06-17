import axios from './httpRequest';

// GET /tasks — list tasks
export const getTasks = (params?: any) => {
  return axios({
    method: 'GET',
    url: `/tasks`,
    params,
  });
};

// GET /tasks/:id — get task details
export const getTaskById = (id: string) => {
  return axios({
    method: 'GET',
    url: `/tasks/${id}`,
  });
};

// POST /tasks — create task
export const createTask = (data: any) => {
  return axios({
    method: 'POST',
    url: `/tasks`,
    data,
  });
};

// PATCH /tasks/:id — update task
export const updateTask = (id: string, data: any) => {
  return axios({
    method: 'PATCH',
    url: `/tasks/${id}`,
    data,
  });
};

// DELETE /tasks/:id — delete task
export const deleteTask = (id: string) => {
  return axios({
    method: 'DELETE',
    url: `/tasks/${id}`,
  });
};

