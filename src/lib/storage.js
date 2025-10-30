import { supabase } from './supabase';

export const uploadFile = async (file, bucket, path) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
};

export const deleteCourseFiles = async (courseId) => {
  await supabase.storage.from('course-images').remove([`course-${courseId}`]);
  await supabase.storage.from('course-files').remove([`course-${courseId}`]);
};
