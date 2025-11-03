(function() {
  if (window.self !== window.top) return;
  
  const hostname = window.location.hostname;
  const websiteName = hostname.split('.')[0];
  const pathParts = window.location.pathname.split('/');
  const courseSlug = pathParts[pathParts.length - 1].replace('.html', '');
  
  let coursesCache = sessionStorage.getItem(`courses_${websiteName}`);
  if (coursesCache) coursesCache = JSON.parse(coursesCache);
  
  const mainContent = document.querySelector('main');
  
  if (coursesCache) {
    renderCourse();
  } else if (mainContent) {
    mainContent.style.visibility = 'hidden';
  }
  
  fetch(`https://www.learnerfast.com/api/courses/by-website?website_name=${websiteName}`)
    .then(r => r.json())
    .then(data => {
      coursesCache = data.courses;
      sessionStorage.setItem(`courses_${websiteName}`, JSON.stringify(coursesCache));
      if (!mainContent || mainContent.style.visibility === 'hidden') renderCourse();
    });
  
  let supabaseLoaded = false;
  
  function loadSupabase() {
    return new Promise((resolve) => {
      if (window.supabase) {
        supabaseLoaded = true;
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.onload = () => {
        supabaseLoaded = true;
        resolve();
      };
      document.head.appendChild(script);
    });
  }
  
  loadSupabase();
  
  // Check if we should restore course player on page load
  window.addEventListener('load', () => {
    const playerState = sessionStorage.getItem('coursePlayerState');
    if (playerState) {
      try {
        const { courseSlug: savedSlug, activityIndex } = JSON.parse(playerState);
        if (savedSlug === courseSlug && coursesCache) {
          const course = coursesCache.find(c => c.slug === courseSlug);
          if (course) {
            setTimeout(() => openCoursePlayer(course, activityIndex), 500);
          }
        }
      } catch (e) {
        console.error('Failed to restore player state:', e);
      }
    }
  });
  
  function renderCourse() {
    if (!courseSlug || courseSlug === 'course-detail') return;
    if (!coursesCache || coursesCache.length === 0) return;
    
    const course = coursesCache.find(c => c.slug === courseSlug);
    if (!course) return;
    
    if (mainContent) mainContent.style.visibility = 'visible';
      
    const titleEl = document.querySelector('.course-title');
    if (titleEl) titleEl.textContent = course.title;
      
    const imageEl = document.querySelector('.course-image');
    if (imageEl && course.image) imageEl.src = course.image;
      
    const descEl = document.querySelector('.course-description');
    if (descEl) descEl.textContent = course.description || '';
      
    const priceEl = document.querySelector('.course-price');
    const comparePriceEl = priceEl?.nextElementSibling;
    
    if (priceEl) {
      if (course.access_type === 'free' || course.price === 0) {
        priceEl.textContent = 'Free';
        if (comparePriceEl && comparePriceEl.classList.contains('line-through')) {
          comparePriceEl.style.display = 'none';
        }
      } else if (course.access_type === 'coming-soon') {
        priceEl.textContent = 'Coming Soon';
        if (comparePriceEl) comparePriceEl.style.display = 'none';
      } else if (course.access_type === 'enrollment-closed') {
        priceEl.textContent = 'Enrollment Closed';
        if (comparePriceEl) comparePriceEl.style.display = 'none';
      } else {
        priceEl.textContent = `₹${course.price}`;
        if (comparePriceEl && comparePriceEl.classList.contains('line-through')) {
          if (course.showComparePrice && course.comparePrice > course.price) {
            comparePriceEl.textContent = `₹${course.comparePrice}`;
            comparePriceEl.style.display = 'block';
          } else {
            comparePriceEl.style.display = 'none';
          }
        }
      }
    }
      
    const includesEl = document.querySelector('.course-includes');
    if (includesEl) {
      const showIncludes = course.showCourseIncludes !== false;
      const hasUserValues = course.label && course.label.trim();
      const items = hasUserValues ? course.label.split('\n').filter(i => i.trim()) : [];
      
      if (showIncludes) {
        if (items.length > 0) {
          includesEl.innerHTML = items.map(item => `<li class="flex items-center gap-3"><span class="material-symbols-outlined text-base text-primary">check_circle</span><span>${item}</span></li>`).join('');
        }
      } else {
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
        }
      } else {
        const learnSectionContainer = learnSection.closest('section');
        if (learnSectionContainer) learnSectionContainer.style.display = 'none';
      }
    }
      
    const showInstructor = course.showInstructor !== false;
    const hasInstructorValues = (course.instructorName && course.instructorName.trim()) || 
                                 (course.instructorTitle && course.instructorTitle.trim()) || 
                                 (course.instructorBio && course.instructorBio.trim());
    
    if (!showInstructor) {
      const allSections = document.querySelectorAll('section');
      allSections.forEach(section => {
        const heading = section.querySelector('h3, h2');
        if (heading && heading.textContent.toLowerCase().includes('instructor')) {
          section.style.display = 'none';
        }
      });
    } else if (hasInstructorValues) {
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
    }
      
    const enrollBtns = document.querySelectorAll('button');
    enrollBtns.forEach(btn => {
      const btnText = btn.textContent.trim();
      if (btnText.includes('Enroll') || btnText.includes('Add to Cart')) {
        if (course.access_type === 'free') {
          if (btnText.includes('Enroll')) {
            btn.textContent = 'Enroll for Free';
          }
        } else if (course.access_type === 'paid') {
          if (btnText.includes('Enroll')) {
            btn.textContent = `Enroll Now - ₹${course.price}`;
          }
        } else if (course.access_type === 'coming-soon') {
          btn.textContent = 'Coming Soon';
          btn.disabled = true;
          btn.classList.add('opacity-50', 'cursor-not-allowed');
          btn.classList.remove('hover:bg-primary/90', 'hover:bg-gray-200');
        } else if (course.access_type === 'enrollment-closed') {
          btn.textContent = 'Enrollment Closed';
          btn.disabled = true;
          btn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-400');
          btn.classList.remove('bg-primary', 'hover:bg-primary/90', 'bg-gray-100', 'hover:bg-gray-200');
        }
        
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          if (course.access_type !== 'coming-soon' && course.access_type !== 'enrollment-closed') {
            if (!supabaseLoaded) await loadSupabase();
            
            const { createClient } = window.supabase || {};
            if (!createClient) {
              console.error('Supabase not loaded');
              return;
            }
            
            const supabaseClient = createClient(
              'https://bplarfqdpsgadtzzlxur.supabase.co',
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbGFyZnFkcHNnYWR0enpseHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NzMzNjgsImV4cCI6MjA3NjM0OTM2OH0.YKUf2RYypzvMlH1FiXZCBlzM3Rn8g8ZXQ6h65ESgWtk'
            );
            
            const { data: { session } } = await supabaseClient.auth.getSession();
            
            if (!session) {
              sessionStorage.setItem('returnUrl', window.location.pathname);
              window.location.href = '/signin';
            } else if (course.access_type === 'paid') {
              const { data: { user } } = await supabaseClient.auth.getUser();
              const { data: enrollment } = await supabaseClient
                .from('enrollments')
                .select('*')
                .eq('user_id', user.id)
                .eq('course_id', course.id)
                .single();
              
              if (enrollment) {
                openCoursePlayer(course);
              } else {
                btn.disabled = true;
                btn.textContent = 'Processing...';
                try {
                  const response = await fetch('https://www.learnerfast.com/api/payment/initiate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      courseId: course.id,
                      userId: user.id,
                      amount: course.price,
                      courseName: course.title
                    })
                  });
                  
                  if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                  }
                  
                  const data = await response.json();
                  if (data.success && data.checkoutUrl) {
                    window.location.href = data.checkoutUrl;
                  } else {
                    btn.disabled = false;
                    btn.textContent = `Enroll Now - ₹${course.price}`;
                    alert(data.error || 'Payment initiation failed. Please try again.');
                  }
                } catch (error) {
                  btn.disabled = false;
                  btn.textContent = `Enroll Now - ₹${course.price}`;
                  console.error('Payment error:', error);
                  alert('Payment service unavailable. Please try again later.');
                }
              }
            } else if (course.access_type === 'free') {
              openCoursePlayer(course);
            }
          }
        });
      }
    });
      
    const syllabusEl = document.querySelector('.course-syllabus');
    if (syllabusEl) {
      if (course.sections && course.sections.length > 0) {
        syllabusEl.innerHTML = course.sections.map((section, index) => {
          const activityCount = (section.activities || []).length;
          const activityText = activityCount === 1 ? '1 lesson' : `${activityCount} lessons`;
          return `
          <details class="group rounded-lg border border-gray-200 dark:border-gray-700">
            <summary class="flex cursor-pointer items-center justify-between p-4 font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <div class="flex-1">
                <div class="font-semibold text-gray-900 dark:text-gray-100">Module ${index + 1}: ${section.title}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">${activityText}</div>
              </div>
              <span class="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div class="border-t border-gray-200 dark:border-gray-700">
              ${section.description ? `<div class="p-4 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30">${section.description}</div>` : ''}
              ${activityCount > 0 ? `
                <ul class="divide-y divide-gray-100 dark:divide-gray-700">
                  ${(section.activities || []).map(activity => {
                    const icon = activity.activity_type === 'video' ? 'play_circle' : 
                                activity.activity_type === 'pdf' ? 'description' :
                                activity.activity_type === 'audio' ? 'headphones' :
                                activity.activity_type === 'presentation' ? 'slideshow' : 'article';
                    return `
                      <li class="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex items-center gap-3">
                        <span class="material-symbols-outlined text-gray-400 text-base">${icon}</span>
                        <span class="text-sm text-gray-700 dark:text-gray-300">${activity.title}</span>
                      </li>
                    `;
                  }).join('')}
                </ul>
              ` : ''}
            </div>
          </details>
        `;
        }).join('');
      } else {
        const syllabusSection = syllabusEl.closest('section');
        if (syllabusSection) syllabusSection.style.display = 'none';
      }
    }
    

  }
  
  async function openCoursePlayer(course, startActivityIndex = 0) {
    // Remove existing player if present
    const existingPlayer = document.getElementById('course-player');
    if (existingPlayer) {
      existingPlayer.remove();
    }
    
    // Save player state
    sessionStorage.setItem('coursePlayerState', JSON.stringify({
      courseSlug: course.slug,
      activityIndex: startActivityIndex
    }));
    console.log('Opening course player with course:', course);
    console.log('Sections:', course.sections);
    if (course.sections && course.sections.length > 0) {
      course.sections.forEach((section, idx) => {
        console.log(`Section ${idx}:`, section.title, 'Activities:', section.activities);
      });
    }
    if (!course.sections || course.sections.length === 0) {
      alert('This course has no content yet. Please check back later.');
      return;
    }
    
    // Enroll user in course
    try {
      const { createClient } = window.supabase;
      const supabaseClient = createClient(
        'https://bplarfqdpsgadtzzlxur.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbGFyZnFkcHNnYWR0enpseHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NzMzNjgsImV4cCI6MjA3NjM0OTM2OH0.YKUf2RYypzvMlH1FiXZCBlzM3Rn8g8ZXQ6h65ESgWtk'
      );
      
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        await supabaseClient.from('enrollments').upsert({
          user_id: user.id,
          course_id: course.id,
          enrolled_at: new Date().toISOString()
        }, { onConflict: 'user_id,course_id' });
        
        // Update website_users enrolled_courses count
        const originalEmail = user.user_metadata?.original_email || user.email;
        if (originalEmail && websiteName) {
          const { data: webUser } = await supabaseClient.from('website_users').select('enrolled_courses').eq('email', originalEmail).eq('website_name', websiteName).single();
          if (webUser) {
            await supabaseClient.from('website_users').update({ enrolled_courses: (webUser.enrolled_courses || 0) + 1 }).eq('email', originalEmail).eq('website_name', websiteName);
          }
        }
      }
    } catch (error) {
      console.error('Enrollment error:', error);
    }
    
    const playerHTML = `
      <div id="course-player" class="fixed inset-0 z-50 bg-white flex" style="font-family: system-ui, -apple-system, sans-serif; min-width: 100vw;">
        <div class="bg-white border-r border-gray-200 flex flex-col" style="width: 320px; min-width: 320px; flex-shrink: 0;">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <img src="${course.image || '/learnerfast-logo.png'}" alt="Logo" class="h-12 w-12 rounded-lg object-cover" />
              <button onclick="sessionStorage.removeItem('coursePlayerState'); document.getElementById('course-player').remove()" class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <h2 class="text-lg font-semibold text-gray-900 mb-2">${course.title}</h2>
            <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span class="px-2 py-1 rounded text-xs font-semibold ${course.access_type === 'free' ? 'bg-green-100 text-green-800' : course.access_type === 'paid' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}">${course.access_type === 'free' ? 'FREE' : course.access_type === 'paid' ? 'PAID' : (course.access_type || 'FREE').toUpperCase()}</span>
              <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-500 h-2 rounded-full progress-bar" style="width: 0%"></div>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto" id="sections-list">
            ${course.sections.map((section, idx) => {
              const activities = Array.isArray(section.activities) ? section.activities : [];
              return `
              <div class="border-b border-gray-100">
                <button class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50" onclick="toggleSection(${idx})">
                  <div class="flex items-center space-x-3" style="min-width: 0; flex: 1;">
                    <div class="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-semibold" style="flex-shrink: 0;">${idx + 1}</div>
                    <span class="text-sm font-medium text-gray-900" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${section.title}</span>
                  </div>
                  <svg class="w-4 h-4 text-gray-400 section-chevron" style="flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
                <div class="section-activities hidden" id="section-${idx}">
                  ${activities.map((activity, actIdx) => {
                    const icon = activity.activity_type === 'video' ? '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>' :
                                activity.activity_type === 'pdf' ? '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z"/><path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>' :
                                activity.activity_type === 'audio' ? '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/></svg>' :
                                activity.activity_type === 'presentation' ? '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clip-rule="evenodd"/></svg>' :
                                '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/></svg>';
                    return `
                    <div class="px-6 py-3 pl-16 flex items-center justify-between cursor-pointer hover:bg-gray-50 activity-item" data-activity-id="${activity.id}" onclick='playActivity(${JSON.stringify(activity).replace(/'/g, "&apos;")}, "${section.title}")'>
                      <div class="flex items-center space-x-3 flex-1" style="min-width: 0;">
                        <div class="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center" style="flex-shrink: 0;">
                          <div class="w-2 h-2 rounded-full bg-gray-300"></div>
                        </div>
                        <div class="flex items-center space-x-2 flex-1" style="min-width: 0;">
                          <span class="text-gray-500" style="flex-shrink: 0;">${icon}</span>
                          <span class="text-sm text-gray-700" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${activity.title}</span>
                        </div>
                      </div>
                    </div>
                  `;
                  }).join('')}
                </div>
              </div>
            `;
            }).join('')}
          </div>
        </div>
        <div class="flex-1 flex flex-col bg-gray-50" style="min-width: 0; overflow: hidden;">
          <div class="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-center">
            <h1 class="text-xl font-semibold text-amber-600">${course.title}</h1>
          </div>
          <div class="flex-1" id="content-area" style="padding: 2rem; overflow: auto; display: flex; flex-direction: column;">
            <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
              <div class="text-center text-gray-500">
                <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                <p class="text-lg">Select a lesson to start learning</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', playerHTML);
    
    window.toggleSection = (idx) => {
      const section = document.getElementById(`section-${idx}`);
      const chevron = section.previousElementSibling.querySelector('.section-chevron');
      section.classList.toggle('hidden');
      if (chevron) {
        chevron.style.transform = section.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(90deg)';
      }
    };
    
    window.allActivities = [];
    window.currentActivityIndex = 0;
    
    course.sections.forEach(section => {
      const activities = Array.isArray(section.activities) ? section.activities : [];
      activities.forEach(activity => {
        window.allActivities.push({ ...activity, sectionTitle: section.title });
      });
    });
    
    // Auto-expand first section and restore activity
    setTimeout(() => {
      if (course.sections[0] && course.sections[0].activities && course.sections[0].activities.length > 0) {
        toggleSection(0);
        if (startActivityIndex > 0 && window.allActivities[startActivityIndex]) {
          playActivity(window.allActivities[startActivityIndex], window.allActivities[startActivityIndex].sectionTitle);
        } else {
          playActivity(course.sections[0].activities[0], course.sections[0].title);
        }
      }
    }, 100);
    
    console.log('📚 Total activities loaded:', window.allActivities.length);
    console.log('Activities:', window.allActivities);
    
    window.playActivity = (activity, sectionTitle) => {
      window.currentActivityIndex = window.allActivities.findIndex(a => a.id === activity.id);
      sessionStorage.setItem('coursePlayerState', JSON.stringify({
        courseSlug: course.slug,
        activityIndex: window.currentActivityIndex
      }));
      updateSidebarHighlight();
      renderActivity(activity, sectionTitle);
    };
    
    function updateSidebarHighlight() {
      document.querySelectorAll('.activity-item').forEach(item => {
        item.classList.remove('bg-amber-50', 'border-l-4', 'border-amber-500');
        const checkbox = item.querySelector('.w-5.h-5 > div');
        if (checkbox) {
          checkbox.classList.remove('bg-amber-500');
          checkbox.classList.add('bg-gray-300');
        }
      });
      
      const currentActivity = window.allActivities[window.currentActivityIndex];
      const activeItem = document.querySelector(`[data-activity-id="${currentActivity.id}"]`);
      if (activeItem) {
        activeItem.classList.add('bg-amber-50', 'border-l-4', 'border-amber-500');
        const checkbox = activeItem.querySelector('.w-5.h-5 > div');
        if (checkbox) {
          checkbox.classList.remove('bg-gray-300');
          checkbox.classList.add('bg-amber-500');
        }
      }
    }
    
    window.playNextActivity = () => {
      if (window.currentActivityIndex < window.allActivities.length - 1) {
        window.currentActivityIndex++;
        const nextActivity = window.allActivities[window.currentActivityIndex];
        updateSidebarHighlight();
        renderActivity(nextActivity, nextActivity.sectionTitle);
      } else {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
          <div class="text-center py-16">
            <svg class="w-24 h-24 mx-auto mb-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <h2 class="text-3xl font-bold text-gray-900 mb-4">Congratulations!</h2>
            <p class="text-xl text-gray-600 mb-8">You've completed all activities in this course.</p>
            <button onclick="sessionStorage.removeItem('coursePlayerState'); document.getElementById('course-player').remove()" class="px-8 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-semibold">Close Course</button>
          </div>
        `;
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) progressBar.style.width = '100%';
      }
    };
    
    function renderActivity(activity, sectionTitle) {
      const contentArea = document.getElementById('content-area');
      const isLastActivity = window.currentActivityIndex === window.allActivities.length - 1;
      const nextButtonText = isLastActivity ? 'Complete' : 'Next';
      
      let embedUrl = activity.url || activity.file_url || '';
      
      // For uploaded files, construct proper URL if file_url exists
      if (!activity.url && activity.file_url) {
        // If file_url is a full URL, use it directly
        if (activity.file_url.startsWith('http://') || activity.file_url.startsWith('https://')) {
          embedUrl = activity.file_url;
        } else {
          // If it's a relative path or filename, construct URL
          // Assuming files are stored in a public uploads directory
          embedUrl = activity.file_url.startsWith('/') ? activity.file_url : `/uploads/${activity.file_url}`;
        }
      }
      
      if (activity.activity_type === 'video') {
        // Handle iframe embed codes for all sources
        if (embedUrl.includes('<iframe')) {
          const iframeMatch = embedUrl.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/i);
          if (iframeMatch) {
            embedUrl = iframeMatch[1];
          }
        } else if (activity.source === 'youtube' && embedUrl) {
          embedUrl = embedUrl.includes('embed') ? embedUrl : embedUrl.replace('watch?v=', 'embed/');
        } else if (activity.source === 'vimeo' && embedUrl && !embedUrl.includes('player.vimeo.com')) {
          const vimeoId = embedUrl.match(/vimeo\.com\/(\d+)/);
          embedUrl = vimeoId ? `https://player.vimeo.com/video/${vimeoId[1]}` : embedUrl;
        }
      }
      
      console.log('🎬 Playing Activity:', {
        title: activity.title,
        type: activity.activity_type,
        url: activity.url,
        file_url: activity.file_url,
        embedUrl: embedUrl,
        source: activity.source
      });
      
      const activityLabel = activity.activity_type === 'video' ? 'Video Lesson (10 Min)' :
                           activity.activity_type === 'pdf' ? 'PDF Document' :
                           activity.activity_type === 'audio' ? 'Audio Lesson' :
                           activity.activity_type === 'presentation' ? 'Presentation' : 'Content';
      
      let playerHTML = '';
      if (activity.activity_type === 'video') {
        if (!embedUrl) {
          playerHTML = `<div class="flex items-center justify-center bg-gray-100 rounded-lg" style="width: 100%; height: calc(100vh - 240px);">
            <div class="text-center p-8">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              <p class="text-gray-600 text-lg mb-2">Video not available</p>
              <p class="text-gray-500 text-sm">Please add a video URL in the course settings</p>
            </div>
          </div>`;
        } else if (['script', 'embed', 'iframe'].includes(activity.source) && embedUrl.includes('<iframe')) {
          // Extract iframe from embed code and ensure proper styling
          const iframeMatch = embedUrl.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/i);
          if (iframeMatch) {
            const iframeSrc = iframeMatch[1];
            playerHTML = `<div class="bg-black rounded-lg" style="width: 100%; height: calc(100vh - 240px); overflow: hidden;">
              <iframe src="${iframeSrc}" style="width: 100%; height: 100%; border: 0;" allowfullscreen allow="autoplay; encrypted-media; picture-in-picture"></iframe>
            </div>`;
          } else {
            playerHTML = `<div class="bg-black rounded-lg" style="width: 100%; height: calc(100vh - 240px); overflow: hidden;">
              ${embedUrl}
            </div>`;
          }
        } else {
          playerHTML = `<div class="bg-black rounded-lg" style="width: 100%; height: calc(100vh - 240px); overflow: hidden;">
            <iframe src="${embedUrl}" style="width: 100%; height: 100%; border: 0;" allowfullscreen allow="autoplay; encrypted-media; picture-in-picture"></iframe>
          </div>`;
        }
      } else if (activity.activity_type === 'pdf') {
        if (!embedUrl) {
          playerHTML = `<div class="flex items-center justify-center bg-gray-100 rounded-lg" style="width: 100%; height: calc(100vh - 240px);">
            <div class="text-center p-8">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <p class="text-gray-600 text-lg mb-2">PDF file not available</p>
              <p class="text-gray-500 text-sm">Please add a PDF URL in the course settings</p>
            </div>
          </div>`;
        } else {
          let pdfUrl = embedUrl;
          // Handle Google Drive URLs
          if (embedUrl.includes('drive.google.com')) {
            if (!embedUrl.includes('/preview')) {
              pdfUrl = embedUrl.replace('/view', '/preview');
            }
          }
          // Use PDF.js viewer for better compatibility with local files
          const viewerUrl = pdfUrl.startsWith('http') ? pdfUrl : `https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + pdfUrl)}&embedded=true`;
          playerHTML = `<iframe src="${viewerUrl}" style="width: 100%; height: calc(100vh - 240px); border: 0; border-radius: 0.5rem;" onload="console.log('✅ PDF loaded')"></iframe>`;
        }
      } else if (activity.activity_type === 'audio') {
        if (!embedUrl) {
          playerHTML = `<div class="flex items-center justify-center bg-gray-100 rounded-lg" style="width: 100%; height: calc(100vh - 240px);">
            <div class="text-center p-8">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
              <p class="text-gray-600 text-lg mb-2">Audio file not available</p>
              <p class="text-gray-500 text-sm">Please add an audio URL in the course settings</p>
            </div>
          </div>`;
        } else {
          playerHTML = `<div class="flex items-center justify-center bg-gray-900 rounded-lg" style="width: 100%; height: 400px;">
            <audio controls class="w-full max-w-2xl" style="filter: invert(1);"><source src="${embedUrl}" type="audio/mpeg" /></audio>
          </div>`;
        }
      } else if (activity.activity_type === 'presentation') {
        if (!embedUrl) {
          playerHTML = `<div class="flex items-center justify-center bg-gray-100 rounded-lg" style="width: 100%; height: calc(100vh - 240px);">
            <div class="text-center p-8">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
              <p class="text-gray-600 text-lg mb-2">Presentation file not available</p>
              <p class="text-gray-500 text-sm">Please add a presentation URL in the course settings</p>
            </div>
          </div>`;
        } else {
          playerHTML = `<iframe src="${embedUrl}" style="width: 100%; height: calc(100vh - 240px); border: 0; border-radius: 0.5rem;" allowfullscreen></iframe>`;
        }
      } else {
        playerHTML = `<div class="flex items-center justify-center bg-gray-100 rounded-lg" style="width: 100%; height: calc(100vh - 240px);">
          <div class="text-center p-8">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <p class="text-gray-600 text-lg mb-2">Content type not supported</p>
            <p class="text-gray-500 text-sm">Type: ${activity.activity_type}</p>
          </div>
        </div>`;
      }
      
      contentArea.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
          <div class="flex items-center justify-between mb-4" style="flex-shrink: 0;">
            <div style="min-width: 0; flex: 1; margin-right: 1rem;">
              <h2 class="text-3xl font-bold text-gray-900 mb-2" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${activity.title}</h2>
              <p class="text-gray-600" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${sectionTitle} • ${activityLabel}</p>
            </div>
            <button onclick="playNextActivity()" class="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-semibold flex items-center space-x-2" style="flex-shrink: 0;">
              <span>${nextButtonText}</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
          <div style="flex: 1; min-height: 0;">${playerHTML}</div>
        </div>
      `;
      
      const progressPercent = ((window.currentActivityIndex + 1) / window.allActivities.length) * 100;
      const progressBar = document.querySelector('.progress-bar');
      if (progressBar) {
        const currentWidth = parseFloat(progressBar.style.width) || 0;
        if (progressPercent > currentWidth) {
          progressBar.style.width = progressPercent + '%';
        }
      }
    }
  }
})();
