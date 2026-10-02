export interface StaffShift {
  id: string;
  firmId: string;
  name: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "18:00"
  gracePeriodMinutes: number;
  halfDayThresholdMinutes: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffShiftRequest {
  name: string;
  startTime: string;
  endTime: string;
  gracePeriodMinutes?: number;
  halfDayThresholdMinutes?: number;
  isDefault?: boolean;
}

export interface UpdateStaffShiftRequest extends Partial<CreateStaffShiftRequest> {}

export type LeaveType = 'SICK' | 'CASUAL' | 'EARNED';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequest {
  id: string;
  firmId: string;
  userId: string;
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  reason: string;
  status: LeaveStatus;
  approvedByUserId?: string | null;
  rejectionReason?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  approvedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveRequestPayload {
  userId?: string;
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  reason: string;
}

export interface UpdateLeaveRequestPayload {
  status?: LeaveStatus;
  rejectionReason?: string;
  approvedByUserId?: string;
  reason?: string;
  startDate?: string;
  endDate?: string;
}
