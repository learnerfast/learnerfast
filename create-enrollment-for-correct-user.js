const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createEnrollment() {
  const loggedInUserId = '93801858-cbf4-4dd5-b2c0-3d6f7b29be56';
  
  // Get courses for this user
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title')
    .eq('user_id', loggedInUserId);
  
  console.log('Courses owned by logged-in user:', courses);
  
  if (!courses || courses.length === 0) {
    console.log('No courses found');
    return;
  }
  
  const courseId = courses[0].id;
  
  // Create test student
  const testEmail = 'student' + Date.now() + '@test.com';
  const { data: authData } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: 'Test123!',
    email_confirm: true,
    user_metadata: { name: 'Test Student' }
  });
  
  const studentId = authData.user.id;
  
  // Create profile
  await supabase.from('profiles').insert({
    id: studentId,
    email: testEmail,
    name: 'Test Student'
  });
  
  // Create enrollment
  const { data, error } = await supabase.from('enrollments').insert({
    user_id: studentId,
    course_id: courseId,
    enrolled_at: new Date().toISOString()
  });
  
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('✅ Created enrollment for course:', courses[0].title);
  }
}

createEnrollment().then(() => process.exit(0));
