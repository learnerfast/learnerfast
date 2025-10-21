const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missing.length > 0) {
    console.warn(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

validateEnv();

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bplarfqdpsgadtzzlxur.supabase.co',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbGFyZnFkcHNnYWR0enpseHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NzMzNjgsImV4cCI6MjA3NjM0OTM2OH0.YKUf2RYypzvMlH1FiXZCBlzM3Rn8g8ZXQ6h65ESgWtk',
  mainDomain: process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'learnerfast.com',
};
