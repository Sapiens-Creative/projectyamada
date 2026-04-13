import type { Database } from './database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Workspace = Database['public']['Tables']['workspaces']['Row']
export type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type ClientContact = Database['public']['Tables']['client_contacts']['Row']

export type MemberRole = Database['public']['Enums']['member_role']
export type WorkspacePlan = Database['public']['Enums']['workspace_plan']
export type ClientStatus = Database['public']['Enums']['client_status']
export type ClientTier = Database['public']['Enums']['client_tier']

export type ActionResult<T = null> = {
  data: T | null
  error: string | null
  success: boolean
}

export type Project = Database['public']['Tables']['projects']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']

export type ProjectStatus = Database['public']['Enums']['project_status']
export type TaskStatus = Database['public']['Enums']['task_status']
export type TaskPriority = Database['public']['Enums']['task_priority']

export type ClientWithContacts = Client & {
  client_contacts: ClientContact[]
}

export type ProjectWithClient = Project & {
  clients: Pick<Client, 'id' | 'name' | 'slug' | 'logo_url'> | null
}

export type TaskWithAssignee = Task & {
  assignee: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
}

export type WorkspaceMemberWithProfile = WorkspaceMember & {
  profiles: Profile
}
