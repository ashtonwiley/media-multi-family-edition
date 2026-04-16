-- 1. Add hashed PIN to family profile
ALTER TABLE public.family_profiles
  ADD COLUMN child_pin_hash TEXT;

-- Enable pgcrypto for secure PIN hashing (idempotent)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Family posts table (child & parent posts on the family-only feed)
CREATE TABLE public.family_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author TEXT NOT NULL CHECK (author IN ('child', 'parent')),
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  mood TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.family_posts ENABLE ROW LEVEL SECURITY;

-- Only the parent who owns the family can interact with their family's posts
CREATE POLICY "Parents view their family posts"
  ON public.family_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Parents create posts in their family"
  ON public.family_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Parents update their family posts"
  ON public.family_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Parents delete their family posts"
  ON public.family_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE TRIGGER update_family_posts_updated_at
  BEFORE UPDATE ON public.family_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_family_posts_user_status ON public.family_posts(user_id, status, created_at DESC);

-- 3. Secure helpers for PIN management (run as definer, never expose plaintext)

-- Set / change PIN: stores only a bcrypt hash for the calling parent
CREATE OR REPLACE FUNCTION public.set_child_pin(_pin TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _pin !~ '^[0-9]{4}$' THEN
    RAISE EXCEPTION 'PIN must be exactly 4 digits';
  END IF;
  UPDATE public.family_profiles
    SET child_pin_hash = crypt(_pin, gen_salt('bf'))
    WHERE user_id = auth.uid();
END;
$$;

-- Verify PIN: returns true/false without exposing the hash
CREATE OR REPLACE FUNCTION public.verify_child_pin(_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  stored TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  SELECT child_pin_hash INTO stored
    FROM public.family_profiles
    WHERE user_id = auth.uid();
  IF stored IS NULL THEN
    RETURN false;
  END IF;
  RETURN stored = crypt(_pin, stored);
END;
$$;

-- Returns whether a PIN has been set (without revealing it)
CREATE OR REPLACE FUNCTION public.has_child_pin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  exists_pin BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  SELECT child_pin_hash IS NOT NULL INTO exists_pin
    FROM public.family_profiles
    WHERE user_id = auth.uid();
  RETURN COALESCE(exists_pin, false);
END;
$$;