import { accountLogin, accountLogout, otpVerification } from "@/services/api/auth";
import { useMutation } from "@tanstack/react-query";
import type { LoginCredentials, OTPVerificationCredentials } from "@/types/user";

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginCredentials) => accountLogin(data),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => accountLogout(),
  });
}

export function useOTPVerification() {
  return useMutation({
    mutationFn: (data: OTPVerificationCredentials) => otpVerification(data),
  });
}

export function useResendOTP() {
  return useMutation({
    mutationFn: (data: LoginCredentials) => accountLogin(data),
  });
}
