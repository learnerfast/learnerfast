const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProfilesTable() {
  console.log('=== CHECKING PROFILES TABLE ===\n');
  
  // Try to get all profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(5);
  
  if (error) {
    console.log('Error querying profiles:', error.message);
    console.log('Error details:', error);
  } else {
    console.log('Profiles found:', profiles?.length || 0);
    if (profiles && profiles.length > 0) {
      console.log('\nSample profile:');
      console.log(JSON.stringify(profiles[0], null, 2));
    }
  }
  
  // Try inserting a test profile
  console.log('\n=== TRYING TO INSERT PROFILE ===');
  const testUserId = '6bfabf54-7187-4e66-9fa8-6e7a57d23b3a';
  
  const { data: insertData, error: insertError } = await supabase
    .from('profiles')
    .upsert({
      id: testUserId,
      email: 'dkashyapk5@gmail.com',
      name: 'Test Student'
    }, { onConflict: 'id' })
    .select();
  
  if (insertError) {
    console.log('Insert error:', insertError.message);
    console.log('Error details:', insertError);
  } else {
    console.log('✅ Profile inserted/updated successfully');
    console.log(insertData);
  }
}

checkProfilesTable().then(() => process.exit(0));
