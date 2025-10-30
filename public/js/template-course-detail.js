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
      

      
      const titleEl = document.querySelector('.course-title');
      if (titleEl) titleEl.textContent = course.title;
      
      const imageEl = document.querySelector('.course-image');
      if (imageEl && course.image) imageEl.src = course.image;
      
      const descEl = document.querySelector('.course-description');
      if (descEl) descEl.textContent = course.description || '';
      
      const priceEl = document.querySelector('.course-price');
      if (priceEl) priceEl.textContent = course.price > 0 ? `$${course.price}` : 'Free';
      
      const includesEl = document.querySelector('.course-includes');
      if (includesEl) {
        const showIncludes = course.showCourseIncludes !== false;
        const hasUserValues = course.label && course.label.trim();
        const items = hasUserValues ? course.label.split('\n').filter(i => i.trim()) : [];
        
        if (showIncludes) {
          if (items.length > 0) {
            includesEl.innerHTML = items.map(item => `<li class="flex items-center gap-3"><span class="material-symbols-outlined text-base text-primary">check_circle</span><span>${item}</span></li>`).join('');
          }
          // If no user values, fallback values will be shown from HTML
        } else {
          // Hide the entire section
          const includesSection = includesEl.closest('section') || includesEl.closest('.course-includes-section');
          if (includesSection) includesSection.style.display = 'none';
        }
      }
      
      const learnSection = document.querySelector('section h3');
      if (learnSection && learnSection.textContent.includes("What you'll learn")) {
        const showLearn = course.showWhatYouLearn !== false;
        const hasUserValues = course.whatYouLearn && course.whatYouLearn.trim();
        const items = hasUserValues ? course.whatYouLearn.split('\n').filter(i => i.trim()) : [];
        
        if (showLearn) {
          const learnGrid = learnSection.nextElementSibling;
          if (learnGrid && learnGrid.classList.contains('grid')) {
            if (items.length > 0) {
              learnGrid.innerHTML = items.map(item => `<div class="flex items-start gap-4 p-4 rounded-lg bg-background-light dark:bg-gray-800/50"><span class="material-symbols-outlined text-primary mt-1">check_circle</span><p class="font-medium text-gray-800 dark:text-gray-200">${item}</p></div>`).join('');
            }
            // If no user values, fallback values will be shown from HTML
          }
        } else {
          // Hide the entire section
          const learnSectionContainer = learnSection.closest('section');
          if (learnSectionContainer) learnSectionContainer.style.display = 'none';
        }
      }
      
      const showInstructor = course.showInstructor !== false;
      const hasInstructorValues = (course.instructorName && course.instructorName.trim()) || 
                                   (course.instructorTitle && course.instructorTitle.trim()) || 
                                   (course.instructorBio && course.instructorBio.trim());
      
      if (showInstructor) {
        const nameEl = document.querySelector('.instructor-name');
        if (hasInstructorValues && course.instructorName && course.instructorName.trim() && nameEl) {
          nameEl.textContent = course.instructorName;
        }
        
        const instructorTitleEl = document.querySelector('.instructor-title');
        if (hasInstructorValues && course.instructorTitle && course.instructorTitle.trim() && instructorTitleEl) {
          instructorTitleEl.textContent = course.instructorTitle;
        }
        
        const bioEl = document.querySelector('.instructor-bio');
        if (hasInstructorValues && course.instructorBio && course.instructorBio.trim() && bioEl) {
          bioEl.textContent = course.instructorBio;
        }
        // If no user values, fallback values will be shown from HTML
      } else {
        // Hide the entire instructor section
        const instructorSection = document.querySelector('.instructor-section') || 
                                 document.querySelector('section h3')?.textContent.includes('Instructor') ? 
                                 document.querySelector('section h3').closest('section') : null;
        if (instructorSection) instructorSection.style.display = 'none';
      }
      
      const syllabusEl = document.querySelector('.course-syllabus');
      if (syllabusEl) {
        if (course.sections && course.sections.length > 0) {
          syllabusEl.innerHTML = course.sections.map((section, index) => `
            <details class="group rounded-lg border border-gray-200 dark:border-gray-700">
              <summary class="flex cursor-pointer items-center justify-between p-4 font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <span>Module ${index + 1}: ${section.title}</span>
                <span class="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
              </summary>
              ${section.description ? `<div class="border-t border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400 break-words overflow-wrap-anywhere">${section.description}</div>` : ''}
            </details>
          `).join('');
        } else {
          // Hide the entire syllabus section if no sections exist
          const syllabusSection = syllabusEl.closest('section');
          if (syllabusSection) syllabusSection.style.display = 'none';
        }
      }
      
    } catch (error) {
      console.error('Failed to load course details:', error);
    }
  }
  
  loadCourseDetail();
})();
