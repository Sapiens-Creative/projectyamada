-- ============================================================
-- 0011_pipeline.sql
-- Pipeline de Vendas: leads + proposals
-- ============================================================

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  source TEXT CHECK (source IN ('site','landing_page','referral','linkedin','facebook','event','cold','other')),
  stage TEXT NOT NULL DEFAULT 'new' CHECK (stage IN ('new','contacted','proposal','negotiation','won','lost')),
  score INTEGER DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  estimated_value NUMERIC(12,2),
  lost_reason TEXT,
  notes TEXT,
  assigned_to UUID REFERENCES profiles(id),
  converted_client_id UUID REFERENCES clients(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','rejected','expired')),
  valid_until DATE,
  total_value NUMERIC(12,2),
  content JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS leads_workspace_id ON leads(workspace_id);
CREATE INDEX IF NOT EXISTS leads_stage ON leads(workspace_id, stage);
CREATE INDEX IF NOT EXISTS proposals_workspace_id ON proposals(workspace_id);

-- RLS leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace_members_select_leads" ON leads FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_members_insert_leads" ON leads FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "workspace_members_update_leads" ON leads FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_members_delete_leads" ON leads FOR DELETE USING (is_workspace_member(workspace_id));

-- RLS proposals
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace_members_select_proposals" ON proposals FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_members_insert_proposals" ON proposals FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "workspace_members_update_proposals" ON proposals FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_members_delete_proposals" ON proposals FOR DELETE USING (is_workspace_member(workspace_id));
