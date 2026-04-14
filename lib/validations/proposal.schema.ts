import { z } from 'zod'

export const createProposalSchema = z.object({
  title: z.string().min(2, 'Título deve ter no mínimo 2 caracteres').max(200),
  lead_id: z.string().uuid().optional().nullable(),
  client_id: z.string().uuid().optional().nullable(),
  status: z.enum(['draft','sent','accepted','rejected','expired']).default('draft'),
  valid_until: z.string().optional().or(z.literal('')),
  total_value: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().nullable().optional()
  ),
  notes: z.string().optional().or(z.literal('')),
})

export const updateProposalSchema = createProposalSchema.partial()

export type CreateProposalInput = z.infer<typeof createProposalSchema>
export type UpdateProposalInput = z.infer<typeof updateProposalSchema>
