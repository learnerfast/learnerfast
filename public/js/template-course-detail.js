(function() {
  const hostname = window.location.hostname;
  const websiteName = hostname.split('.')[0];
  
  async function loadCourseDetail() {
    try {
      console.log('=== COURSE DETAIL DEBUG START ===');
      console.log('Current URL:', window.location.href);
      console.log('Hostname:', window.location.hostname);
      console.log('Website name:', websiteName);
      
      // Get course slug from URL
      const pathParts = window.location.pathname.split('/');
      console.log('Path parts:', pathParts);
      const courseSlug = pathParts[pathParts.length - 1].replace('.html', '');
      console.log('Course slug:', courseSlug);
      
      if (!courseSlug || courseSlug === 'course-detail') {
        console.error('❌ No course specified');
        return;
      }
      
      // Fetch courses
      const apiUrl = `https://www.learnerfast.com/api/courses/by-website?website_name=${websiteName}`;
      console.log('Fetching from API:', apiUrl);
      const response = await fetch(apiUrl);
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);
      const { courses } = data;
      console.log('Number of courses:', courses?.length || 0);
      
      // Find course by slug
      console.log('\n=== FINDING COURSE ===');
      console.log('Looking for slug:', courseSlug);
      courses.forEach((c, i) => {
        const slug = c.title.toLowerCase().replace(/\s+/g, '-');
        console.log(`Course ${i}: "${c.title}" -> slug: "${slug}"`);
      });
      
      const course = courses.find(c => 
        c.title.toLowerCase().replace(/\s+/g, '-') === courseSlug
      );
      
      if (!course) {
        console.error('❌ Course not found for slug:', courseSlug);
        return;
      }
      
      console.log('✓ Found course:', course);
      console.log('Course data:', {
        title: course.title,
        description: course.description,
        image: course.image,
        label: course.label,
        whatYouLearn: course.whatYouLearn,
        instructorName: course.instructorName,
        instructorTitle: course.instructorTitle,
        instructorBio: course.instructorBio,
        price: course.price,
        sections: course.sections
      });
      
      console.log('\n=== UPDATING PAGE ELEMENTS ===');
      
      // Update page title
      document.title = course.title;
      console.log('✓ Updated document title');
      
      // Update course title
      const titleEl = document.querySelector('.course-title');
      console.log('Title element:', titleEl);
      if (titleEl) {
        titleEl.textContent = course.title;
        console.log('✓ Updated title to:', course.title);
      } else {
        console.error('❌ Title element not found');
      }
      
      // Update course image
      const imageEl = document.querySelector('.course-image');
      console.log('Image element:', imageEl);
      console.log('Course image URL:', course.image);
      if (imageEl && course.image) {
        imageEl.src = course.image;
        console.log('✓ Updated image to:', course.image);
      } else {
        console.error('❌ Image element not found or no image URL');
      }
      
      // Update course description
      const descEl = document.querySelector('.course-description');
      console.log('Description element:', descEl);
      if (descEl) {
        descEl.textContent = course.description || '';
        console.log('✓ Updated description');
      } else {
        console.error('❌ Description element not found');
      }
      
      // Update course price
      const priceEl = document.querySelector('.course-price');
      console.log('Price element:', priceEl);
      if (priceEl) {
        priceEl.textContent = course.price > 0 ? `$${course.price}` : 'Free';
        console.log('✓ Updated price to:', course.price);
      } else {
        console.error('❌ Price element not found');
      }
      
      // Course includes
      console.log('\n=== COURSE INCLUDES ===');
      console.log('Course label:', course.label);
      const includesEl = document.querySelector('.course-includes');
      console.log('Includes element:', includesEl);
      if (course.label && course.label.trim()) {
        if (includesEl) {
          const items = course.label.split('\n').filter(i => i.trim());
          console.log('Include items:', items);
          if (items.length > 0) {
            includesEl.innerHTML = items.map(item => `<li class="flex items-center gap-3"><span class="material-symbols-outlined text-base text-primary">check_circle</span><span>${item}</span></li>`).join('');
            console.log('✓ Updated course includes with', items.length, 'items');
          }
        } else {
          console.error('❌ Course includes element not found');
        }
      } else {
        console.log('⚠️ No course includes data');
      }
      
      // What you'll learn
      console.log('\n=== WHAT YOU\'LL LEARN ===');
      console.log('What you learn data:', course.whatYouLearn);
      const learnEl = document.querySelector('.what-you-learn');
      console.log('Learn element:', learnEl);
      if (course.whatYouLearn && course.whatYouLearn.trim()) {
        if (learnEl) {
          const items = course.whatYouLearn.split('\n').filter(i => i.trim());
          console.log('Learn items:', items);
          if (items.length > 0) {
            learnEl.innerHTML = items.map(item => `<li class="flex items-start gap-3 p-3 rounded-lg bg-background-light dark:bg-gray-800/50"><span class="material-symbols-outlined text-primary text-xl">check_circle</span><span class="text-sm text-gray-800 dark:text-gray-200">${item}</span></li>`).join('');
            console.log('✓ Updated what you\'ll learn with', items.length, 'items');
          }
        } else {
          console.error('❌ What you\'ll learn element not found');
        }
      } else {
        console.log('⚠️ No what you\'ll learn data');
      }
      
      // Instructor info
      console.log('\n=== INSTRUCTOR INFO ===');
      console.log('Instructor name:', course.instructorName);
      console.log('Instructor title:', course.instructorTitle);
      console.log('Instructor bio:', course.instructorBio);
      
      const nameEl = document.querySelector('.instructor-name');
      console.log('Name element:', nameEl);
      if (course.instructorName && course.instructorName.trim()) {
        if (nameEl) {
          nameEl.textContent = course.instructorName;
          console.log('✓ Updated instructor name');
        } else {
          console.error('❌ Instructor name element not found');
        }
      } else {
        console.log('⚠️ No instructor name data');
      }
      
      const titleEl = document.querySelector('.instructor-title');
      console.log('Title element:', titleEl);
      if (course.instructorTitle && course.instructorTitle.trim()) {
        if (titleEl) {
          titleEl.textContent = course.instructorTitle;
          console.log('✓ Updated instructor title');
        } else {
          console.error('❌ Instructor title element not found');
        }
      } else {
        console.log('⚠️ No instructor title data');
      }
      
      const bioEl = document.querySelector('.instructor-bio');
      console.log('Bio element:', bioEl);
      if (course.instructorBio && course.instructorBio.trim()) {
        if (bioEl) {
          bioEl.textContent = course.instructorBio;
          console.log('✓ Updated instructor bio');
        } else {
          console.error('❌ Instructor bio element not found');
        }
      } else {
        console.log('⚠️ No instructor bio data');
      }
      
      // Course sections/syllabus
      console.log('\n=== COURSE SECTIONS ===');
      console.log('Course sections:', course.sections);
      const syllabusEl = document.querySelector('.course-syllabus');
      console.log('Syllabus element:', syllabusEl);
      if (course.sections && course.sections.length > 0) {
        if (syllabusEl) {
          syllabusEl.innerHTML = course.sections.map((section, index) => `
            <div class="syllabus-item">
              <h4>Module ${index + 1}: ${section.title}</h4>
              ${section.description ? `<p>${section.description}</p>` : ''}
            </div>
          `).join('');
          console.log('✓ Updated course sections with', course.sections.length, 'sections');
        } else {
          console.error('❌ Course syllabus element not found');
        }
      } else {
        console.log('⚠️ No course sections data');
      }
      
      console.log('=== COURSE DETAIL DEBUG END ===\n');
      
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
