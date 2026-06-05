
CREATE POLICY "Owner email can delete any comment" ON public.comments
FOR DELETE TO authenticated
USING (lower(COALESCE((auth.jwt() ->> 'email'), '')) = '15482105zl@gmail.com');

CREATE POLICY "Owner email can update any comment" ON public.comments
FOR UPDATE TO authenticated
USING (lower(COALESCE((auth.jwt() ->> 'email'), '')) = '15482105zl@gmail.com');

CREATE POLICY "Owner email can delete any reply" ON public.forum_replies
FOR DELETE TO authenticated
USING (lower(COALESCE((auth.jwt() ->> 'email'), '')) = '15482105zl@gmail.com');

CREATE POLICY "Owner email can update any reply" ON public.forum_replies
FOR UPDATE TO authenticated
USING (lower(COALESCE((auth.jwt() ->> 'email'), '')) = '15482105zl@gmail.com')
WITH CHECK (lower(COALESCE((auth.jwt() ->> 'email'), '')) = '15482105zl@gmail.com');
