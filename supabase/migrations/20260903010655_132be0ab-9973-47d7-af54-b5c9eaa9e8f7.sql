ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_display_name_len CHECK (display_name IS NULL OR char_length(display_name) <= 50) NOT VALID,
  ADD CONSTRAINT profiles_bio_len CHECK (bio IS NULL OR char_length(bio) <= 200) NOT VALID,
  ADD CONSTRAINT profiles_avatar_url_valid CHECK (
    avatar_url IS NULL
    OR avatar_url ~ '^https://pxyfbbohoazbslneagix\.supabase\.co/storage/v1/object/public/avatars/[A-Za-z0-9/_.\-]+(\?t=[0-9]+)?$'
  ) NOT VALID;

UPDATE public.profiles SET display_name = left(display_name, 50) WHERE char_length(display_name) > 50;
UPDATE public.profiles SET bio = left(bio, 200) WHERE char_length(bio) > 200;
UPDATE public.profiles SET avatar_url = NULL
WHERE avatar_url IS NOT NULL
  AND avatar_url !~ '^https://pxyfbbohoazbslneagix\.supabase\.co/storage/v1/object/public/avatars/[A-Za-z0-9/_.\-]+(\?t=[0-9]+)?$';

ALTER TABLE public.profiles VALIDATE CONSTRAINT profiles_display_name_len;
ALTER TABLE public.profiles VALIDATE CONSTRAINT profiles_bio_len;
ALTER TABLE public.profiles VALIDATE CONSTRAINT profiles_avatar_url_valid;