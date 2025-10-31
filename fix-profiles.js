const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixProfiles() {
  console.log('=== FIXING MISSING PROFILES ===\n');
  
  // Get all enrollments
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('user_id');
  
  if (!enrollments || enrollments.length === 0) {
    console.log('No enrollments found');
    return;
  }
  
  const userIds = [...new Set(enrollments.map(e => e.user_id))];
  console.log('Checking profiles for', userIds.length, 'users...\n');
  
  for (const userId of userIds) {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (!existingProfile) {
      console.log(`Missing profile for user: ${userId}`);
      
      // Get user from auth
      const { data: authUser } = await supabase.auth.admin.getUserById(userId);
      
      if (authUser && authUser.user) {
        const email = authUser.user.email;
        const name = authUser.user.user_metadata?.name || email.split('@')[0];
        
        console.log(`  Creating profile for ${email}...`);
        
        const { data, error } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email,
            name: name,
            full_name: name
          });
        
        if (error) {
          console.log(`  ❌ Error: ${error.message}`);
        } else {
          console.log(`  ✅ Profile created successfully`);
        }
      }
    } else {
      console.log(`✓ Profile exists for user: ${userId}`);
    }
  }
  
  console.log('\n=== DONE ===');
}

fixProfiles().then(() => process.exit(0));
