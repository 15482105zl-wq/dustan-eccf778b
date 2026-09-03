CREATE OR REPLACE FUNCTION public.validate_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  old_display_name text;
  old_bio text;
  old_avatar_url text;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    old_display_name := OLD.display_name;
    old_bio := OLD.bio;
    old_avatar_url := OLD.avatar_url;
  ELSE
    old_display_name := NULL;
    old_bio := NULL;
    old_avatar_url := NULL;
  END IF;

  IF TG_OP = 'INSERT' OR NEW.display_name IS DISTINCT FROM old_display_name THEN
    IF length(coalesce(NEW.display_name, '')) > 4 THEN
      RAISE EXCEPTION '昵称最多 4 个字';
    END IF;
  END IF;

  IF TG_OP = 'INSERT' OR NEW.bio IS DISTINCT FROM old_bio THEN
    IF length(coalesce(NEW.bio, '')) > 20 THEN
      RAISE EXCEPTION '简介最多 20 个字';
    END IF;
  END IF;

  IF TG_OP = 'INSERT' OR NEW.avatar_url IS DISTINCT FROM old_avatar_url THEN
    IF NEW.avatar_url IS NOT NULL AND NEW.avatar_url !~ '^https://pxyfbbohoazbslneagix\.supabase\.co/storage/v1/object/public/avatars/' THEN
      RAISE EXCEPTION '头像地址不合法';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.validate_profile_fields FROM anon;
GRANT EXECUTE ON FUNCTION public.validate_profile_fields TO authenticated;