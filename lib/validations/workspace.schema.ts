import { z } from 'zod'

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(50),
  slug: z
    .string()
    .min(2, 'Slug deve ter no mínimo 2 caracteres')
    .max(30)
    .regex(/^[a-z0-9-]+$/, 'Slug pode conter apenas letras minúsculas, números e hífens'),
})

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>
