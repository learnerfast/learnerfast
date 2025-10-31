const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debug() {
  console.log('=== CHECKING ENROLLMENTS ===\n');
  
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*');
  
  console.log('Total enrollments:', enrollments?.length || 0);
  if (enrollments && enrollments.length > 0) {
    enrollments.forEach(e => {
      console.log(`  - User: ${e.user_id}, Course: ${e.course_id}`);
    });
  }
  
  console.log('\n=== CHECKING COURSES ===\n');
  
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, user_id');
  
  console.log('Total courses:', courses?.length || 0);
  if (courses && courses.length > 0) {
    courses.forEach(c => {
      console.log(`  - Course: ${c.title} (${c.id})`);
      console.log(`    Owner: ${c.user_id}`);
    });
  }
  
  console.log('\n=== CHECKING PROFILES ===\n');
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, name');
  
  console.log('Total profiles:', profiles?.length || 0);
  if (profiles && profiles.length > 0) {
    profiles.forEach(p => {
      console.log(`  - ${p.email} (${p.id})`);
      console.log(`    Name: ${p.name || 'N/A'}`);
    });
  }
  
  console.log('\n=== MATCHING ENROLLMENTS TO COURSES ===\n');
  
  if (enrollments && courses) {
    enrollments.forEach(e => {
      const course = courses.find(c => c.id === e.course_id);
      if (course) {
        console.log(`Student ${e.user_id} enrolled in "${course.title}"`);
        console.log(`  Course owner: ${course.user_id}`);
        console.log(`  Match: ${e.user_id === course.user_id ? 'SAME USER (PROBLEM!)' : 'Different users (OK)'}`);
      }
    });
  }
}

debug().then(() => process.exit(0));
