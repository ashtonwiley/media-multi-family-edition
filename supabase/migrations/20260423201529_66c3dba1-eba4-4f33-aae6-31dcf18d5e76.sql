
-- 1) Hide password_hash from any client SELECT on child_accounts
DROP POLICY IF EXISTS "Parents view their child accounts" ON public.child_accounts;

-- Safe listing function for parents (excludes password_hash)
CREATE OR REPLACE FUNCTION public.list_child_accounts()
RETURNS TABLE(id uuid, username text, child_name text, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  RETURN QUERY
    SELECT ca.id, ca.username, ca.child_name, ca.created_at
    FROM public.child_accounts ca
    WHERE ca.parent_user_id = auth.uid()
    ORDER BY ca.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.list_child_accounts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_child_accounts() TO authenticated;

-- 2) Realtime channel authorization for family_posts
-- Enforce that only the owning parent can subscribe to topic "family_posts:<their_uid>"
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Parents subscribe to their family_posts topic" ON realtime.messages;
CREATE POLICY "Parents subscribe to their family_posts topic"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = 'family_posts:' || auth.uid()::text
);
