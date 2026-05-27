DROP POLICY IF EXISTS "Admins can delete comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can read comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
DROP TABLE IF EXISTS public.comments CASCADE;