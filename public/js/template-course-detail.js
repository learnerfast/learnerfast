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
      
      // Course includes
      if (course.label) {
        const includesEl = document.querySelector('.course-includes, .includes');
        if (includesEl) {
          const items = course.label.split('\n').filter(i => i.trim());
          includesEl.innerHTML = items.map(item => `<li>${item}</li>`).join('');
        }
      }
      
      // What you'll learn
      if (course.whatYouLearn) {
        const learnEl = document.querySelector('.what-you-learn, .learn');
        if (learnEl) {
          const items = course.whatYouLearn.split('\n').filter(i => i.trim());
          learnEl.innerHTML = items.map(item => `<li>${item}</li>`).join('');
        }
      }
      
      // Instructor info
      if (course.instructorName) {
        const nameEl = document.querySelector('.instructor-name');
        if (nameEl) nameEl.textContent = course.instructorName;
      }
      
      if (course.instructorTitle) {
        const titleEl = document.querySelector('.instructor-title');
        if (titleEl) titleEl.textContent = course.instructorTitle;
      }
      
      if (course.instructorBio) {
        const bioEl = document.querySelector('.instructor-bio');
        if (bioEl) bioEl.textContent = course.instructorBio;
      }
      
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
