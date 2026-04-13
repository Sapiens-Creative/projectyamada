'use client'

import Link from 'next/link'
import { FolderKanban, Calendar, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ProjectWithClient } from '@/types/app.types'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<string, string> = {
  planning: 'Planejamento',
  active: 'Ativo',
  paused: 'Pausado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

interface ProjectCardProps {
  project: ProjectWithClient
  workspaceSlug: string
}

export function ProjectCard({ project, workspaceSlug }: ProjectCardProps) {
  return (
    <Link href={`/${workspaceSlug}/projects/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-semibold text-sm line-clamp-1">{project.name}</span>
            </div>
            <Badge className={cn('text-xs shrink-0', STATUS_COLORS[project.status])}>
              {STATUS_LABELS[project.status]}
            </Badge>
          </div>
          {project.clients && (
            <p className="text-xs text-muted-foreground pl-6">{project.clients.name}</p>
          )}
        </CardHeader>
        <CardContent className="pt-0 space-y-1">
          {project.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
          )}
          <div className="flex items-center gap-4 pt-1">
            {project.end_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(project.end_date).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
            {project.budget && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                <span>R$ {project.budget.toLocaleString('pt-BR')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
