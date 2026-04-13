
-- Drop the old permissive insert policy
DROP POLICY "Anyone can insert comments" ON public.comments;

-- Create new policy requiring authentication
CREATE POLICY "Authenticated users can insert comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (true);
