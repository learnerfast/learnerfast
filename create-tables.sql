-- Create sites table
CREATE TABLE IF NOT EXISTS sites (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  url TEXT,
  status TEXT DEFAULT 'draft',
  last_edited DATE DEFAULT CURRENT_DATE,
  template_id TEXT,
  template_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own sites
CREATE POLICY "Users can only see their own sites" ON sites
  FOR ALL USING (auth.uid() = user_id);
