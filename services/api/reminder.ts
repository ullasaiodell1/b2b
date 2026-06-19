import axios from './httpRequest';

// GET /leads/:leadId/reminders  OR  /reminders (global)
export const getReminders = (params?: any) => {
  const { leadId, ...rest } = params || {};
  if (leadId) {
    return axios({
      method: 'GET',
      url: `/leads/${leadId}/reminders`,
      params: { limit: 10, offset: 0, ...rest },
    });
  }
  // Global list — confirmed working at /api/reminders
  return axios({
    method: 'GET',
    url: `/reminders`,
    params: { limit: 50, offset: 0, ...rest },
  });
};

// GET /leads/:leadId/reminders/:id — get reminder details
export const getReminderById = (id: string, leadId?: string) => {
  if (leadId) {
    return axios({
      method: 'GET',
      url: `/leads/${leadId}/reminders/${id}`,
    });
  }
  return axios({
    method: 'GET',
    url: `/leads/reminders/${id}`,
  });
};

// POST /leads/:leadId/reminders — create reminder
// Backend accepts: { title, description, remind_at, lead_id }
export const createReminder = (data: any) => {
  const { lead_id, remind_date, reminder_date, reminder_time, remind_time_extra, ...rest } = data;
  if (!lead_id) throw new Error('lead_id is required to create a reminder');
  return axios({
    method: 'POST',
    url: `/leads/${lead_id}/reminders`,
    data: rest,
  });
};

// PATCH /leads/:leadId/reminders/:id — update reminder
// Backend accepts: { title, description, remind_at, lead_id }
export const updateReminder = (id: string, data: any) => {
  const { lead_id, remind_date, reminder_date, reminder_time, remind_time_extra, ...rest } = data;
  if (!lead_id) throw new Error('lead_id is required to update a reminder');
  return axios({
    method: 'PATCH',
    url: `/leads/${lead_id}/reminders/${id}`,
    data: rest,
  });
};

// DELETE /leads/:leadId/reminders/:id — delete reminder
export const deleteReminder = (id: string, leadId: string) => {
  return axios({
    method: 'DELETE',
    url: `/leads/${leadId}/reminders/${id}`,
  });
};
