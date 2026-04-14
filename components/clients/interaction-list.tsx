'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Mail, Phone, Video, MessageSquare, FileText, Mic, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteInteractionAction } from '@/lib/actions/interaction.actions'
import type { ClientInteraction } from '@/types/app.types'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const TYPE_CONFIG: Record<ClientInteraction['type'], { icon: React.ElementType; label: string; color: string; bg: string }> = {
  email:     { icon: Mail,          label: 'E-mail',   color: 'text-blue-400',    bg: 'bg-blue-500/10' },
  call:      { icon: Phone,         label: 'Ligação',  color: 'text-green-400',   bg: 'bg-green-500/10' },
  meeting:   { icon: Video,         label: 'Reunião',  color: 'text-purple-400',  bg: 'bg-purple-500/10' },
  whatsapp:  { icon: MessageSquare, label: 'WhatsApp', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  note:      { icon: FileText,      label: 'Nota',     color: 'text-amber-400',   bg: 'bg-amber-500/10' },
  recording: { icon: Mic,           label: 'Gravação', color: 'text-red-400',     bg: 'bg-red-500/10' },
}

interface InteractionListProps {
  interactions: ClientInteraction[]
  clientId: string
  workspaceSlug: string
}

export function InteractionList({ interactions, clientId, workspaceSlug }: InteractionListProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteInteractionAction(id, clientId, workspaceSlug)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Interação removida')
        router.refresh()
      }
    })
  }

  if (interactions.length === 0) {
    return (
      <p className="text-sm text-white/30 py-4">
        Nenhuma interação registrada ainda.
      </p>
    )
  }

  return (
    <div className="space-y-1">
      {interactions.map((item) => {
        const cfg = TYPE_CONFIG[item.type]
        const Icon = cfg.icon
        const timeAgo = formatDistanceToNow(new Date(item.occurred_at), { addSuffix: true, locale: ptBR })

        return (
          <div
            key={item.id}
            className="group flex items-start gap-3 rounded-lg px-3 py-3 hover:bg-white/[0.03] transition-colors"
          >
            <div className={`mt-0.5 shrink-0 rounded-lg p-2 ${cfg.bg}`}>
              <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-medium uppercase tracking-wide ${cfg.color}`}>
                  {cfg.label}
                </span>
                <span className="text-[10px] text-white/30">{timeAgo}</span>
              </div>
              <p className="text-sm text-white/80 mt-0.5">{item.title}</p>
              {item.description && (
                <p className="text-xs text-white/40 mt-0.5 whitespace-pre-wrap">{item.description}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-red-400"
              onClick={() => handleDelete(item.id)}
              disabled={isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
