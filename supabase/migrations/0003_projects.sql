-- ============================================================
-- MIGRATION: 0003_projects
-- Projects, Campaigns
-- ============================================================

CREATE TYPE project_status AS ENUM ('planning', 'active', 'paused', 'completed', 'cancelled');

CREATE TABLE public.projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  client_id       UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  description     TEXT,
  status          project_status DEFAULT 'planning' NOT NULL,
  start_date      DATE,
  end_date        DATE,
  budget          NUMERIC(12,2),
  created_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(workspace_id, slug)
);

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select" ON public.projects
  FOR SELECT USING (public.is_workspace_member(workspace_id));

CREATE POLICY "projects_insert" ON public.projects
  FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "projects_update" ON public.projects
  FOR UPDATE USING (public.is_workspace_member(workspace_id));

CREATE POLICY "projects_delete_admin" ON public.projects
  FOR DELETE USING (public.workspace_role(workspace_id) IN ('owner', 'admin'));
