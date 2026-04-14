'use client'

import { createContext, useContext } from 'react'
import type { Workspace, Profile } from '@/types/app.types'

interface WorkspaceContextValue {
  workspace: Workspace
  profile: Profile
  allWorkspaces: Workspace[]
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({
  children,
  workspace,
  profile,
  allWorkspaces,
}: {
  children: React.ReactNode
  workspace: Workspace
  profile: Profile
  allWorkspaces: Workspace[]
}) {
  return (
    <WorkspaceContext.Provider value={{ workspace, profile, allWorkspaces }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}
