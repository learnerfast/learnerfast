(function() {
  const hostname = window.location.hostname;
  const websiteName = hostname.split('.')[0];
  let coursesCache = null;
  
  async function loadHomeCourses() {
    const container = document.getElementById('home-courses-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    try {
      if (coursesCache) {
        renderCourses(coursesCache);
        return;
      }
      
      const response = await fetch(`https://www.learnerfast.com/api/courses/by-website?website_name=${websiteName}`);
      const { courses } = await response.json();
      coursesCache = courses;
      renderCourses(courses);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  }
  
  function renderCourses(courses) {
    const container = document.getElementById('home-courses-grid');
    if (courses && courses.length > 0) {
      container.innerHTML = courses.slice(0, 3).map(course => `
        <a href="/course-detail/${course.slug}" class="group flex flex-col overflow-hidden rounded-xl bg-white dark:bg-background-dark/50 shadow-md transition-shadow hover:shadow-xl">
          <div class="aspect-video overflow-hidden">
            <img 
              alt="${course.title}" 
              class="h-full w-full object-cover transition-transform group-hover:scale-105" 
              src="${course.image || 'https://via.placeholder.com/640x360?text=Course'}"
              loading="eager"
            />
          </div>
          <div class="flex flex-1 flex-col p-4">
            <h3 class="font-bold text-black dark:text-white">${course.title}</h3>
            <p class="mt-2 text-sm text-black/80 dark:text-white/80 flex-grow line-clamp-2">${course.description || ''}</p>
            <div class="mt-4 flex items-center justify-between">
              <span class="text-lg font-bold text-primary">
                ${course.access_type === 'free' ? 'Free' : 
                  course.access_type === 'paid' ? `₹${course.price || 0}` : 
                  course.access_type === 'coming-soon' ? 'Coming Soon' : 'Free'}
              </span>
              <button class="rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors ${
                course.access_type === 'coming-soon' ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'
              }">
                ${course.access_type === 'coming-soon' ? 'Coming Soon' : 'Enroll Now'}
              </button>
            </div>
          </div>
        </a>
      `).join('');
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHomeCourses);
  } else {
    loadHomeCourses();
  }
})();
