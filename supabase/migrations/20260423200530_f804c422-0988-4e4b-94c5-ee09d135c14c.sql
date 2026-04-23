-- Child accounts table
CREATE TABLE public.child_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_user_id UUID NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  child_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_child_accounts_parent ON public.child_accounts(parent_user_id);
CREATE INDEX idx_child_accounts_username ON public.child_accounts(lower(username));

ALTER TABLE public.child_accounts ENABLE ROW LEVEL SECURITY;

-- Only parents can manage their own child accounts
CREATE POLICY "Parents view their child accounts"
  ON public.child_accounts FOR SELECT
  USING (auth.uid() = parent_user_id);

CREATE POLICY "Parents create their child accounts"
  ON public.child_accounts FOR INSERT
  WITH CHECK (auth.uid() = parent_user_id);

CREATE POLICY "Parents update their child accounts"
  ON public.child_accounts FOR UPDATE
  USING (auth.uid() = parent_user_id);

CREATE POLICY "Parents delete their child accounts"
  ON public.child_accounts FOR DELETE
  USING (auth.uid() = parent_user_id);

-- updated_at trigger
CREATE TRIGGER trg_child_accounts_updated_at
  BEFORE UPDATE ON public.child_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Username validator
CREATE OR REPLACE FUNCTION public._validate_child_username(_username TEXT)
RETURNS VOID
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF _username IS NULL OR length(_username) < 3 OR length(_username) > 24 THEN
    RAISE EXCEPTION 'Username must be 3-24 characters';
  END IF;
  IF _username !~ '^[a-zA-Z0-9_]+$' THEN
    RAISE EXCEPTION 'Username may only contain letters, numbers, and underscores';
  END IF;
END;
$$;

-- Password validator
CREATE OR REPLACE FUNCTION public._validate_child_password(_password TEXT)
RETURNS VOID
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF _password IS NULL OR length(_password) < 6 OR length(_password) > 72 THEN
    RAISE EXCEPTION 'Password must be 6-72 characters';
  END IF;
END;
$$;

-- Create child account (called by an authenticated parent)
CREATE OR REPLACE FUNCTION public.create_child_account(_username TEXT, _password TEXT, _child_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  new_id UUID;
  norm_username TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  norm_username := lower(trim(_username));
  PERFORM public._validate_child_username(norm_username);
  PERFORM public._validate_child_password(_password);
  IF _child_name IS NULL OR length(trim(_child_name)) = 0 OR length(_child_name) > 40 THEN
    RAISE EXCEPTION 'Child name is required (max 40 chars)';
  END IF;

  IF EXISTS (SELECT 1 FROM public.child_accounts WHERE lower(username) = norm_username) THEN
    RAISE EXCEPTION 'Username is already taken';
  END IF;

  INSERT INTO public.child_accounts (parent_user_id, username, password_hash, child_name)
  VALUES (auth.uid(), norm_username, crypt(_password, gen_salt('bf')), trim(_child_name))
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- Update a child account (any of password/username/child_name optional)
CREATE OR REPLACE FUNCTION public.update_child_account(_id UUID, _username TEXT DEFAULT NULL, _password TEXT DEFAULT NULL, _child_name TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  norm_username TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.child_accounts WHERE id = _id AND parent_user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Child account not found';
  END IF;

  IF _username IS NOT NULL THEN
    norm_username := lower(trim(_username));
    PERFORM public._validate_child_username(norm_username);
    IF EXISTS (SELECT 1 FROM public.child_accounts WHERE lower(username) = norm_username AND id <> _id) THEN
      RAISE EXCEPTION 'Username is already taken';
    END IF;
    UPDATE public.child_accounts SET username = norm_username WHERE id = _id;
  END IF;

  IF _password IS NOT NULL THEN
    PERFORM public._validate_child_password(_password);
    UPDATE public.child_accounts SET password_hash = crypt(_password, gen_salt('bf')) WHERE id = _id;
  END IF;

  IF _child_name IS NOT NULL THEN
    IF length(trim(_child_name)) = 0 OR length(_child_name) > 40 THEN
      RAISE EXCEPTION 'Child name must be 1-40 chars';
    END IF;
    UPDATE public.child_accounts SET child_name = trim(_child_name) WHERE id = _id;
  END IF;
END;
$$;

-- Verify child login (callable without auth)
CREATE OR REPLACE FUNCTION public.verify_child_login(_username TEXT, _password TEXT)
RETURNS TABLE(parent_user_id UUID, child_name TEXT, username TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  norm_username TEXT;
BEGIN
  norm_username := lower(trim(COALESCE(_username, '')));
  IF norm_username = '' OR _password IS NULL OR _password = '' THEN
    RETURN;
  END IF;

  RETURN QUERY
    SELECT ca.parent_user_id, ca.child_name, ca.username
    FROM public.child_accounts ca
    WHERE lower(ca.username) = norm_username
      AND ca.password_hash = crypt(_password, ca.password_hash)
    LIMIT 1;
END;
$$;

-- List posts for a kid (auth-free; requires correct username+password each call)
CREATE OR REPLACE FUNCTION public.kid_list_posts(_username TEXT, _password TEXT)
RETURNS TABLE(id UUID, author TEXT, content TEXT, mood TEXT, status TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  pid UUID;
BEGIN
  SELECT v.parent_user_id INTO pid FROM public.verify_child_login(_username, _password) v;
  IF pid IS NULL THEN
    RAISE EXCEPTION 'Invalid username or password';
  END IF;
  RETURN QUERY
    SELECT fp.id, fp.author, fp.content, fp.mood, fp.status, fp.created_at
    FROM public.family_posts fp
    WHERE fp.user_id = pid
      AND fp.status IN ('approved', 'pending')
    ORDER BY fp.created_at DESC;
END;
$$;

-- Create a post as a kid (auto-approved)
CREATE OR REPLACE FUNCTION public.kid_create_post(_username TEXT, _password TEXT, _content TEXT, _mood TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  pid UUID;
  new_id UUID;
BEGIN
  SELECT v.parent_user_id INTO pid FROM public.verify_child_login(_username, _password) v;
  IF pid IS NULL THEN
    RAISE EXCEPTION 'Invalid username or password';
  END IF;
  IF _content IS NULL OR length(trim(_content)) = 0 THEN
    RAISE EXCEPTION 'Content is required';
  END IF;
  IF length(_content) > 500 THEN
    RAISE EXCEPTION 'Content must be under 500 characters';
  END IF;

  INSERT INTO public.family_posts (user_id, author, content, mood, status)
  VALUES (pid, 'child', trim(_content), _mood, 'approved')
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;