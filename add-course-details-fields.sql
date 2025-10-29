-- Add what_you_learn column to course_settings table
ALTER TABLE public.course_settings 
ADD COLUMN IF NOT EXISTS what_you_learn TEXT;

-- Add instructor fields to course_settings table
ALTER TABLE public.course_settings 
ADD COLUMN IF NOT EXISTS instructor_name TEXT,
ADD COLUMN IF NOT EXISTS instructor_title TEXT,
ADD COLUMN IF NOT EXISTS instructor_bio TEXT;

-- Update existing records to have empty string instead of null
UPDATE public.course_settings 
SET what_you_learn = '' 
WHERE what_you_learn IS NULL;
