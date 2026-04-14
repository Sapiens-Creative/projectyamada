-- Workspace invites
CREATE TABLE public.workspace_invites (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  role         member_role DEFAULT 'member' NOT NULL,
  token        TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by   UUID REFERENCES public.profiles(id),
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '7 days',
  used_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invites_select_member" ON public.workspace_invites
  FOR SELECT USING (public.is_workspace_member(workspace_id));

CREATE POLICY "invites_insert_admin" ON public.workspace_invites
  FOR INSERT WITH CHECK (public.workspace_role(workspace_id) IN ('owner', 'admin'));

CREATE POLICY "invites_delete_admin" ON public.workspace_invites
  FOR DELETE USING (public.workspace_role(workspace_id) IN ('owner', 'admin'));

-- Allow anyone (even unauthenticated) to read invite by token for the join flow
CREATE POLICY "invites_select_by_token" ON public.workspace_invites
  FOR SELECT USING (true);
