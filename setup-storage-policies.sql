-- Allow authenticated users to upload to course-images bucket
CREATE POLICY "Allow authenticated uploads to course-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-images');

-- Allow public read access to course-images
CREATE POLICY "Allow public read access to course-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-images');

-- Allow authenticated users to delete from course-images
CREATE POLICY "Allow authenticated delete from course-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'course-images');

-- Allow authenticated users to upload to course-files bucket
CREATE POLICY "Allow authenticated uploads to course-files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-files');

-- Allow public read access to course-files
CREATE POLICY "Allow public read access to course-files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-files');

-- Allow authenticated users to delete from course-files
CREATE POLICY "Allow authenticated delete from course-files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'course-files');
