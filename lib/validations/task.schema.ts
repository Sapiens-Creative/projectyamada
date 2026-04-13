import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Título deve ter ao menos 2 caracteres'),
  description: z.string().optional(),
  status: z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  project_id: z.string().uuid().optional().nullable(),
  client_id: z.string().uuid().optional().nullable(),
  assignee_id: z.string().uuid().optional().nullable(),
  due_date: z.string().optional().nullable(),
})

export const updateTaskSchema = createTaskSchema.partial()

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
