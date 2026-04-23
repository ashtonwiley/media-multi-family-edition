CREATE OR REPLACE FUNCTION public._validate_child_username(_username TEXT)
RETURNS VOID
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
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

CREATE OR REPLACE FUNCTION public._validate_child_password(_password TEXT)
RETURNS VOID
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF _password IS NULL OR length(_password) < 6 OR length(_password) > 72 THEN
    RAISE EXCEPTION 'Password must be 6-72 characters';
  END IF;
END;
$$;