export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LEAVE' | 'HALFDAY';

export interface AttendanceRecord {
  id: string;
  firmId: string;
  userId: string;
  date: string;
  status: AttendanceStatus;
  checkIn?: string | null;
  checkOut?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface PaginatedAttendanceResponse {
  success: boolean;
  message?: string;
  data: AttendanceRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AttendanceResponse {
  success: boolean;
  message?: string;
  data: AttendanceRecord;
}

export interface CreateAttendanceRequest {
  userId: string;
  date: string;
  status: AttendanceStatus;
  checkIn?: string | null;
  checkOut?: string | null;
}

export type UpdateAttendanceRequest = Partial<CreateAttendanceRequest>;

export interface GetAttendanceParams {
  page?: number;
  limit?: number;
  date?: string;
  userId?: string;
}
