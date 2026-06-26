import axios from './httpRequest';

// GET /tasks — list tasks
export const getTasks = (params?: any) => {
  console.log('[API getTasks] Params:', params);
  return axios({
    method: 'GET',
    url: `/tasks`,
    params,
  }).then(res => {
    console.log('[API getTasks] Success, tasks fetched.');
    return res;
  }).catch(err => {
    console.error('[API getTasks] Error:', err);
    throw err;
  });
};

// GET /tasks/:id — get task details
export const getTaskById = (id: string) => {
  console.log(`[API getTaskById] Fetching ID: ${id} via fallback list query`);
  return axios({
    method: 'GET',
    url: `/tasks`,
  }).then(res => {
    let tasks: any[] = [];
    if (Array.isArray(res)) {
      tasks = res;
    } else if (Array.isArray(res?.data)) {
      tasks = res.data;
    } else if (Array.isArray(res?.data?.data)) {
      tasks = res.data.data;
    }

    const task = tasks.find((t: any) => String(t.id) === String(id));
    if (task) {
      console.log('[API getTaskById] Found task details:', JSON.stringify(task, null, 2));
      return task;
    } else {
      console.warn(`[API getTaskById] Task ID ${id} not found in the list`);
      return null;
    }
  }).catch(err => {
    console.error('[API getTaskById] Error:', err);
    throw err;
  });
};

// POST /tasks — create task
export const createTask = (data: any) => {
  console.log('[API createTask] Payload sent:', JSON.stringify(data, null, 2));
  return axios({
    method: 'POST',
    url: `/tasks`,
    data,
  }).then(res => {
    console.log('[API createTask] Response received:', JSON.stringify(res?.data || res, null, 2));
    return res;
  }).catch(err => {
    console.error('[API createTask] Error:', err);
    throw err;
  });
};

// PATCH /tasks/:id — update task
export const updateTask = (id: string, data: any) => {
  console.log(`[API updateTask] ID: ${id}, Payload sent:`, JSON.stringify(data, null, 2));
  return axios({
    method: 'PATCH',
    url: `/tasks/${id}`,
    data,
  }).then(res => {
    console.log('[API updateTask] Response received:', JSON.stringify(res?.data || res, null, 2));
    return res;
  }).catch(err => {
    console.error('[API updateTask] Error:', err);
    throw err;
  });
};

// DELETE /tasks/:id — delete task
export const deleteTask = (id: string) => {
  console.log(`[API deleteTask] ID: ${id}`);
  return axios({
    method: 'DELETE',
    url: `/tasks/${id}`,
  }).then(res => {
    console.log('[API deleteTask] Success');
    return res;
  }).catch(err => {
    console.error('[API deleteTask] Error:', err);
    throw err;
  });
};
