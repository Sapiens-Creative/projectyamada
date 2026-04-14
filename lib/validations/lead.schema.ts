import { z } from 'zod'

export const createLeadSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  contact_name: z.string().optional().or(z.literal('')),
  contact_email: z.string().email('Email inválido').optional().or(z.literal('')),
  contact_phone: z.string().optional().or(z.literal('')),
  source: z.enum(['site','landing_page','referral','linkedin','facebook','event','cold','other']).optional().nullable(),
  stage: z.enum(['new','contacted','proposal','negotiation','won','lost']).default('new'),
  estimated_value: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().nullable().optional()
  ),
  notes: z.string().optional().or(z.literal('')),
  assigned_to: z.string().uuid().optional().nullable(),
})

export const updateLeadSchema = createLeadSchema.partial()

export type CreateLeadInput = z.infer<typeof createLeadSchema>
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>
