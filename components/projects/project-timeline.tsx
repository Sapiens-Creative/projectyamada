'use client'

import type { Task } from '@/types/app.types'

const STATUS_COLORS: Record<string, string> = {
  backlog:     'bg-white/20',
  todo:        'bg-blue-400',
  in_progress: 'bg-amber-400',
  in_review:   'bg-purple-400',
  done:        'bg-emerald-400',
}

const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog', todo: 'A fazer', in_progress: 'Em andamento', in_review: 'Em revisão', done: 'Concluído',
}

interface ProjectTimelineProps {
  tasks: Task[]
}

export function ProjectTimeline({ tasks }: ProjectTimelineProps) {
  // Only tasks with both start and due_date
  const tasksWithDates = tasks.filter((t) => t.due_date)

  if (tasksWithDates.length === 0) {
    return (
      <div className="card-sun rounded-xl p-8 text-center">
        <p className="text-sm text-white/30">
          Nenhuma tarefa com prazo definido. Adicione datas às tarefas para visualizar o cronograma.
        </p>
      </div>
    )
  }

  // Determine date range
  const dates = tasksWithDates.map((t) => new Date(t.due_date!).getTime())
  const minDate = Math.min(...dates)
  const maxDate = Math.max(...dates)
  const totalDays = Math.max(1, Math.ceil((maxDate - minDate) / 86400000))

  // Generate week labels
  const weeks: string[] = []
  const startDate = new Date(minDate)
  const endDate = new Date(maxDate)
  const current = new Date(startDate)
  current.setDate(current.getDate() - current.getDay()) // start of week
  while (current <= endDate) {
    weeks.push(current.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }))
    current.setDate(current.getDate() + 7)
  }

  function getBarStyle(task: Task) {
    const dueDate = new Date(task.due_date!).getTime()
    // Bar ends at due_date, starts 1 day before (if no created_at start)
    const startMs = Math.max(minDate, dueDate - 86400000 * 3)
    const leftPct = ((startMs - minDate) / (maxDate - minDate + 86400000)) * 100
    const widthPct = ((dueDate - startMs) / (maxDate - minDate + 86400000)) * 100

    return {
      left: `${Math.max(0, leftPct)}%`,
      width: `${Math.max(2, widthPct)}%`,
    }
  }

  return (
    <div className="card-sun rounded-xl p-5 space-y-4 overflow-x-auto">
      {/* Week header */}
      <div className="flex text-[10px] text-white/30 mb-2 ml-40">
        {weeks.map((w) => (
          <div key={w} className="flex-1 min-w-[60px]">{w}</div>
        ))}
      </div>

      {/* Task rows */}
      <div className="space-y-2">
        {tasksWithDates.map((task) => (
          <div key={task.id} className="flex items-center gap-3 min-h-[32px]">
            {/* Task name */}
            <div className="w-40 shrink-0">
              <p className="text-xs text-white/70 truncate">{task.title}</p>
            </div>

            {/* Bar area */}
            <div className="flex-1 relative h-6 min-w-[300px]">
              {/* Background grid lines */}
              <div className="absolute inset-0 flex">
                {weeks.map((w) => (
                  <div key={w} className="flex-1 min-w-[60px] border-l border-white/[0.04]" />
                ))}
              </div>

              {/* Task bar */}
              <div
                className={`absolute top-1 h-4 rounded-full opacity-80 ${STATUS_COLORS[task.status]}`}
                style={getBarStyle(task)}
                title={`${task.title} — prazo: ${new Date(task.due_date!).toLocaleDateString('pt-BR')}`}
              />
            </div>

            {/* Status badge */}
            <div className="shrink-0 w-24">
              <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${
                task.status === 'done' ? 'bg-emerald-500/15 text-emerald-400' :
                task.status === 'in_progress' ? 'bg-amber-500/15 text-amber-400' :
                'bg-white/[0.06] text-white/40'
              }`}>
                {STATUS_LABELS[task.status]}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-white/20 pt-1">
        Cada barra representa o prazo da tarefa. Adicione datas de início para ver durações reais.
      </p>
    </div>
  )
}
