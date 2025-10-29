SELECT 
  c.id, 
  c.title, 
  cs.course_label, 
  cs.what_you_learn, 
  cs.instructor_name, 
  cs.instructor_title, 
  LEFT(cs.instructor_bio, 50) as instructor_bio_preview,
  cs.website_id,
  s.name as website_name
FROM courses c 
LEFT JOIN course_settings cs ON c.id = cs.course_id
LEFT JOIN sites s ON cs.website_id = s.id
ORDER BY c.created_at DESC 
LIMIT 5;
