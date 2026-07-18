export interface User {
  id: string;
  firmId: string;
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface RegisterRequest {
  firmName: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface InviteStaffRequest {
  name: string;
  email: string;
  role: string;
}

export interface UpdateStaffRequest {
  id: string;
  role?: string;
  isActive?: boolean;
}

export interface GoogleLoginRequest {
  token: string;
}
