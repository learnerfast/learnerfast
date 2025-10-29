const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCourseSettings() {
  console.log('Checking course settings in database...\n');
  
  const { data: courses, error } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      description,
      course_settings(
        course_label,
        what_you_learn,
        instructor_name,
        instructor_title,
        instructor_bio,
        website_id
      )
    `)
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Found courses:', courses.length);
  courses.forEach((course, i) => {
    console.log(`\n--- Course ${i + 1} ---`);
    console.log('ID:', course.id);
    console.log('Title:', course.title);
    console.log('Description:', course.description);
    console.log('\nSettings:');
    console.log('  Course Label:', course.course_settings?.course_label || 'NULL');
    console.log('  What You Learn:', course.course_settings?.what_you_learn || 'NULL');
    console.log('  Instructor Name:', course.course_settings?.instructor_name || 'NULL');
    console.log('  Instructor Title:', course.course_settings?.instructor_title || 'NULL');
    console.log('  Instructor Bio:', course.course_settings?.instructor_bio || 'NULL');
    console.log('  Website ID:', course.course_settings?.website_id || 'NULL');
  });
}

checkCourseSettings().then(() => process.exit(0));
