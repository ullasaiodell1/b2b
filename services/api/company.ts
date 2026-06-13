import axios from './httpRequest';

export const getCompanies = async (params?: any) => {
  console.log('[API getCompanies] Request params:', params);
  const res = await axios({
    method: 'GET',
    url: `/companies`,
    params
  });
  console.log('[API getCompanies] Response:', res?.data || res);
  return res;
};

export const getCompanyDetails = async (id: string) => {
  const res = await axios({
    method: 'GET',
    url: `/companies/${id}`
  });
  console.log(`[API getCompanyDetails] ID: ${id} Response:`, res?.data || res);
  return res;
};

export const createCompany = async (data: any) => {
  console.log('[API createCompany] Request:', data);
  const res = await axios({
    method: 'POST',
    url: `/companies`,
    data
  });
  console.log('[API createCompany] Response:', res?.data || res);
  return res;
};

export const updateCompany = async (id: string, data: any) => {
  console.log(`[API updateCompany] ID: ${id} Request:`, data);
  const res = await axios({
    method: 'PUT',
    url: `/companies/${id}`,
    data
  });
  console.log(`[API updateCompany] ID: ${id} Response:`, res?.data || res);
  return res;
};

export const deleteCompany = async (id: string) => {
  const res = await axios({
    method: 'DELETE',
    url: `/companies/${id}`
  });
  console.log(`[API deleteCompany] ID: ${id} Response:`, res?.data || res);
  return res;
};

export const getCompanyAccounts = async (companyId: string) => {
  const res = await axios({
    method: 'GET',
    url: `/companies/${companyId}/accounts`
  });
  console.log(`[API getCompanyAccounts] ID: ${companyId} Response:`, res?.data || res);
  return res;
};

