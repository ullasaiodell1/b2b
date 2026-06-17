import axios from './httpRequest';

// GET /users/profile — get user profile
export const getProfile = () => {
  return axios({
    method: 'GET',
    url: `/users/profile`
  });
};

// PATCH /users/profile — update user profile
export const updateProfile = (backendData: any) => {
  return axios({
    method: 'PATCH',
    url: `/users/profile`,
    data: backendData
  });
};

