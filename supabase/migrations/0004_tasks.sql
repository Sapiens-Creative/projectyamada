-- ============================================================
-- MIGRATION: 0004_tasks
-- Tasks
-- ============================================================

CREATE TYPE task_status AS ENUM ('backlog', 'todo', 'in_progress', 'in_review', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE public.tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  project_id      UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id       UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  status          task_status DEFAULT 'todo' NOT NULL,
  priority        task_priority DEFAULT 'medium' NOT NULL,
  assignee_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date        DATE,
  created_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select" ON public.tasks
  FOR SELECT USING (public.is_workspace_member(workspace_id));

CREATE POLICY "tasks_insert" ON public.tasks
  FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "tasks_update" ON public.tasks
  FOR UPDATE USING (public.is_workspace_member(workspace_id));

CREATE POLICY "tasks_delete" ON public.tasks
  FOR DELETE USING (public.is_workspace_member(workspace_id));
