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

export type Invoice = Database['public']['Tables']['invoices']['Row']
export type InvoiceStatus = Database['public']['Enums']['invoice_status']

export type InvoiceWithClient = Invoice & {
  clients: Pick<Client, 'id' | 'name' | 'slug'> | null
  projects: Pick<Project, 'id' | 'name' | 'slug'> | null
}

export type WorkspaceInvite = Database['public']['Tables']['workspace_invites']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

export type Asset = Database['public']['Tables']['assets']['Row']

export type AssetWithClient = Asset & {
  clients: Pick<Client, 'id' | 'name' | 'slug'> | null
}

export type WorkspaceMemberWithProfile = WorkspaceMember & {
  profiles: Profile
}

export type ClientInteraction = Database['public']['Tables']['client_interactions']['Row']
export type InteractionType = ClientInteraction['type']

export type ClientWithInteractions = Client & {
  client_contacts: ClientContact[]
  client_interactions: ClientInteraction[]
}

export type Lead = Database['public']['Tables']['leads']['Row']
export type LeadStage = Lead['stage']
export type LeadSource = Lead['source']

export type LeadWithAssignee = Lead & {
  assignee: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
}

export type Proposal = Database['public']['Tables']['proposals']['Row']
export type ProposalStatus = Proposal['status']

export type ProposalWithRefs = Proposal & {
  leads: Pick<Lead, 'id' | 'name'> | null
  clients: Pick<Client, 'id' | 'name' | 'slug'> | null
}

export type CampaignBrief = Database['public']['Tables']['campaign_briefs']['Row']

export type TimeEntry = Database['public']['Tables']['time_entries']['Row']
export type TimeEntryWithUser = TimeEntry & {
  profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

export type CampaignCost = Database['public']['Tables']['campaign_costs']['Row']
export type CampaignCostCategory = CampaignCost['category']
