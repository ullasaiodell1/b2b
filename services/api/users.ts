import axios from './httpRequest';

// GET /users — list users
export const getUsers = (params?: any) => {
  return axios({
    method: 'GET',
    url: `/users`,
    params
  });
};

// GET /users — list users (alias)
export const listUsers = (params?: any) => {
  return axios({
    method: 'GET',
    url: `/users`,
    params
  });
};

// GET /users/:id — get user details
export const getUserDetails = (id: string) => {
  return axios({
    method: 'GET',
    url: `/users/${id}`
  });
};

// POST /users — create user
export const createUser = (data: any) => {
  return axios({
    method: 'POST',
    url: `/users`,
    data
  });
};

// PUT /users/:id — update user
export const updateUser = (id: string, data: any) => {
  return axios({
    method: 'PUT',
    url: `/users/${id}`,
    data
  });
};

// DELETE /users/:id — delete user
export const deleteUser = (id: string) => {
  return axios({
    method: 'DELETE',
    url: `/users/${id}`
  });
};

