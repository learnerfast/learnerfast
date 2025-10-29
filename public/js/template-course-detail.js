(function() {
  const hostname = window.location.hostname;
  const websiteName = hostname.split('.')[0];
  
  async function loadCourseDetail() {
    try {
      // Get course slug from URL
      const pathParts = window.location.pathname.split('/');
      const courseSlug = pathParts[pathParts.length - 1].replace('.html', '');
      
      if (!courseSlug || courseSlug === 'course-detail') {
        console.error('No course specified');
        return;
      }
      
      // Fetch courses
      const response = await fetch(`https://www.learnerfast.com/api/courses/by-website?website_name=${websiteName}`);
      const { courses } = await response.json();
      
      // Find course by slug
      const course = courses.find(c => 
        c.title.toLowerCase().replace(/\s+/g, '-') === courseSlug
      );
      
      if (!course) {
        console.error('Course not found');
        return;
      }
      
      // Update page title
      document.title = course.title;
      
      // Update course details in the page
      const titleEl = document.querySelector('h1, .course-title');
      if (titleEl) titleEl.textContent = course.title;
      
      const imageEl = document.querySelector('.course-image, img[alt*="course"]');
      if (imageEl) imageEl.src = course.image || 'https://via.placeholder.com/1200x600?text=Course';
      
      const descEl = document.querySelector('.course-description, .description');
      if (descEl) descEl.textContent = course.description || '';
      
      const priceEl = document.querySelector('.course-price, .price');
      if (priceEl) priceEl.textContent = course.price > 0 ? `$${course.price}` : 'Free';
      
      const labelEl = document.querySelector('.course-instructor, .instructor');
      if (labelEl && course.label) labelEl.textContent = course.label;
      
    } catch (error) {
      console.error('Failed to load course details:', error);
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCourseDetail);
  } else {
    loadCourseDetail();
  }
})();
