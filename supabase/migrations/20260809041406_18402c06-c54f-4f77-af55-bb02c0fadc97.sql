ALTER TABLE public.vip_resources ADD COLUMN IF NOT EXISTS sub_description text;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vip_resources TO authenticated;
GRANT ALL ON public.vip_resources TO service_role;
UPDATE public.vip_resources SET description = '9.9/年', sub_description = '邀请码 ueVGAwQK' WHERE title = 'VPN专线';