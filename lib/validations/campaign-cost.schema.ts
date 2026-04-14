import { z } from 'zod'

export const createCampaignCostSchema = z.object({
  project_id: z.string().uuid({ message: 'Selecione um projeto' }),
  category: z.enum(['media', 'production', 'tools', 'freelancer', 'other'], {
    error: 'Selecione uma categoria',
  }),
  description: z.string().min(1, { message: 'Informe uma descrição' }),
  amount: z.preprocess(
    (v) => parseFloat(String(v)),
    z.number({ error: 'Informe o valor' }).positive({ message: 'Valor deve ser positivo' })
  ),
  date: z.string().min(1, { message: 'Informe a data' }),
})

export type CreateCampaignCostInput = z.infer<typeof createCampaignCostSchema>
