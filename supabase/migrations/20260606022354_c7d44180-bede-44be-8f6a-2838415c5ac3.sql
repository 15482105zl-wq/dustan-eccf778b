
-- 1. Ensure admin role exists for the owner account
INSERT INTO public.user_roles (user_id, role)
VALUES ('6ee6e82b-c990-4373-aa98-84f6b46baf52', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Comments: drop hardcoded-email admin policies, use has_role
DROP POLICY IF EXISTS "Owner email can delete any comment" ON public.comments;
DROP POLICY IF EXISTS "Owner email can update any comment" ON public.comments;

CREATE POLICY "Admins can delete any comment" ON public.comments
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any comment" ON public.comments
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. forum_threads: replace hardcoded-email insert policy
DROP POLICY IF EXISTS "Only owner email can insert threads" ON public.forum_threads;

CREATE POLICY "Only admins can insert threads" ON public.forum_threads
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

-- Also allow admins to delete/update any thread (was previously implicit via owner)
CREATE POLICY "Admins can delete any thread" ON public.forum_threads
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any thread" ON public.forum_threads
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. forum_replies: drop hardcoded-email admin policies, use has_role; add owner UPDATE
DROP POLICY IF EXISTS "Owner email can delete any reply" ON public.forum_replies;
DROP POLICY IF EXISTS "Owner email can update any reply" ON public.forum_replies;

CREATE POLICY "Admins can delete any reply" ON public.forum_replies
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any reply" ON public.forum_replies
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own replies" ON public.forum_replies
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Storage: scope avatar delete to authenticated only
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- 6. Revoke anon SELECT visibility from app tables (GraphQL anon exposure)
REVOKE SELECT ON public.comments FROM anon;
REVOKE SELECT ON public.forum_replies FROM anon;
REVOKE SELECT ON public.forum_threads FROM anon;
REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.user_roles FROM anon;
