const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkEnrollments() {
  console.log('Checking all enrollments...\n');
  
  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select('*, courses(title, user_id)')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.log('Error:', error.message);
    return;
  }
  
  console.log('Total enrollments:', enrollments?.length || 0);
  
  if (enrollments && enrollments.length > 0) {
    enrollments.forEach((e, i) => {
      console.log(`\n${i + 1}. Enrollment ID: ${e.id}`);
      console.log(`   Student: ${e.user_id}`);
      console.log(`   Course: ${e.courses?.title}`);
      console.log(`   Course Owner: ${e.courses?.user_id}`);
      console.log(`   Enrolled: ${e.enrolled_at}`);
    });
  }
}

checkEnrollments().then(() => process.exit(0));
