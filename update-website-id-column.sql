-- Change website_id from UUID to TEXT to support multiple website IDs
-- Step 1: Drop the foreign key constraint
ALTER TABLE course_settings 
DROP CONSTRAINT IF EXISTS course_settings_website_id_fkey;

-- Step 2: Change column type from UUID to TEXT
ALTER TABLE course_settings 
ALTER COLUMN website_id TYPE TEXT USING website_id::TEXT;

-- Note: We don't add the foreign key back because we're storing comma-separated IDs
