-- Assets table
CREATE TABLE public.assets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  client_id   UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  file_url    TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_type   TEXT NOT NULL,
  size        BIGINT NOT NULL DEFAULT 0,
  created_by  UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assets_select" ON public.assets
  FOR SELECT USING (public.is_workspace_member(workspace_id));

CREATE POLICY "assets_insert" ON public.assets
  FOR INSERT WITH CHECK (public.workspace_role(workspace_id) IN ('owner', 'admin', 'member'));

CREATE POLICY "assets_delete" ON public.assets
  FOR DELETE USING (public.workspace_role(workspace_id) IN ('owner', 'admin'));

-- updated_at trigger
CREATE TRIGGER assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Storage bucket (run separately if Supabase Storage bucket doesn't exist yet)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', true)
-- ON CONFLICT DO NOTHING;

-- Storage RLS policies
-- CREATE POLICY "assets_storage_select" ON storage.objects FOR SELECT USING (bucket_id = 'assets');
-- CREATE POLICY "assets_storage_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'assets' AND auth.role() = 'authenticated');
-- CREATE POLICY "assets_storage_delete" ON storage.objects FOR DELETE USING (bucket_id = 'assets' AND auth.role() = 'authenticated');
