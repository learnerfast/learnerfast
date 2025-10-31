-- Enable RLS on tables if not already enabled
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own courses" ON courses;
DROP POLICY IF EXISTS "Users can view enrollments for their courses" ON enrollments;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Create policies for courses table
CREATE POLICY "Users can view their own courses"
ON courses FOR SELECT
USING (auth.uid() = user_id);

-- Create policies for enrollments table
CREATE POLICY "Users can view enrollments for their courses"
ON enrollments FOR SELECT
USING (
  course_id IN (
    SELECT id FROM courses WHERE user_id = auth.uid()
  )
);

-- Create policies for profiles table (allow reading all profiles for enrolled users)
CREATE POLICY "Users can view all profiles"
ON profiles FOR SELECT
USING (true);
