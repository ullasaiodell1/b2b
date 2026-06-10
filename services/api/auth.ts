import axios from './httpRequest';

export const accountLogin = (data: any) => {
  console.log('[Auth API Request] accountLogin (POST /auth/login) - Payload:', JSON.stringify(data, null, 2));
  return axios({
    method: 'POST',
    url: `/auth/login`,
    data
  })
    .then((res) => {
      console.log('[Auth API Response] accountLogin (POST /auth/login) - Success:', JSON.stringify(res, null, 2));
      return res;
    })
    .catch((err) => {
      console.error('[Auth API Error] accountLogin (POST /auth/login) - Error:', JSON.stringify(err, null, 2));
      throw err;
    });
};

export const accountLogout = () => {
  console.log('[Auth API Request] accountLogout (DELETE /auth/logout)');
  return axios({
    method: 'DELETE',
    url: `/auth/logout`
  })
    .then((res) => {
      console.log('[Auth API Response] accountLogout (DELETE /auth/logout) - Success:', JSON.stringify(res, null, 2));
      return res;
    })
    .catch((err) => {
      console.error('[Auth API Error] accountLogout (DELETE /auth/logout) - Error:', JSON.stringify(err, null, 2));
      throw err;
    });
};

export const otpVerification = (data: any) => {
  console.log('[Auth API Request] otpVerification (POST /auth/verify-login) - Payload:', JSON.stringify(data, null, 2));
  return axios({
    method: 'POST',
    url: `/auth/verify-login`,
    data
  })
    .then((res) => {
      console.log('[Auth API Response] otpVerification (POST /auth/verify-login) - Success:', JSON.stringify(res, null, 2));
      return res;
    })
    .catch((err) => {
      console.error('[Auth API Error] otpVerification (POST /auth/verify-login) - Error:', JSON.stringify(err, null, 2));
      throw err;
    });
};

export const getCurrentUser = () => {
  console.log('[Auth API Request] getCurrentUser (GET /auth/me)');
  return axios({
    method: 'GET',
    url: `/auth/me`
  })
    .then((res) => {
      console.log('[Auth API Response] getCurrentUser (GET /auth/me) - Success:', JSON.stringify(res, null, 2));
      return res;
    })
    .catch((err) => {
      console.error('[Auth API Error] getCurrentUser (GET /auth/me) - Error:', JSON.stringify(err, null, 2));
      throw err;
    });
};

export const updateAuthSession = (data: any) => {
  console.log('[Auth API Request] updateAuthSession (PUT /auth/session) - Payload:', JSON.stringify(data, null, 2));
  return axios({
    method: 'PUT',
    url: `/auth/session`,
    data
  })
    .then((res) => {
      console.log('[Auth API Response] updateAuthSession (PUT /auth/session) - Success:', JSON.stringify(res, null, 2));
      return res;
    })
    .catch((err) => {
      console.error('[Auth API Error] updateAuthSession (PUT /auth/session) - Error:', JSON.stringify(err, null, 2));
      throw err;
    });
};


