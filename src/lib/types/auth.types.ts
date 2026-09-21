export interface User {
  id: string;
  firmId: string;
  clientId?: string;
  name: string;
  email: string;
  role: string;
  customRoleId?: string;
  branchId?: string;
  phone?: string;
  profilePic?: string;
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
  customRoleId?: string;
  branchId?: string;
}

export interface UpdateStaffRequest {
  id: string;
  role?: string;
  customRoleId?: string | null;
  branchId?: string | null;
  isActive?: boolean;
}

export interface GoogleLoginRequest {
  token: string;
}

export interface MagicLinkRequest {
  email: string;
}

export interface LoginHistoryItem {
  id: string;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
  status?: string;
  failureReason?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface PaginatedLoginHistoryResponse {
  success: boolean;
  message?: string;
  data: LoginHistoryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

