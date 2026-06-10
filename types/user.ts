export interface LoginCredentials {
  identifier: string;
  password?: string;
}

export interface OTPVerificationCredentials {
  token: string;
  code: string;
}
