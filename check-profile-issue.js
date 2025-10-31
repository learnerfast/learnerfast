const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProfileIssue() {
  console.log('=== CHECKING PROFILE ISSUE ===\n');
  
  // Get all enrollments
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*');
  
  console.log('Total enrollments:', enrollments?.length || 0);
  
  if (enrollments && enrollments.length > 0) {
    const userIds = [...new Set(enrollments.map(e => e.user_id))];
    console.log('\nUnique user IDs in enrollments:', userIds);
    
    // Check if profiles exist for these users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, name, full_name')
      .in('id', userIds);
    
    console.log('\nProfiles found:', profiles?.length || 0);
    
    if (profiles) {
      profiles.forEach(p => {
        console.log(`  - ID: ${p.id}`);
        console.log(`    Email: ${p.email || 'NULL'}`);
        console.log(`    Name: ${p.name || 'NULL'}`);
        console.log(`    Full Name: ${p.full_name || 'NULL'}`);
      });
    }
    
    // Check for missing profiles
    const profileIds = new Set((profiles || []).map(p => p.id));
    const missingProfiles = userIds.filter(id => !profileIds.has(id));
    
    if (missingProfiles.length > 0) {
      console.log('\n⚠️  MISSING PROFILES for user IDs:', missingProfiles);
      
      // Check if these users exist in auth.users
      for (const userId of missingProfiles) {
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        if (authUser) {
          console.log(`\n  User ${userId} exists in auth but NOT in profiles table!`);
          console.log(`  Email: ${authUser.user?.email}`);
        }
      }
    }
  }
  
  // Check enrolled_at field format
  console.log('\n=== CHECKING enrolled_at FIELD ===');
  if (enrollments && enrollments.length > 0) {
    enrollments.forEach(e => {
      console.log(`Enrollment ${e.id}:`);
      console.log(`  enrolled_at: ${e.enrolled_at} (type: ${typeof e.enrolled_at})`);
    });
  }
}

checkProfileIssue().then(() => process.exit(0));
