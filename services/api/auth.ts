import axios from './httpRequest';

// POST /auth/login — account login
export const accountLogin = (data: any) => {
  return axios({
    method: 'POST',
    url: `/auth/login`,
    data
  });
};

// DELETE /auth/logout — account logout
export const accountLogout = (token?: string) => {
  return axios({
    method: 'DELETE',
    url: `/auth/logout`,
    headers: token ? { Authorization: token } : undefined
  });
};

// POST /auth/verify-login — OTP verification
export const otpVerification = (data: any) => {
  return axios({
    method: 'POST',
    url: `/auth/verify-login`,
    data
  });
};

// GET /auth/me — get current user
export const getCurrentUser = () => {
  return axios({
    method: 'GET',
    url: `/auth/me`
  });
};

// PUT /auth/session — update auth session
export const updateAuthSession = (data: any) => {
  return axios({
    method: 'PUT',
    url: `/auth/session`,
    data
  });
};

// DELETE /auth/sessions/:sessionId — delete session
export const deleteSession = (sessionId: string, token: string) => {
  return axios({
    method: 'DELETE',
    url: `/auth/sessions/${sessionId}`,
    headers: { Authorization: token }
  });
};
// POST /auth/forgot-password — request OTP for password reset
export const forgotPassword = (data: { identifier: string }) => {
  return axios({
    method: 'POST',
    url: `/auth/forgot-password`,
    data
  });
};

// POST /auth/verify-forgot-otp — verify OTP for password reset
export const verifyForgotPasswordOTP = (data: { identifier: string; otp: string }) => {
  return axios({
    method: 'POST',
    url: `/auth/verify-forgot-otp`,
    data
  });
};

// POST /auth/reset-password — set new password
export const resetPassword = (data: { identifier: string; otp: string; new_password: string }) => {
  return axios({
    method: 'POST',
    url: `/auth/reset-password`,
    data
  });
};
