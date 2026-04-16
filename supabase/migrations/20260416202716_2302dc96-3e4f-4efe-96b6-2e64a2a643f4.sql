-- Family profile linked to authenticated parent (auth.users)
CREATE TABLE public.family_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_name TEXT,
  child_name TEXT,
  child_age_group TEXT NOT NULL DEFAULT 'under13',
  daily_screen_time_minutes INTEGER NOT NULL DEFAULT 60,
  hide_algorithmic_feeds BOOLEAN NOT NULL DEFAULT true,
  block_strangers BOOLEAN NOT NULL DEFAULT true,
  no_ads BOOLEAN NOT NULL DEFAULT true,
  auto_moderate_content BOOLEAN NOT NULL DEFAULT true,
  bedtime_curfew BOOLEAN NOT NULL DEFAULT true,
  require_reply_approval BOOLEAN NOT NULL DEFAULT true,
  connected_apps TEXT[] NOT NULL DEFAULT ARRAY['instagram','youtube']::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.family_profiles ENABLE ROW LEVEL SECURITY;

-- Parents can only see and modify their own family profile
CREATE POLICY "Parents view their own family profile"
  ON public.family_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Parents insert their own family profile"
  ON public.family_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Parents update their own family profile"
  ON public.family_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Parents delete their own family profile"
  ON public.family_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Reusable timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_family_profiles_updated_at
  BEFORE UPDATE ON public.family_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create family profile on parent signup, pulling parent_name from metadata
CREATE OR REPLACE FUNCTION public.handle_new_parent()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.family_profiles (user_id, parent_name, child_name, child_age_group)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'parent_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'child_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'child_age_group', 'under13')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_parent();