DROP POLICY IF EXISTS "Only owner email can insert threads" ON public.forum_threads;
CREATE POLICY "Only owner email can insert threads"
ON public.forum_threads
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND lower(coalesce(auth.jwt() ->> 'email', '')) = '15482105zl@gmail.com'
);