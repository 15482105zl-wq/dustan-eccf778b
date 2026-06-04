
CREATE TABLE public.forum_threads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_threads TO authenticated;
GRANT ALL ON public.forum_threads TO service_role;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Threads viewable by authenticated" ON public.forum_threads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only owner email can insert threads" ON public.forum_threads FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id AND (SELECT email FROM auth.users WHERE id = auth.uid()) = '15482105zl@gmail.com'
);
CREATE POLICY "Owner can delete own threads" ON public.forum_threads FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner can update own threads" ON public.forum_threads FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.forum_replies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id uuid NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_replies TO authenticated;
GRANT ALL ON public.forum_replies TO service_role;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Replies viewable by authenticated" ON public.forum_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can reply" ON public.forum_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own replies" ON public.forum_replies FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_forum_threads_updated_at BEFORE UPDATE ON public.forum_threads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
