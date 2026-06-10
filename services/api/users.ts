import axios from './httpRequest';

export const getUsers = (params?: any) => {
  return axios({
    method: 'GET',
    url: `/users`,
    params
  });
};

export const getUserDetails = (id: string) => {
  return axios({
    method: 'GET',
    url: `/users/${id}`
  });
};

export const createUser = (data: any) => {
  return axios({
    method: 'POST',
    url: `/users`,
    data
  });
};

export const updateUser = (id: string, data: any) => {
  return axios({
    method: 'PUT',
    url: `/users/${id}`,
    data
  });
};

export const deleteUser = (id: string) => {
  return axios({
    method: 'DELETE',
    url: `/users/${id}`
  });
};
