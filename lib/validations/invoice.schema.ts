import { z } from 'zod'

export const createInvoiceSchema = z.object({
  number: z.string().min(1, 'Número obrigatório'),
  title: z.string().min(2, 'Título deve ter ao menos 2 caracteres'),
  client_id: z.string().uuid('Cliente obrigatório'),
  project_id: z.string().uuid().optional().nullable(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft'),
  amount: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? 0 : Number(v)),
    z.number().min(0, 'Valor deve ser positivo')
  ),
  due_date: z.string().optional().nullable(),
  paid_at: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const updateInvoiceSchema = createInvoiceSchema.partial()

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>
