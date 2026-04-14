'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { getNotifications, markNotificationReadAction, markAllNotificationsReadAction } from '@/lib/actions/notification.actions'
import type { Notification } from '@/types/app.types'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

interface NotificationBellProps {
  workspaceId: string
}

export function NotificationBell({ workspaceId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const unread = notifications.filter((n) => !n.read).length

  useEffect(() => {
    getNotifications(workspaceId).then((r) => {
      if (r.data) setNotifications(r.data)
    })
  }, [workspaceId])

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markNotificationReadAction(id)
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
    })
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsReadAction(workspaceId)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      router.refresh()
    })
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger render={
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      } />
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <p className="font-semibold text-sm">Notificações</p>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
              disabled={isPending}
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma notificação
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={`flex flex-col items-start gap-0.5 px-3 py-2.5 cursor-pointer ${!n.read ? 'bg-muted/50' : ''}`}
                onSelect={() => !n.read && handleMarkRead(n.id)}
              >
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="font-medium text-xs flex-1 leading-snug">{n.title}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-muted-foreground">{timeAgo(n.created_at)}</span>
                    {!n.read && <Badge className="h-1.5 w-1.5 p-0 rounded-full bg-primary" />}
                    {n.read && <Check className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </div>
                {n.message && (
                  <span className="text-xs text-muted-foreground line-clamp-2">{n.message}</span>
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
