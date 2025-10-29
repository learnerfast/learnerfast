-- Check course_settings table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'course_settings'
ORDER BY ordinal_position;
