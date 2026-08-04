
DROP POLICY IF EXISTS "Users can insert their own comments" ON public.comments;
CREATE POLICY "Confirmed users can insert comments"
  ON public.comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.is_email_confirmed());

DROP POLICY IF EXISTS "Comments are viewable by authenticated users" ON public.comments;
CREATE POLICY "Comments viewable by confirmed users"
  ON public.comments FOR SELECT TO authenticated
  USING (public.is_email_confirmed());

ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_content_check;
ALTER TABLE public.comments
  ADD CONSTRAINT comments_content_check
  CHECK (char_length(content) > 0 AND char_length(content) <= 60);

CREATE OR REPLACE FUNCTION public.enforce_comment_daily_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.comments
      WHERE user_id = NEW.user_id
        AND created_at >= date_trunc('day', now())) >= 5 THEN
    RAISE EXCEPTION 'Daily comment limit reached';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_daily_comment_limit ON public.comments;
CREATE TRIGGER check_daily_comment_limit
  BEFORE INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.enforce_comment_daily_limit();
