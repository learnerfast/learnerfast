#!/bin/bash

echo "Setting up database tables for courses and videos..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Run the SQL file to create tables
echo "Creating course tables..."
supabase db reset --db-url "$DATABASE_URL" --file create-course-tables.sql

echo "Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure your .env.local file has the correct Supabase credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Try uploading a video to test the functionality"