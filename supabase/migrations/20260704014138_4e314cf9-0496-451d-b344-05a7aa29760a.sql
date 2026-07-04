
-- Helper: check if current user has confirmed email
CREATE OR REPLACE FUNCTION public.is_email_confirmed()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND email_confirmed_at IS NOT NULL
  )
$$;

-- vip_resources: require confirmed email to view
DROP POLICY IF EXISTS "Authenticated users can view vip resources" ON public.vip_resources;
CREATE POLICY "Confirmed users can view vip resources"
ON public.vip_resources FOR SELECT
TO authenticated
USING (public.is_email_confirmed());

-- forum_threads
DROP POLICY IF EXISTS "Threads viewable by authenticated" ON public.forum_threads;
CREATE POLICY "Threads viewable by confirmed users"
ON public.forum_threads FOR SELECT
TO authenticated
USING (public.is_email_confirmed());

DROP POLICY IF EXISTS "Only admins can insert threads" ON public.forum_threads;
CREATE POLICY "Only confirmed admins can insert threads"
ON public.forum_threads FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND has_role(auth.uid(), 'admin'::app_role) AND public.is_email_confirmed());

-- forum_replies
DROP POLICY IF EXISTS "Replies viewable by authenticated" ON public.forum_replies;
CREATE POLICY "Replies viewable by confirmed users"
ON public.forum_replies FOR SELECT
TO authenticated
USING (public.is_email_confirmed());

DROP POLICY IF EXISTS "Authenticated users can reply" ON public.forum_replies;
CREATE POLICY "Confirmed users can reply"
ON public.forum_replies FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND public.is_email_confirmed());

-- Revoke anon SELECT on all relevant tables to hide from GraphQL introspection
REVOKE SELECT ON public.vip_resources FROM anon;
REVOKE SELECT ON public.forum_threads FROM anon;
REVOKE SELECT ON public.forum_replies FROM anon;
REVOKE SELECT ON public.comments FROM anon;
REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.user_roles FROM anon;
REVOKE ALL ON public.vip_resources FROM anon;
REVOKE ALL ON public.forum_threads FROM anon;
REVOKE ALL ON public.forum_replies FROM anon;
REVOKE ALL ON public.comments FROM anon;
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.user_roles FROM anon;
