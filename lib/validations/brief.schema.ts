import { z } from 'zod'

export const upsertBriefSchema = z.object({
  objective: z.string().optional().or(z.literal('')),
  target_audience: z.string().optional().or(z.literal('')),
  channels: z.string().optional(), // comma-separated → parsed to array in action
  budget_total: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().nullable().optional()
  ),
  budget_media: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().nullable().optional()
  ),
  start_date: z.string().optional().or(z.literal('')),
  end_date: z.string().optional().or(z.literal('')),
  strategy: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

export type UpsertBriefInput = z.infer<typeof upsertBriefSchema>
