import { accountLogin, accountLogout, otpVerification, deleteSession, forgotPassword, verifyForgotPasswordOTP, resetPassword } from "@/services/api/auth";
import { useMutation } from "@tanstack/react-query";
import type { LoginCredentials, OTPVerificationCredentials, ForgotPasswordPayload, VerifyForgotOTPPayload, ResetPasswordPayload } from "@/types/user";

// ── CREATE ────────────────────────────────────────────────────────
export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginCredentials) => accountLogin(data),
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

// ── DELETE ────────────────────────────────────────────────────────
export function useLogout() {
  return useMutation({
    mutationFn: (token?: string) => accountLogout(token),
  });
}

export function useDeleteSession() {
  return useMutation({
    mutationFn: ({ sessionId, token }: { sessionId: string; token: string }) => deleteSession(sessionId, token),
  });
}

// ── PASSWORD RESET ───────────────────────────────────────────────
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordPayload) => forgotPassword(data),
  });
}

export function useVerifyForgotPasswordOTP() {
  return useMutation({
    mutationFn: (data: VerifyForgotOTPPayload) => verifyForgotPasswordOTP(data),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordPayload) => resetPassword(data),
  });
}
