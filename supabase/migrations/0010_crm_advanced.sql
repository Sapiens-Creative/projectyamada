-- ============================================================
-- 0010_crm_advanced.sql
-- CRM Avançado: enriquece tabela clients + histórico de interações
-- ============================================================

-- Enriquecer tabela clients com dados fiscais, contratuais e tags
ALTER TABLE clients ADD COLUMN IF NOT EXISTS cnpj TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS razao_social TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS revenue_range TEXT CHECK (revenue_range IN ('<100k','100k-500k','500k-2m','>2m'));
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address_city TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address_state TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contract_start DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contract_renewal DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS monthly_fee NUMERIC(12,2);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Histórico de interações com clientes
CREATE TABLE IF NOT EXISTS client_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email','call','meeting','whatsapp','note','recording')),
  title TEXT NOT NULL,
  description TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS client_interactions_client_id ON client_interactions(client_id);
CREATE INDEX IF NOT EXISTS client_interactions_workspace_id ON client_interactions(workspace_id);
CREATE INDEX IF NOT EXISTS clients_tags_idx ON clients USING GIN(tags);

-- RLS para client_interactions
ALTER TABLE client_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_members_select_interactions"
  ON client_interactions FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "workspace_members_insert_interactions"
  ON client_interactions FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "workspace_members_update_interactions"
  ON client_interactions FOR UPDATE
  USING (is_workspace_member(workspace_id));

CREATE POLICY "workspace_members_delete_interactions"
  ON client_interactions FOR DELETE
  USING (is_workspace_member(workspace_id));
