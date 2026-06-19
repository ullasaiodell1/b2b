import axios from './httpRequest';

// GET /leads/:leadId/ledger — list ledger entries for a lead
export const getLeadLedger = (leadId: string, params?: any) => {
  return axios({
    method: 'GET',
    url: `/leads/${leadId}/ledger`,
    params,
  });
};

// GET /ledger — list all ledger entries (fallback/alternative)
export const getLedger = (params?: any) => {
  return axios({
    method: 'GET',
    url: `/ledger`,
    params,
  });
};
