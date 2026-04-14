-- ============================================================
-- 0012_campaigns.sql
-- Gestão de Campanhas: campaign_briefs + enriquece assets
-- ============================================================

CREATE TABLE IF NOT EXISTS campaign_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  objective TEXT,
  target_audience TEXT,
  channels TEXT[] DEFAULT '{}',
  kpis JSONB DEFAULT '[]'::jsonb,
  budget_total NUMERIC(12,2),
  budget_media NUMERIC(12,2),
  start_date DATE,
  end_date DATE,
  strategy TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id)
);

-- Enriquecer assets com versionamento e aprovação
ALTER TABLE assets ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS parent_asset_id UUID REFERENCES assets(id);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending'
  CHECK (approval_status IN ('pending','approved','rejected'));
ALTER TABLE assets ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS approval_flow TEXT DEFAULT 'internal_only'
  CHECK (approval_flow IN ('internal_only','client_required','auto_approve'));

-- Índices
CREATE INDEX IF NOT EXISTS campaign_briefs_project_id ON campaign_briefs(project_id);
CREATE INDEX IF NOT EXISTS campaign_briefs_workspace_id ON campaign_briefs(workspace_id);
CREATE INDEX IF NOT EXISTS assets_project_id ON assets(project_id);

-- RLS campaign_briefs
ALTER TABLE campaign_briefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace_members_select_briefs" ON campaign_briefs FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_members_insert_briefs" ON campaign_briefs FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "workspace_members_update_briefs" ON campaign_briefs FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "workspace_members_delete_briefs" ON campaign_briefs FOR DELETE USING (is_workspace_member(workspace_id));
