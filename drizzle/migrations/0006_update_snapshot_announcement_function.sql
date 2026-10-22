CREATE OR REPLACE FUNCTION public.snapshot_announcement_to_history()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  INSERT INTO public.announcement_history (title, tag, content, download_url, button_text, version, source_announcement_id)
  VALUES (regexp_replace(NEW.title, '^上新\s*｜\s*', ''), NEW.tag, NEW.content, NEW.download_url, NEW.button_text, NEW.version, NEW.id);
  RETURN NEW;
END;
$fn$;