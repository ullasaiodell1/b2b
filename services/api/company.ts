import axios from './httpRequest';

// GET /companies — get companies list
export const getCompanies = (params?: any) => {
  return axios({
    method: 'GET',
    url: `/companies`,
    params
  });
};

// GET /companies/:id — get company details
export const getCompanyDetails = (id: string) => {
  return axios({
    method: 'GET',
    url: `/companies/${id}`
  });
};

// POST /companies — create company
export const createCompany = (data: any) => {
  return axios({
    method: 'POST',
    url: `/companies`,
    data
  });
};

// PUT /companies/:id — update company
export const updateCompany = (id: string, data: any) => {
  return axios({
    method: 'PUT',
    url: `/companies/${id}`,
    data
  });
};

// DELETE /companies/:id — delete company
export const deleteCompany = (id: string) => {
  return axios({
    method: 'DELETE',
    url: `/companies/${id}`
  });
};

// GET /companies/:companyId/accounts — get company accounts
export const getCompanyAccounts = (companyId: string) => {
  return axios({
    method: 'GET',
    url: `/companies/${companyId}/accounts`
  });
};


