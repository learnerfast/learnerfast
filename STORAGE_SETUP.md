# Supabase Storage Setup

## Quick Fix for RLS Policy Error

Go to your Supabase Dashboard and run these SQL commands in the SQL Editor:

```sql
-- For course-images bucket
CREATE POLICY "Allow authenticated uploads" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'course-images');

CREATE POLICY "Allow public read" ON storage.objects 
FOR SELECT TO public 
USING (bucket_id = 'course-images');

CREATE POLICY "Allow authenticated delete" ON storage.objects 
FOR DELETE TO authenticated 
USING (bucket_id = 'course-images');

-- For course-files bucket
CREATE POLICY "Allow authenticated uploads" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'course-files');

CREATE POLICY "Allow public read" ON storage.objects 
FOR SELECT TO public 
USING (bucket_id = 'course-files');

CREATE POLICY "Allow authenticated delete" ON storage.objects 
FOR DELETE TO authenticated 
USING (bucket_id = 'course-files');
```

Or use the Dashboard UI:
1. Go to Storage > Policies
2. For each bucket (course-images, course-files):
   - Add INSERT policy for authenticated users
   - Add SELECT policy for public
   - Add DELETE policy for authenticated users
