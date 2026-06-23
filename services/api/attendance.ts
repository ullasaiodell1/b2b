import axios from './httpRequest';

// GET /users/attendance — get today's attendance status/summary
export const getAttendanceStatus = async (params: { user_id: string; startDate: string; endDate: string }) => {
  console.log('[API getAttendanceStatus] Fetching today\'s attendance status for params:', params);
  try {
    const response = await axios({
      method: 'GET',
      url: `/users/attendance`,
      params,
    });
    console.log('[API getAttendanceStatus] Successful response:', response);
    return response;
  } catch (error) {
    console.error('[API getAttendanceStatus] Error:', error);
    throw error;
  }
};

// GET /users/attendance — get attendance history list
export const getAttendanceHistory = async (params?: {
  month?: number;
  year?: number;
  user_id?: string;
  attendance_status?: string;
}) => {
  console.log('[API getAttendanceHistory] Fetching history for params:', params);
  const queryParams: any = {};
  if (params?.user_id) {
    queryParams.user_id = params.user_id;
  }
  if (params?.attendance_status) {
    queryParams.attendance_status = params.attendance_status;
  }
  if (params?.month && params?.year) {
    const { month, year } = params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // last day of month

    const pad = (n: number) => String(n).padStart(2, '0');
    queryParams.startDate = `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}-${pad(startDate.getDate())}`;
    queryParams.endDate = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}`;
  }
  console.log('[API getAttendanceHistory] Converted query parameters:', queryParams);
  try {
    const response = await axios({
      method: 'GET',
      url: `/users/attendance`,
      params: queryParams,
    });
    console.log('[API getAttendanceHistory] Successful response:', response);
    return response;
  } catch (error) {
    console.error('[API getAttendanceHistory] Error:', error);
    throw error;
  }
};

// POST /users/attendance/check-in — punch in with selfie image
export const punchIn = async (data: { checkin_image: string; latitude: number; longitude: number }) => {
  console.log('[API punchIn] Calling check-in with data:', data);
  try {
    const response = await axios({
      method: 'POST',
      url: `/users/attendance/check-in`,
      data: {
        checkin_latitude: data.latitude,
        checkin_longitude: data.longitude,
        checkin_image: data.checkin_image,
      },
    });
    console.log('[API punchIn] Successful response:', response);
    return response;
  } catch (error) {
    console.error('[API punchIn] Error:', error);
    throw error;
  }
};

// PATCH /users/attendance/check-out — punch out with selfie image
export const punchOut = async (data: { checkout_image: string; latitude: number; longitude: number }) => {
  console.log('[API punchOut] Calling check-out with data:', data);
  try {
    const response = await axios({
      method: 'PATCH',
      url: `/users/attendance/check-out`,
      data: {
        checkout_latitude: data.latitude,
        checkout_longitude: data.longitude,
        checkout_image: data.checkout_image,
      },
    });
    console.log('[API punchOut] Successful response:', response);
    return response;
  } catch (error) {
    console.error('[API punchOut] Error:', error);
    throw error;
  }
};
