export interface ResourceAllocation {
  id: string;
  firmId: string;
  userId: string;
  taskId: string;
  allocatedDate: string;
  allocatedHours: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  task?: {
    id: string;
    title: string;
    priority?: string;
    status?: string;
    dueDate?: string;
  };
}

export interface CreateResourceAllocationPayload {
  userId: string;
  taskId: string;
  allocatedDate: string;
  allocatedHours: number;
}

export interface UpdateResourceAllocationPayload {
  allocatedDate?: string;
  allocatedHours?: number;
  userId?: string;
  taskId?: string;
}
