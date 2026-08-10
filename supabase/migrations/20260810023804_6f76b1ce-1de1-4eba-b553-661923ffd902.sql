DROP POLICY IF EXISTS "Confirmed users can view vip resources" ON public.vip_resources;
CREATE POLICY "Anyone can view vip resources"
ON public.vip_resources FOR SELECT
TO anon, authenticated
USING (true);
GRANT SELECT ON public.vip_resources TO anon;