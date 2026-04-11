-- ============================================================
-- MIGRATION: 0002_clients
-- Clients and Client Contacts
-- ============================================================

CREATE TYPE client_status AS ENUM ('lead', 'active', 'paused', 'churned');
CREATE TYPE client_tier AS ENUM ('basic', 'standard', 'premium', 'enterprise');

CREATE TABLE public.clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  logo_url        TEXT,
  website         TEXT,
  industry        TEXT,
  status          client_status DEFAULT 'lead' NOT NULL,
  tier            client_tier DEFAULT 'standard' NOT NULL,
  primary_color   TEXT,
  notes           TEXT,
  created_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(workspace_id, slug)
);

CREATE TABLE public.client_contacts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  email        TEXT,
  phone        TEXT,
  role         TEXT,
  is_primary   BOOLEAN DEFAULT false NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- updated_at trigger
CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_select" ON public.clients
  FOR SELECT USING (public.is_workspace_member(workspace_id));

CREATE POLICY "clients_insert" ON public.clients
  FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "clients_update" ON public.clients
  FOR UPDATE USING (public.is_workspace_member(workspace_id));

CREATE POLICY "clients_delete_admin" ON public.clients
  FOR DELETE USING (public.workspace_role(workspace_id) IN ('owner', 'admin'));

CREATE POLICY "client_contacts_select" ON public.client_contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = client_id
        AND public.is_workspace_member(c.workspace_id)
    )
  );

CREATE POLICY "client_contacts_insert" ON public.client_contacts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = client_id
        AND public.is_workspace_member(c.workspace_id)
    )
  );

CREATE POLICY "client_contacts_update" ON public.client_contacts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = client_id
        AND public.is_workspace_member(c.workspace_id)
    )
  );

CREATE POLICY "client_contacts_delete" ON public.client_contacts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = client_id
        AND public.is_workspace_member(c.workspace_id)
    )
  );
