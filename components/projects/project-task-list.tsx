'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Calendar, MoreHorizontal, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState } from '@/components/shared/empty-state'
import { CheckSquare } from 'lucide-react'
import { deleteTaskAction, updateTaskStatusAction } from '@/lib/actions/task.actions'
import type { TaskWithAssignee, TaskStatus } from '@/types/app.types'
import { cn, getInitials } from '@/lib/utils'

const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'A fazer',
  in_progress: 'Em progresso',
  in_review: 'Em revisão',
  done: 'Concluído',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baixa', medium: 'Média', high: 'Alta', urgent: 'Urgente',
}

export function ProjectTaskList({ tasks, workspaceSlug }: { tasks: TaskWithAssignee[]; workspaceSlug: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete(taskId: string) {
    startTransition(async () => {
      const result = await deleteTaskAction(taskId, workspaceSlug)
      if (result.error) toast.error(result.error)
      else { toast.success('Tarefa removida'); router.refresh() }
    })
  }

  function handleStatusChange(taskId: string, status: TaskStatus) {
    startTransition(async () => {
      const result = await updateTaskStatusAction(taskId, status, workspaceSlug)
      if (result.error) toast.error(result.error)
      else router.refresh()
    })
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="Nenhuma tarefa neste projeto"
        description="Clique em 'Nova tarefa' para adicionar."
        className="py-10"
      />
    )
  }

  return (
    <div className="rounded-md border divide-y">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
          <Badge className={cn('text-xs shrink-0 w-16 justify-center', PRIORITY_COLORS[task.priority])}>
            {PRIORITY_LABELS[task.priority]}
          </Badge>

          <div className="flex-1 min-w-0">
            <p className={cn('text-sm font-medium truncate', task.status === 'done' && 'line-through text-muted-foreground')}>
              {task.title}
            </p>
            {task.due_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Calendar className="h-3 w-3" />
                <span>{new Date(task.due_date).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>

          <Select
            value={task.status}
            onValueChange={(val) => val && handleStatusChange(task.id, val as TaskStatus)}
            disabled={isPending}
          >
            <SelectTrigger className="w-36 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val} className="text-xs">{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {task.assignee && (
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarFallback className="text-xs">{getInitials(task.assignee.full_name ?? '')}</AvatarFallback>
            </Avatar>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            } />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  )
}
