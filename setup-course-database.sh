#!/bin/bash

# Setup Course Builder Database
echo "Setting up Course Builder database..."

# Check if Supabase is running
if ! supabase status > /dev/null 2>&1; then
    echo "Starting Supabase..."
    supabase start
fi

# Apply the updated schema
echo "Applying database schema..."
supabase db reset --db-url $(supabase status | grep "DB URL" | awk '{print $3}')

# Apply the updated course schema
echo "Applying course builder schema..."
psql $(supabase status | grep "DB URL" | awk '{print $3}') -f updated-course-schema.sql

echo "Database setup complete!"
echo ""
echo "Tables created:"
echo "- courses (main course table)"
echo "- course_settings (General tab)"
echo "- course_access (Access tab)"
echo "- course_pricing (Pricing tab)"
echo "- course_sections (Course outline sections)"
echo "- course_activities (Course outline activities)"
echo "- course_automations (Automations tab)"
echo "- course_page_layout (Course page layout)"
echo ""
echo "All tables have RLS enabled and proper policies set."