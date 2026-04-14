-- ============================================================
-- MIGRATION: 0006_financial
-- Invoices (faturas) for clients/projects
-- ============================================================

CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

CREATE TABLE public.invoices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  client_id     UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id    UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  number        TEXT NOT NULL,
  title         TEXT NOT NULL,
  status        invoice_status DEFAULT 'draft' NOT NULL,
  amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  due_date      DATE,
  paid_at       DATE,
  notes         TEXT,
  created_by    UUID REFERENCES public.profiles(id),
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(workspace_id, number)
);

CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_select" ON public.invoices
  FOR SELECT USING (public.is_workspace_member(workspace_id));

CREATE POLICY "invoices_insert" ON public.invoices
  FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "invoices_update" ON public.invoices
  FOR UPDATE USING (public.is_workspace_member(workspace_id));

CREATE POLICY "invoices_delete" ON public.invoices
  FOR DELETE USING (public.workspace_role(workspace_id) IN ('owner', 'admin'));
