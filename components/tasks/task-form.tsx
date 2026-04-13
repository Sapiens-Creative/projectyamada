'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Task, Project, Client, WorkspaceMemberWithProfile } from '@/types/app.types'

interface TaskFormProps {
  workspaceId: string
  workspaceSlug: string
  projects: Project[]
  clients: Client[]
  members: WorkspaceMemberWithProfile[]
  task?: Task
  action: (workspaceId: string, workspaceSlug: string, formData: FormData) => Promise<{ data: unknown; error: string | null; success: boolean }>
  onSuccess?: () => void
}

export function TaskForm({ workspaceId, workspaceSlug, projects, clients, members, task, action, onSuccess }: TaskFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await action(workspaceId, workspaceSlug, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(task ? 'Tarefa atualizada' : 'Tarefa criada')
        onSuccess?.()
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          name="title"
          defaultValue={task?.title}
          placeholder="Ex: Criar post para Instagram"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={task?.description ?? ''}
          placeholder="Descreva a tarefa..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select name="status" defaultValue={task?.status ?? 'todo'}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="backlog">Backlog</SelectItem>
              <SelectItem value="todo">A fazer</SelectItem>
              <SelectItem value="in_progress">Em progresso</SelectItem>
              <SelectItem value="in_review">Em revisão</SelectItem>
              <SelectItem value="done">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Prioridade</Label>
          <Select name="priority" defaultValue={task?.priority ?? 'medium'}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Projeto</Label>
          <Select name="project_id" defaultValue={task?.project_id ?? 'none'}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem projeto</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Cliente</Label>
          <Select name="client_id" defaultValue={task?.client_id ?? 'none'}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem cliente</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Responsável</Label>
          <Select name="assignee_id" defaultValue={task?.assignee_id ?? 'none'}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem responsável</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.user_id} value={m.user_id}>
                  {m.profiles.full_name ?? m.profiles.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">Prazo</Label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            defaultValue={task?.due_date ?? ''}
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Salvando...' : task ? 'Salvar alterações' : 'Criar tarefa'}
      </Button>
    </form>
  )
}
