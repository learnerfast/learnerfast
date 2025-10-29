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
      console.log('Fetching courses for website:', websiteName);
      const response = await fetch(`https://www.learnerfast.com/api/courses/by-website?website_name=${websiteName}`);
      const data = await response.json();
      console.log('API response:', data);
      const { courses } = data;
      
      // Find course by slug
      console.log('Looking for course with slug:', courseSlug);
      console.log('Available courses:', courses);
      
      const course = courses.find(c => 
        c.title.toLowerCase().replace(/\s+/g, '-') === courseSlug
      );
      
      if (!course) {
        console.error('Course not found');
        return;
      }
      
      console.log('Found course:', course);
      
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
      console.log('Course label:', course.label);
      if (course.label && course.label.trim()) {
        const includesEl = document.querySelector('.course-includes, .includes');
        console.log('Includes element:', includesEl);
        if (includesEl) {
          const items = course.label.split('\n').filter(i => i.trim());
          if (items.length > 0) {
            includesEl.innerHTML = items.map(item => `<li>${item}</li>`).join('');
          }
        }
      }
      
      // What you'll learn
      console.log('What you learn:', course.whatYouLearn);
      if (course.whatYouLearn && course.whatYouLearn.trim()) {
        const learnEl = document.querySelector('.what-you-learn, .learn');
        console.log('Learn element:', learnEl);
        if (learnEl) {
          const items = course.whatYouLearn.split('\n').filter(i => i.trim());
          if (items.length > 0) {
            learnEl.innerHTML = items.map(item => `<li>${item}</li>`).join('');
          }
        }
      }
      
      // Instructor info
      console.log('Instructor:', course.instructorName, course.instructorTitle, course.instructorBio);
      if (course.instructorName && course.instructorName.trim()) {
        const nameEl = document.querySelector('.instructor-name');
        console.log('Name element:', nameEl);
        if (nameEl) nameEl.textContent = course.instructorName;
      }
      
      if (course.instructorTitle && course.instructorTitle.trim()) {
        const titleEl = document.querySelector('.instructor-title');
        console.log('Title element:', titleEl);
        if (titleEl) titleEl.textContent = course.instructorTitle;
      }
      
      if (course.instructorBio && course.instructorBio.trim()) {
        const bioEl = document.querySelector('.instructor-bio');
        console.log('Bio element:', bioEl);
        if (bioEl) bioEl.textContent = course.instructorBio;
      }
      
      // Course sections/syllabus
      console.log('Course sections:', course.sections);
      if (course.sections && course.sections.length > 0) {
        const syllabusEl = document.querySelector('.course-syllabus, .syllabus, .curriculum');
        console.log('Syllabus element:', syllabusEl);
        if (syllabusEl) {
          syllabusEl.innerHTML = course.sections.map((section, index) => `
            <div class="syllabus-item">
              <h4>Module ${index + 1}: ${section.title}</h4>
              ${section.description ? `<p>${section.description}</p>` : ''}
            </div>
          `).join('');
        }
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
