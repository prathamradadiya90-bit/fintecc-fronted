import { z } from 'zod';

export const createTaskSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  assigneeId: z.string().optional().nullable(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  complianceType: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'REVIEW', 'DONE', 'PENDING_APPROVAL']),
  description: z.string().optional().nullable(),
  isRecurring: z.boolean().optional(),
  recurrencePattern: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const bulkUpdateTasksSchema = z.object({
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'REVIEW', 'DONE', 'PENDING_APPROVAL']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().optional().nullable(),
  complianceType: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;
export type BulkUpdateTasksFormData = z.infer<typeof bulkUpdateTasksSchema>;
