export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TicketClientRelation {
  id: string;
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
}

export interface TicketAssignedToRelation {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface Ticket {
  id: string;
  firmId: string;
  clientId: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedToId?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: TicketClientRelation;
  assignedTo?: TicketAssignedToRelation | null;
}

export interface TicketReply {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'CLIENT' | 'STAFF';
  message: string;
  attachmentUrl?: string | null;
  createdAt: string;
}

export interface CreateTicketRequest {
  clientId?: string;
  subject: string;
  description: string;
  priority: TicketPriority;
}

export interface UpdateTicketRequest {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedToId?: string | null;
}

export interface AddReplyRequest {
  message: string;
  attachmentUrl?: string;
}

export interface GetTicketsParams {
  page?: number;
  limit?: number;
  clientId?: string;
  assignedToId?: string;
  status?: TicketStatus | string;
  priority?: TicketPriority | string;
}

export interface PaginatedTicketsResponse {
  success: boolean;
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
  message?: string;
}

export interface TicketResponse {
  success: boolean;
  data: Ticket;
  message?: string;
}

export interface TicketRepliesResponse {
  success: boolean;
  data: TicketReply[];
  message?: string;
}

export interface TicketReplyResponse {
  success: boolean;
  data: TicketReply;
  message?: string;
}
