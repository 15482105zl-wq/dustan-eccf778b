CREATE OR REPLACE FUNCTION public.validate_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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

  -- 昵称长度限制（仅在插入或变更时校验）
  IF TG_OP = 'INSERT' OR NEW.display_name IS DISTINCT FROM old_display_name THEN
    IF length(coalesce(NEW.display_name, '')) > 4 THEN
      RAISE EXCEPTION '昵称最多 4 个字';
    END IF;
  END IF;

  -- 简介长度限制（仅在插入或变更时校验）
  IF TG_OP = 'INSERT' OR NEW.bio IS DISTINCT FROM old_bio THEN
    IF length(coalesce(NEW.bio, '')) > 20 THEN
      RAISE EXCEPTION '简介最多 20 个字';
    END IF;
  END IF;

  -- 头像地址必须来自站内 avatars 存储桶（仅在插入或变更时校验）
  IF TG_OP = 'INSERT' OR NEW.avatar_url IS DISTINCT FROM old_avatar_url THEN
    IF NEW.avatar_url IS NOT NULL AND NEW.avatar_url !~ '^https://pxyfbbohoazbslneagix\.supabase\.co/storage/v1/object/public/avatars/' THEN
      RAISE EXCEPTION '头像地址不合法';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_profile_fields_trigger ON public.profiles;
CREATE TRIGGER validate_profile_fields_trigger
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_profile_fields();