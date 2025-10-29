-- Enable RLS on courses table
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can insert their own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can update their own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can delete their own courses" ON public.courses;

-- Allow users to insert their own courses
CREATE POLICY "Users can insert their own courses"
ON public.courses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own courses
CREATE POLICY "Users can view their own courses"
ON public.courses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own courses
CREATE POLICY "Users can update their own courses"
ON public.courses
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own courses
CREATE POLICY "Users can delete their own courses"
ON public.courses
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
