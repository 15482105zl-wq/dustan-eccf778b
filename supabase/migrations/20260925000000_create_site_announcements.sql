CREATE TABLE public.site_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  tag text NOT NULL,
  content jsonb NOT NULL DEFAULT '[]'::jsonb,
  download_url text NOT NULL,
  button_text text NOT NULL DEFAULT '立即下载官方 APP',
  version text NOT NULL DEFAULT '1.0.0',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_announcements ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.site_announcements TO anon, authenticated;
GRANT UPDATE ON public.site_announcements TO authenticated;

CREATE POLICY "Announcements are publicly readable"
  ON public.site_announcements FOR SELECT
  USING (true);

CREATE POLICY "Admins can update announcements"
  ON public.site_announcements FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_site_announcements_updated_at
  BEFORE UPDATE ON public.site_announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_announcements
  (id, title, tag, content, download_url, button_text, version, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000001', '🔥 官方客户端全新上线', '官方重磅更新',
   '["手机端独立 App 正式发布，极致流畅体验", "极速节点一键直达，全站资源随身畅享", "支持免翻墙高速直连与新功能抢先体验"]'::jsonb,
   'https://pxyfbbohoazbslneagix.supabase.co/storage/v1/object/public/downloads/DustanHub.apk',
   '立即下载官方 APP', '1.0.0', true)
ON CONFLICT (id) DO NOTHING;
