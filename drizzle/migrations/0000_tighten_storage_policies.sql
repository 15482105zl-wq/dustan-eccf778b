DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Admins can upload downloads" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'downloads' AND public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Public Download Access" ON storage.objects;
CREATE POLICY "Admins can list downloads" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'downloads' AND public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Forum images are publicly viewable" ON storage.objects;
CREATE POLICY "Owner or admin can list forum images" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'forum-images' AND (owner_id = (select auth.uid()::text) OR public.has_role(auth.uid(), 'admin'::public.app_role)));