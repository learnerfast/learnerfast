(function() {
  const hostname = window.location.hostname;
  const websiteName = hostname.split('.')[0];
  
  async function loadCourses() {
    try {
      const response = await fetch(`https://www.learnerfast.com/api/courses/by-website?website_name=${websiteName}`, {
        next: { revalidate: 60 }
      });
      const { courses } = await response.json();
      
      const container = document.getElementById('courses-grid');
      if (!container) return;
      
      // Filter out draft courses
      const visibleCourses = courses.filter(c => c.access_type !== 'draft');
      
      if (!visibleCourses || visibleCourses.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-12"><p class="text-lg text-gray-500">No courses available yet.</p></div>';
        return;
      }
      
      container.innerHTML = visibleCourses.map(course => `
        <a href="/course-detail/${course.slug}" class="group flex flex-col overflow-hidden rounded-xl bg-white dark:bg-background-dark/50 shadow-md transition-shadow hover:shadow-xl">
          <div class="aspect-video overflow-hidden">
            <img 
              alt="${course.title}" 
              class="h-full w-full object-cover transition-transform group-hover:scale-105" 
              src="${course.image || 'https://via.placeholder.com/640x360?text=Course'}"
              loading="lazy"
            />
          </div>
          <div class="flex flex-1 flex-col p-4">
            <h3 class="font-bold text-black dark:text-white">${course.title}</h3>
            <p class="mt-2 text-sm text-black/80 dark:text-white/80 flex-grow">${course.description || ''}</p>
            <div class="mt-4 flex items-center justify-between">
              <span class="text-lg font-bold text-primary">
                ${course.access_type === 'free' ? 'Free' : 
                  course.access_type === 'paid' ? `₹${course.price || 0}` : 
                  course.access_type === 'coming-soon' ? 'Coming Soon' : 
                  course.access_type === 'enrollment-closed' ? 'Enrollment Closed' : 'Free'}
              </span>
              <button class="rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors ${
                course.access_type === 'coming-soon' || course.access_type === 'enrollment-closed' 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-primary hover:bg-primary/90'
              }">
                ${course.access_type === 'coming-soon' ? 'Coming Soon' : 
                  course.access_type === 'enrollment-closed' ? 'Closed' : 'Enroll Now'}
              </button>
            </div>
          </div>
        </a>
      `).join('');
      
      sessionStorage.setItem('courses', JSON.stringify(courses));
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCourses);
  } else {
    loadCourses();
  }
})();
