const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestEnrollment() {
  const yourUserId = '6bfabf54-7187-4e66-9fa8-6e7a57d23b3a';
  const yourCourseId = '25b74b04-33d0-447b-addb-987ca7f6b308'; // Education funda
  
  // Create a test student user
  const testEmail = 'teststudent@example.com';
  
  console.log('Creating test student...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: 'TestPassword123!',
    email_confirm: true,
    user_metadata: { name: 'Test Student 2' }
  });
  
  if (authError && !authError.message.includes('already registered')) {
    console.log('Auth error:', authError.message);
    return;
  }
  
  const testStudentId = authData?.user?.id || (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === testEmail)?.id;
  
  if (!testStudentId) {
    console.log('Could not get test student ID');
    return;
  }
  
  console.log('Test student ID:', testStudentId);
  
  // Create profile
  await supabase.from('profiles').upsert({
    id: testStudentId,
    email: testEmail,
    name: 'Test Student 2'
  });
  
  console.log('Creating enrollment...');
  const { data, error } = await supabase.from('enrollments').insert({
    user_id: testStudentId,
    course_id: yourCourseId,
    enrolled_at: new Date().toISOString()
  }).select();
  
  if (error) {
    console.log('Enrollment error:', error.message);
  } else {
    console.log('✅ Enrollment created successfully!');
    console.log('Student:', testStudentId);
    console.log('Course: Education funda');
    console.log('Owner:', yourUserId);
  }
}

createTestEnrollment().then(() => process.exit(0));
