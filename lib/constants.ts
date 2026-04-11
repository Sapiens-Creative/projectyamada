export const APP_NAME = 'Okei Agency'
export const APP_DESCRIPTION = 'Management system for digital marketing agencies'

export const CLIENT_STATUS_LABELS: Record<string, string> = {
  lead: 'Lead',
  active: 'Ativo',
  paused: 'Pausado',
  churned: 'Encerrado',
}

export const CLIENT_TIER_LABELS: Record<string, string> = {
  basic: 'Básico',
  standard: 'Padrão',
  premium: 'Premium',
  enterprise: 'Enterprise',
}

export const MEMBER_ROLE_LABELS: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  member: 'Membro',
  viewer: 'Visualizador',
}

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '', icon: 'LayoutDashboard' },
  { label: 'Clientes', href: '/clients', icon: 'Building2' },
  { label: 'Projetos', href: '/projects', icon: 'FolderKanban', soon: true },
  { label: 'Tarefas', href: '/tasks', icon: 'CheckSquare', soon: true },
  { label: 'Financeiro', href: '/financial', icon: 'DollarSign', soon: true },
  { label: 'Assets', href: '/assets', icon: 'Layers', soon: true },
  { label: 'Equipe', href: '/team', icon: 'Users', soon: true },
  { label: 'Relatórios', href: '/reports', icon: 'BarChart3', soon: true },
] as const
