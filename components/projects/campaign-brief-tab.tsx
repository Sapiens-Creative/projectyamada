'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save, Target, Users, BarChart2, DollarSign, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { upsertBriefAction } from '@/lib/actions/brief.actions'
import type { CampaignBrief } from '@/types/app.types'

const CHANNELS_OPTIONS = [
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'meta', label: 'Meta (FB/IG)' },
  { value: 'tiktok', label: 'TikTok Ads' },
  { value: 'linkedin', label: 'LinkedIn Ads' },
  { value: 'email', label: 'E-mail marketing' },
  { value: 'seo', label: 'SEO' },
  { value: 'content', label: 'Conteúdo orgânico' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'influencer', label: 'Influenciadores' },
]

interface CampaignBriefTabProps {
  brief: CampaignBrief | null
  projectId: string
  workspaceId: string
  workspaceSlug: string
}

export function CampaignBriefTab({ brief, projectId, workspaceId, workspaceSlug }: CampaignBriefTabProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const [channels, setChannels] = useState<string[]>(brief?.channels ?? [])

  function toggleChannel(ch: string) {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    )
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('channels', channels.join(','))
    startTransition(async () => {
      const result = await upsertBriefAction(projectId, workspaceId, workspaceSlug, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Brief salvo')
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Objective */}
      <div className="card-sun rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-[#ff5600]" />
          <h3 className="text-sm font-medium text-white/70">Objetivo da campanha</h3>
        </div>
        <Textarea
          name="objective"
          rows={3}
          placeholder="O que queremos alcançar? (ex: aumentar vendas em 30%, gerar 500 leads qualificados...)"
          defaultValue={brief?.objective ?? ''}
          className="bg-transparent border-white/10 resize-none"
        />
      </div>

      {/* Target audience */}
      <div className="card-sun rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-purple-400" />
          <h3 className="text-sm font-medium text-white/70">Público-alvo</h3>
        </div>
        <Textarea
          name="target_audience"
          rows={3}
          placeholder="Descreva o público: idade, gênero, interesses, cargo, localização, comportamento..."
          defaultValue={brief?.target_audience ?? ''}
          className="bg-transparent border-white/10 resize-none"
        />
      </div>

      {/* Channels */}
      <div className="card-sun rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-medium text-white/70">Canais</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {CHANNELS_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleChannel(value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                channels.includes(value)
                  ? 'bg-[#ff5600]/20 text-[#ff5600] border-[#ff5600]/30'
                  : 'bg-white/[0.04] text-white/50 border-white/10 hover:border-white/20 hover:text-white/70'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="card-sun rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-medium text-white/70">Orçamento</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-white/50">Total (R$)</Label>
            <Input name="budget_total" type="number" step="0.01" defaultValue={brief?.budget_total ?? ''} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/50">Mídia paga (R$)</Label>
            <Input name="budget_media" type="number" step="0.01" defaultValue={brief?.budget_media ?? ''} />
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="card-sun rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-medium text-white/70">Período da campanha</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-white/50">Início</Label>
            <Input name="start_date" type="date" defaultValue={brief?.start_date ?? ''} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/50">Término</Label>
            <Input name="end_date" type="date" defaultValue={brief?.end_date ?? ''} />
          </div>
        </div>
      </div>

      {/* Strategy */}
      <div className="card-sun rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-medium text-white/70">Estratégia</h3>
        <Textarea
          name="strategy"
          rows={4}
          placeholder="Descreva a abordagem estratégica, mensagem principal, diferenciais..."
          defaultValue={brief?.strategy ?? ''}
          className="bg-transparent border-white/10 resize-none"
        />
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label className="text-white/50">Observações adicionais</Label>
        <Textarea
          name="notes"
          rows={2}
          defaultValue={brief?.notes ?? ''}
          className="bg-transparent border-white/10 resize-none"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Save className="h-4 w-4" />
          {isPending ? 'Salvando...' : 'Salvar brief'}
        </Button>
      </div>
    </form>
  )
}
