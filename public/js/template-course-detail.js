(function() {
  const hostname = window.location.hostname;
  const websiteName = hostname.split('.')[0];
  
  async function loadCourseDetail() {
    try {
      const pathParts = window.location.pathname.split('/');
      const courseSlug = pathParts[pathParts.length - 1].replace('.html', '');
      
      if (!courseSlug || courseSlug === 'course-detail') {
        console.error('❌ No course specified');
        return;
      }
      
      const response = await fetch(`https://www.learnerfast.com/api/courses/by-website?website_name=${websiteName}`, {
        next: { revalidate: 60 }
      });
      const { courses } = await response.json();
      
      if (!courses || courses.length === 0) return;
      
      const course = courses.find(c => c.slug === courseSlug);
      if (!course) {
        console.error('Course not found for slug:', courseSlug);
        console.log('Available courses:', courses.map(c => ({ title: c.title, slug: c.slug })));
        return;
      }
      
      console.log('Found course:', course.title);
      document.title = course.title;
      
      const titleEl = document.querySelector('.course-title');
      console.log('Title element:', titleEl, 'Setting to:', course.title);
      if (titleEl) titleEl.textContent = course.title;
      
      const imageEl = document.querySelector('.course-image');
      if (imageEl && course.image) imageEl.src = course.image;
      
      const descEl = document.querySelector('.course-description');
      if (descEl) descEl.textContent = course.description || '';
      
      const priceEl = document.querySelector('.course-price');
      if (priceEl) priceEl.textContent = course.price > 0 ? `$${course.price}` : 'Free';
      
      const includesEl = document.querySelector('.course-includes');
      if (course.label && course.label.trim() && includesEl) {
        const items = course.label.split('\n').filter(i => i.trim());
        if (items.length > 0) {
          includesEl.innerHTML = items.map(item => `<li class="flex items-center gap-3"><span class="material-symbols-outlined text-base text-primary">check_circle</span><span>${item}</span></li>`).join('');
        }
      }
      
      const learnEl = document.querySelector('.what-you-learn');
      if (course.whatYouLearn && course.whatYouLearn.trim() && learnEl) {
        const items = course.whatYouLearn.split('\n').filter(i => i.trim());
        if (items.length > 0) {
          learnEl.innerHTML = items.map(item => `<li class="flex items-start gap-3 p-3 rounded-lg bg-background-light dark:bg-gray-800/50"><span class="material-symbols-outlined text-primary text-xl">check_circle</span><span class="text-sm text-gray-800 dark:text-gray-200">${item}</span></li>`).join('');
        }
      }
      
      const nameEl = document.querySelector('.instructor-name');
      if (course.instructorName && course.instructorName.trim() && nameEl) {
        nameEl.textContent = course.instructorName;
      }
      
      const instructorTitleEl = document.querySelector('.instructor-title');
      if (course.instructorTitle && course.instructorTitle.trim() && instructorTitleEl) {
        instructorTitleEl.textContent = course.instructorTitle;
      }
      
      const bioEl = document.querySelector('.instructor-bio');
      if (course.instructorBio && course.instructorBio.trim() && bioEl) {
        bioEl.textContent = course.instructorBio;
      }
      
      const syllabusEl = document.querySelector('.course-syllabus');
      if (course.sections && course.sections.length > 0 && syllabusEl) {
        syllabusEl.innerHTML = course.sections.map((section, index) => `
          <div class="syllabus-item">
            <h4>Module ${index + 1}: ${section.title}</h4>
            ${section.description ? `<p>${section.description}</p>` : ''}
          </div>
        `).join('');
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
