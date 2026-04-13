'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Search, Calendar, MoreHorizontal, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
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
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'A fazer',
  in_progress: 'Em progresso',
  in_review: 'Em revisão',
  done: 'Concluído',
}

const STATUS_COLORS: Record<string, string> = {
  backlog: 'bg-gray-100 text-gray-700',
  todo: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  in_review: 'bg-purple-100 text-purple-700',
  done: 'bg-green-100 text-green-700',
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}

interface TaskListProps {
  tasks: TaskWithAssignee[]
  workspaceSlug: string
}

export function TaskList({ tasks, workspaceSlug }: TaskListProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter
    return matchSearch && matchStatus && matchPriority
  })

  function handleDelete(taskId: string) {
    startTransition(async () => {
      const result = await deleteTaskAction(taskId, workspaceSlug)
      if (result.error) toast.error(result.error)
      else {
        toast.success('Tarefa removida')
        router.refresh()
      }
    })
  }

  function handleStatusChange(taskId: string, status: TaskStatus) {
    startTransition(async () => {
      const result = await updateTaskStatusAction(taskId, status, workspaceSlug)
      if (result.error) toast.error(result.error)
      else router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="backlog">Backlog</SelectItem>
            <SelectItem value="todo">A fazer</SelectItem>
            <SelectItem value="in_progress">Em progresso</SelectItem>
            <SelectItem value="in_review">Em revisão</SelectItem>
            <SelectItem value="done">Concluído</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v ?? 'all')}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as prioridades</SelectItem>
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={tasks.length === 0 ? 'Nenhuma tarefa ainda' : 'Nenhum resultado'}
          description={
            tasks.length === 0
              ? 'Crie sua primeira tarefa para começar.'
              : 'Tente ajustar os filtros ou a busca.'
          }
        />
      ) : (
        <div className="rounded-md border divide-y">
          {filtered.map((task) => (
            <div key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
              {/* Priority badge */}
              <Badge className={cn('text-xs shrink-0 w-16 justify-center', PRIORITY_COLORS[task.priority])}>
                {PRIORITY_LABELS[task.priority]}
              </Badge>

              {/* Title + metadata */}
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

              {/* Status selector */}
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

              {/* Assignee */}
              {task.assignee && (
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarFallback className="text-xs">
                    {getInitials(task.assignee.full_name ?? '')}
                  </AvatarFallback>
                </Avatar>
              )}

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                } />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleDelete(task.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
