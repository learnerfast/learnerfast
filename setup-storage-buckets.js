require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupBuckets() {
  // Update course-images bucket
  const { error: updateImagesError } = await supabase.storage.updateBucket('course-images', {
    public: true,
    fileSizeLimit: 10485760
  });
  
  if (updateImagesError) {
    console.log('Creating course-images bucket...');
    const { error: createImagesError } = await supabase.storage.createBucket('course-images', {
      public: true,
      fileSizeLimit: 10485760
    });
    if (createImagesError) console.error('Error:', createImagesError);
  }
  console.log('✓ course-images bucket ready');
  
  // Update course-files bucket
  const { error: updateFilesError } = await supabase.storage.updateBucket('course-files', {
    public: true,
    fileSizeLimit: 10485760
  });
  
  if (updateFilesError) {
    console.log('Creating course-files bucket...');
    const { error: createFilesError } = await supabase.storage.createBucket('course-files', {
      public: true,
      fileSizeLimit: 10485760
    });
    if (createFilesError) console.error('Error:', createFilesError);
  }
  console.log('✓ course-files bucket ready');
  
  console.log('\n⚠️  IMPORTANT: Go to Supabase Dashboard > Storage > Policies');
  console.log('For both buckets, add these policies:');
  console.log('1. INSERT: authenticated users can upload');
  console.log('2. SELECT: public can read');
  console.log('3. DELETE: authenticated users can delete\n');
}

setupBuckets().catch(console.error);
