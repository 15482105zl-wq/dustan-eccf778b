CREATE TABLE public.site_counters (
  key text PRIMARY KEY,
  label text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'other',
  count bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.site_counters TO authenticated;
GRANT ALL ON public.site_counters TO service_role;
ALTER TABLE public.site_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read counters" ON public.site_counters FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins reset counters" ON public.site_counters FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.increment_counter(p_key text, p_label text, p_category text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_key IS NULL OR p_key !~ '^[a-z0-9_]{1,40}$' THEN RAISE EXCEPTION 'invalid key'; END IF;
  INSERT INTO public.site_counters (key, label, category, count, updated_at)
  VALUES (p_key, left(coalesce(p_label,''),40), left(coalesce(p_category,'other'),20), 1, now())
  ON CONFLICT (key) DO UPDATE SET count = site_counters.count + 1, updated_at = now();
END; $$;
REVOKE ALL ON FUNCTION public.increment_counter(text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_counter(text,text,text) TO anon, authenticated;