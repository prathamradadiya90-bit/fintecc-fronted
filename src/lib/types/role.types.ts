export interface CustomRole {
  id: string;
  firmId: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface RoleResponse {
  success: boolean;
  data: CustomRole;
  message?: string;
}

export interface RolesListResponse {
  success: boolean;
  data: CustomRole[];
  message?: string;
}

export const AVAILABLE_PERMISSIONS: { group: string; permissions: { id: string; label: string; description: string }[] }[] = [
  {
    group: 'Client Management',
    permissions: [
      { id: 'clients:read', label: 'View Clients', description: 'Access and view client directory and profiles' },
      { id: 'clients:write', label: 'Create & Edit Clients', description: 'Add new clients and modify client information' },
      { id: 'clients:delete', label: 'Delete Clients', description: 'Remove clients from the system' },
    ],
  },
  {
    group: 'Work & Tasks',
    permissions: [
      { id: 'tasks:read', label: 'View Tasks', description: 'View assigned and firm-wide task board' },
      { id: 'tasks:write', label: 'Manage Tasks', description: 'Create, assign, update, and close work tasks' },
      { id: 'tasks:delete', label: 'Delete Tasks', description: 'Delete tasks from the board' },
    ],
  },
  {
    group: 'Invoices & Billing',
    permissions: [
      { id: 'invoices:read', label: 'View Invoices', description: 'Browse and view generated invoices' },
      { id: 'invoices:write', label: 'Create Invoices', description: 'Generate, send, and update invoices' },
      { id: 'invoices:delete', label: 'Delete Invoices', description: 'Void or remove invoices' },
    ],
  },
  {
    group: 'Compliance (GST & ITR)',
    permissions: [
      { id: 'gst:read', label: 'View GST Compliance', description: 'Inspect returns, 2B/2A reconciliations' },
      { id: 'gst:write', label: 'Manage GST Filing', description: 'Execute GST reconciliations and filings' },
      { id: 'itr:read', label: 'View ITR Status', description: 'View tax computation and e-filing status' },
      { id: 'itr:write', label: 'Manage ITR Filing', description: 'Compute taxes and update e-filing records' },
    ],
  },
  {
    group: 'Banking & Financials',
    permissions: [
      { id: 'bank_statements:read', label: 'View Bank Statements', description: 'View parsed banking records' },
      { id: 'bank_statements:write', label: 'Upload & Parse Statements', description: 'Process PDF/Excel bank statements' },
      { id: 'tally:sync', label: 'Tally Synchronization', description: 'Export and push ledgers to Tally ERP/Prime' },
    ],
  },
  {
    group: 'Support & Helpdesk',
    permissions: [
      { id: 'helpdesk:read', label: 'View Tickets', description: 'View helpdesk tickets and conversations' },
      { id: 'helpdesk:write', label: 'Manage Tickets', description: 'Update status, assign tickets, and reply' },
    ],
  },
];
