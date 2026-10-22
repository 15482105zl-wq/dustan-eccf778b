CREATE TABLE IF NOT EXISTS public.announcement_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seq bigint GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL,
  tag text,
  content jsonb NOT NULL DEFAULT '[]'::jsonb,
  download_url text,
  button_text text,
  version text,
  published_at timestamptz NOT NULL DEFAULT now(),
  source_announcement_id uuid
);
GRANT SELECT ON public.announcement_history TO anon, authenticated, service_role;
ALTER TABLE public.announcement_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS announcement_history_public_read ON public.announcement_history;
CREATE POLICY announcement_history_public_read ON public.announcement_history FOR SELECT USING (true);
CREATE OR REPLACE FUNCTION public.snapshot_announcement_to_history()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  INSERT INTO public.announcement_history (title, tag, content, download_url, button_text, version, source_announcement_id)
  VALUES (NEW.title, NEW.tag, NEW.content, NEW.download_url, NEW.button_text, NEW.version, NEW.id);
  RETURN NEW;
END;
$fn$;
DROP TRIGGER IF EXISTS trg_announcement_history_insert ON public.site_announcements;
CREATE TRIGGER trg_announcement_history_insert AFTER INSERT ON public.site_announcements FOR EACH ROW EXECUTE FUNCTION public.snapshot_announcement_to_history();
DROP TRIGGER IF EXISTS trg_announcement_history_update ON public.site_announcements;
CREATE TRIGGER trg_announcement_history_update AFTER UPDATE ON public.site_announcements FOR EACH ROW WHEN (NEW.version IS DISTINCT FROM OLD.version) EXECUTE FUNCTION public.snapshot_announcement_to_history();