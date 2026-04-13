-- ============================================================
-- MIGRATION: 0005_fix_workspace_rls
-- Fix two RLS bugs that block workspace creation:
--
-- Bug 1: workspaces SELECT policy uses is_workspace_member() which
--   returns FALSE right after INSERT (before the member row exists),
--   so insert().select() fails with RLS violation.
--   Fix: add a permissive SELECT policy for the workspace owner.
--
-- Bug 2: workspace_members INSERT policy calls workspace_role() which
--   queries workspace_members, returning NULL for a brand-new workspace.
--   So adding the first member (owner) is blocked.
--   Fix: allow self-enrollment as owner when the workspace was just created.
-- ============================================================

-- Fix 1: allow workspace owner to SELECT their own workspace
-- (multiple SELECT policies are combined with OR in Supabase)
CREATE POLICY "workspaces_select_owner" ON public.workspaces
  FOR SELECT USING (owner_id = auth.uid());

-- Fix 2: drop old restrictive members INSERT policy
DROP POLICY IF EXISTS "wm_insert_admin" ON public.workspace_members;

-- New members INSERT policy:
-- • workspace owner can add themselves as the first member (owner role)
-- • existing admin/owner can add other members
CREATE POLICY "wm_insert" ON public.workspace_members
  FOR INSERT WITH CHECK (
    (
      user_id = auth.uid()
      AND role = 'owner'
      AND EXISTS (
        SELECT 1 FROM public.workspaces
        WHERE id = workspace_id AND owner_id = auth.uid()
      )
    )
    OR
    public.workspace_role(workspace_id) IN ('owner', 'admin')
  );
