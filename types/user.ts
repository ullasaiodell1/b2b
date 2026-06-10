export interface LoginCredentials {
  identifier: string;
  password?: string;
}

export interface OTPVerificationCredentials {
  token: string;
  code: string;
}

export interface RoleAssignment {
  role: string;
  company: string;
}

export interface User {
  id: string;
  name: string;
  employee_code?: string | null;
  parent_id?: string | null;
  company_name?: string | null;
  role_assignments?: RoleAssignment[];
  email?: string;
  phone_number?: string;
}

export interface UserListResponse {
  total: number;
  data: User[];
}

export interface ApiErrorResponse {
  message: string;
  status?: number;
}
