const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testQuery() {
  const userId = '6bfabf54-7187-4e66-9fa8-6e7a57d23b3a';
  
  console.log('Testing exact query from Users.jsx...\n');
  console.log('User ID:', userId);
  
  // Step 1: Get courses
  const { data: coursesData } = await supabase
    .from('courses')
    .select('*, course_sections(id, course_activities(id))')
    .eq('user_id', userId);
  
  console.log('\nCourses found:', coursesData?.length);
  const courseIds = (coursesData || []).map(c => c.id);
  console.log('Course IDs:', courseIds);
  
  if (courseIds.length === 0) {
    console.log('\n❌ NO COURSES FOUND - This is why analytics show 0!');
    return;
  }
  
  // Step 2: Get enrollments
  const { data: enrollmentsData } = await supabase
    .from('enrollments')
    .select('*')
    .in('course_id', courseIds);
  
  console.log('\nEnrollments found:', enrollmentsData?.length);
  
  if (!enrollmentsData || enrollmentsData.length === 0) {
    console.log('❌ NO ENROLLMENTS FOUND');
    return;
  }
  
  // Step 3: Get profiles
  const userIds = [...new Set(enrollmentsData.map(e => e.user_id))];
  console.log('Student user IDs:', userIds);
  
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, email, name')
    .in('id', userIds);
  
  console.log('Profiles found:', profilesData?.length);
  
  if (profilesData) {
    profilesData.forEach(p => {
      console.log(`  - ${p.email} (${p.name})`);
    });
  }
  
  console.log('\n✅ Query should work! Check browser console for actual user.id');
}

testQuery().then(() => process.exit(0));
