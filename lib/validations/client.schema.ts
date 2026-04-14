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
  // CRM Avançado
  cnpj: z.string().optional().or(z.literal('')),
  razao_social: z.string().optional().or(z.literal('')),
  revenue_range: z.enum(['<100k', '100k-500k', '500k-2m', '>2m']).optional().nullable(),
  address_city: z.string().optional().or(z.literal('')),
  address_state: z.string().optional().or(z.literal('')),
  contract_start: z.string().optional().or(z.literal('')),
  contract_renewal: z.string().optional().or(z.literal('')),
  monthly_fee: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().nullable().optional()
  ),
  tags: z.string().optional(), // comma-separated string from form, parsed in action
})

export const updateClientSchema = createClientSchema.partial()

export const createContactSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  role: z.string().optional(),
  is_primary: z.boolean().default(false),
})

export const createInteractionSchema = z.object({
  type: z.enum(['email', 'call', 'meeting', 'whatsapp', 'note', 'recording']),
  title: z.string().min(2, 'Título deve ter no mínimo 2 caracteres').max(200),
  description: z.string().optional().or(z.literal('')),
  occurred_at: z.string().optional(),
})

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type CreateContactInput = z.infer<typeof createContactSchema>
export type CreateInteractionInput = z.infer<typeof createInteractionSchema>
