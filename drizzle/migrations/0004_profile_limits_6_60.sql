CREATE OR REPLACE FUNCTION public.validate_profile_fields()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $function$
DECLARE old_display_name text; old_bio text; old_avatar_url text;
BEGIN
  IF TG_OP = 'UPDATE' THEN old_display_name := OLD.display_name; old_bio := OLD.bio; old_avatar_url := OLD.avatar_url; END IF;
  IF TG_OP = 'INSERT' OR NEW.display_name IS DISTINCT FROM old_display_name THEN
    IF length(coalesce(NEW.display_name, '')) > 6 THEN RAISE EXCEPTION '昵称最多 6 个字'; END IF;
  END IF;
  IF TG_OP = 'INSERT' OR NEW.bio IS DISTINCT FROM old_bio THEN
    IF length(coalesce(NEW.bio, '')) > 60 THEN RAISE EXCEPTION '简介最多 60 个字'; END IF;
  END IF;
  IF TG_OP = 'INSERT' OR NEW.avatar_url IS DISTINCT FROM old_avatar_url THEN
    IF NEW.avatar_url IS NOT NULL AND NEW.avatar_url !~ '^https://pxyfbbohoazbslneagix\.supabase\.co/storage/v1/object/public/avatars/' THEN
      RAISE EXCEPTION '头像地址不合法';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;