-- Drop old policy
DROP POLICY IF EXISTS "Users can view their own sites" ON sites;

-- Create new policy that allows public read access for preview
CREATE POLICY "Anyone can view sites for preview" ON sites
  FOR SELECT USING (true);
