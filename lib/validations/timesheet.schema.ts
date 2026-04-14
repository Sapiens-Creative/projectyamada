import { z } from 'zod'

export const createTimeEntrySchema = z.object({
  project_id: z.string().uuid({ message: 'Selecione um projeto' }),
  description: z.string().optional(),
  hours: z.preprocess(
    (v) => parseFloat(String(v)),
    z.number({ error: 'Informe as horas' }).positive({ message: 'Horas devem ser positivas' })
  ),
  hourly_rate: z.preprocess(
    (v) => (v === '' || v == null ? null : parseFloat(String(v))),
    z.number().positive().nullable().optional()
  ),
  date: z.string().min(1, { message: 'Informe a data' }),
})

export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>
