
-- 1) Length constraints on forum tables
ALTER TABLE public.forum_threads
  ADD CONSTRAINT forum_threads_title_len CHECK (char_length(title) <= 60),
  ADD CONSTRAINT forum_threads_content_len CHECK (char_length(content) <= 500);

ALTER TABLE public.forum_replies
  ADD CONSTRAINT forum_replies_content_len CHECK (char_length(content) <= 200);

-- 2) VIP resources table (server-side gated content)
CREATE TABLE public.vip_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('primary','secondary')),
  icon text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  url text,
  action text,
  highlight boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vip_resources TO authenticated;
GRANT ALL ON public.vip_resources TO service_role;

ALTER TABLE public.vip_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view vip resources"
  ON public.vip_resources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert vip resources"
  ON public.vip_resources FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update vip resources"
  ON public.vip_resources FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete vip resources"
  ON public.vip_resources FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_vip_resources_updated_at
  BEFORE UPDATE ON public.vip_resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Seed resources
INSERT INTO public.vip_resources (category, icon, title, description, url, highlight, sort_order) VALUES
  ('primary','Zap','V2PN⚡专线','全球高速专线','https://dustan.zwaaa.app/#/register?code=R4Xx2MlV', true, 1),
  ('primary','Globe','Clash节点','每日免费节点','https://pan.xunlei.com/s/VOnGAtlOEyZgFgT8dYpo67d1A1?pwd=45tq#', true, 2),
  ('secondary','Apple','苹果美区ID','Apple独享ID','https://docs.qq.com/doc/DRnR1Y25LY3NJbnNp', false, 1),
  ('secondary','Lock','Unlock','软件社区', NULL, false, 2),
  ('secondary','Send','TG群组','官方社群','https://t.me/bydustan', false, 3);
