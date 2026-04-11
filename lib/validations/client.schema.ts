import { z } from 'zod'

export const createClientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Slug pode conter apenas letras minúsculas, números e hífens'),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  industry: z.string().optional(),
  status: z.enum(['lead', 'active', 'paused', 'churned']).default('lead'),
  tier: z.enum(['basic', 'standard', 'premium', 'enterprise']).default('standard'),
  primary_color: z.string().optional(),
  notes: z.string().optional(),
})

export const updateClientSchema = createClientSchema.partial()

export const createContactSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  role: z.string().optional(),
  is_primary: z.boolean().default(false),
})

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type CreateContactInput = z.infer<typeof createContactSchema>
