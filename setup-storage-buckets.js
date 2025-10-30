require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupBuckets() {
  // Create course-images bucket
  const { data: imagesData, error: imagesError } = await supabase.storage.createBucket('course-images', {
    public: true,
    fileSizeLimit: 5242880 // 5MB
  });
  
  if (imagesError && !imagesError.message.includes('already exists')) {
    console.error('Error creating course-images bucket:', imagesError);
  } else {
    console.log('✓ course-images bucket ready');
  }
  
  // Create course-files bucket
  const { data: filesData, error: filesError } = await supabase.storage.createBucket('course-files', {
    public: true,
    fileSizeLimit: 52428800 // 50MB
  });
  
  if (filesError && !filesError.message.includes('already exists')) {
    console.error('Error creating course-files bucket:', filesError);
  } else {
    console.log('✓ course-files bucket ready');
  }
  
  console.log('\nStorage buckets setup complete!');
}

setupBuckets().catch(console.error);
