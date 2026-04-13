import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug: apenas letras minúsculas, números e hífens'),
  description: z.string().optional(),
  client_id: z.string().uuid().optional().nullable(),
  status: z.enum(['planning', 'active', 'paused', 'completed', 'cancelled']).default('planning'),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  budget: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().nullable().optional()
  ),
})

export const updateProjectSchema = createProjectSchema.partial()

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
