(function() {
  // Don't run in iframes
  if (window.self !== window.top) return;
  
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
      if (priceEl) {
        if (course.accessType === 'free' || course.price === 0) {
          priceEl.textContent = 'Free';
        } else if (course.showComparePrice && course.comparePrice > course.price) {
          priceEl.innerHTML = `<span class="text-2xl font-bold">₹${course.price}</span> <span class="text-lg text-gray-500 line-through ml-2">₹${course.comparePrice}</span>`;
        } else {
          priceEl.textContent = `₹${course.price}`;
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
      
      if (!showInstructor) {
        // Hide the entire instructor section
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
      // If showInstructor is true but no user values, fallback values from HTML will be shown
      
      // Handle enroll button click
      const enrollBtns = document.querySelectorAll('button');
      enrollBtns.forEach(btn => {
        if (btn.textContent.includes('Enroll')) {
          // Update button text based on access type
          if (course.accessType === 'free') {
            btn.textContent = 'Enroll for Free';
          } else if (course.accessType === 'paid') {
            btn.textContent = `Enroll Now - ₹${course.price}`;
          } else if (course.accessType === 'coming-soon') {
            btn.textContent = 'Coming Soon';
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
          } else if (course.accessType === 'enrollment-closed') {
            btn.textContent = 'Enrollment Closed';
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
          }
          
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (course.accessType !== 'coming-soon' && course.accessType !== 'enrollment-closed') {
              openCoursePlayer(course);
            }
          });
        }
      });
      
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
  
  function openCoursePlayer(course) {
    if (!course.sections || course.sections.length === 0) {
      alert('This course has no content yet. Please check back later.');
      return;
    }
    
    const playerHTML = `
      <div id="course-player" class="fixed inset-0 z-50 bg-white flex" style="font-family: system-ui, -apple-system, sans-serif; min-width: 100vw;">
        <div class="bg-white border-r border-gray-200 flex flex-col" style="width: 320px; min-width: 320px; flex-shrink: 0;">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <img src="${course.image || '/learnerfast-logo.png'}" alt="Logo" class="h-12 w-12 rounded-lg object-cover" />
              <button onclick="document.getElementById('course-player').remove()" class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <h2 class="text-lg font-semibold text-gray-900 mb-2">${course.title}</h2>
            <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span class="px-2 py-1 rounded text-xs font-semibold ${course.accessType === 'free' ? 'bg-green-100 text-green-800' : course.accessType === 'paid' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}">${course.accessType === 'free' ? 'FREE' : course.accessType === 'paid' ? 'PAID' : course.accessType.toUpperCase()}</span>
              <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-500 h-2 rounded-full" style="width: 0%"></div>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto" id="sections-list">
            ${course.sections.map((section, idx) => `
              <div class="border-b border-gray-100">
                <button class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50" onclick="toggleSection(${idx})">
                  <div class="flex items-center space-x-3" style="min-width: 0; flex: 1;">
                    <div class="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-semibold" style="flex-shrink: 0;">${idx + 1}</div>
                    <span class="text-sm font-medium text-gray-900" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${section.title}</span>
                  </div>
                  <svg class="w-4 h-4 text-gray-400 section-chevron" style="flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
                <div class="section-activities hidden" id="section-${idx}">
                  ${(section.activities || []).map(activity => `
                    <div class="px-6 py-3 pl-16 flex items-center justify-between cursor-pointer hover:bg-gray-50" onclick='playActivity(${JSON.stringify(activity).replace(/'/g, "&apos;")}, "${section.title}")'>
                      <div class="flex items-center space-x-3 flex-1" style="min-width: 0;">
                        <div class="w-5 h-5 rounded-full border-2 border-gray-300" style="flex-shrink: 0;"></div>
                        <span class="text-sm text-gray-700" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${activity.title}</span>
                      </div>
                      ${activity.activity_type === 'video' ? '<div class="flex items-center space-x-1 text-xs text-gray-500" style="flex-shrink: 0;"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg><span>10 min</span></div>' : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="flex-1 flex flex-col bg-gray-50" style="min-width: 0; overflow: hidden;">
          <div class="bg-white border-b border-gray-200 px-8 py-4">
            <h1 class="text-xl font-semibold text-amber-600">${course.title}</h1>
          </div>
          <div class="flex-1" id="content-area" style="padding: 2rem; overflow: hidden;">
            <div class="text-center text-gray-500">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              <p class="text-lg">Select a lesson to start learning</p>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', playerHTML);
    
    // Auto-expand first section
    setTimeout(() => {
      if (course.sections[0] && course.sections[0].activities && course.sections[0].activities.length > 0) {
        toggleSection(0);
        playActivity(course.sections[0].activities[0], course.sections[0].title);
      }
    }, 100);
    
    window.toggleSection = (idx) => {
      const section = document.getElementById(`section-${idx}`);
      const chevron = section.previousElementSibling.querySelector('.section-chevron');
      section.classList.toggle('hidden');
      if (chevron) {
        chevron.style.transform = section.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(90deg)';
      }
    };
    
    let allActivities = [];
    let currentActivityIndex = 0;
    
    course.sections.forEach(section => {
      (section.activities || []).forEach(activity => {
        allActivities.push({ ...activity, sectionTitle: section.title });
      });
    });
    
    window.playActivity = (activity, sectionTitle) => {
      currentActivityIndex = allActivities.findIndex(a => a.id === activity.id);
      renderActivity(activity, sectionTitle);
    };
    
    window.playNextActivity = () => {
      if (currentActivityIndex < allActivities.length - 1) {
        currentActivityIndex++;
        const nextActivity = allActivities[currentActivityIndex];
        renderActivity(nextActivity, nextActivity.sectionTitle);
      } else {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
          <div class="text-center py-16">
            <svg class="w-24 h-24 mx-auto mb-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <h2 class="text-3xl font-bold text-gray-900 mb-4">Congratulations!</h2>
            <p class="text-xl text-gray-600 mb-8">You've completed all activities in this course.</p>
            <button onclick="document.getElementById('course-player').remove()" class="px-8 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-semibold">Close Course</button>
          </div>
        `;
      }
    };
    
    function renderActivity(activity, sectionTitle) {
      const contentArea = document.getElementById('content-area');
      const isLastActivity = currentActivityIndex === allActivities.length - 1;
      const nextButtonText = isLastActivity ? 'Complete' : 'Next';
      
      let embedUrl = activity.url || '';
      
      // For uploaded files, use file_url if url is empty
      if (!embedUrl && activity.file_url && activity.source === 'upload') {
        // file_url is just a filename, we need to construct proper URL
        // For now, show a message that file needs to be uploaded to a CDN/storage
        console.warn('⚠️ Uploaded file detected but no URL. File needs to be uploaded to storage:', activity.file_url);
        embedUrl = ''; // Will show error message in player
      }
      
      if (activity.activity_type === 'video') {
        if (activity.source === 'youtube' && embedUrl) {
          embedUrl = embedUrl.includes('embed') ? embedUrl : embedUrl.replace('watch?v=', 'embed/');
        } else if (activity.source === 'vimeo' && embedUrl) {
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
        console.log('📹 Rendering video iframe with URL:', embedUrl);
        playerHTML = `<div class="bg-black rounded-lg overflow-hidden" style="height: calc(100vh - 280px); width: 100%; flex-shrink: 0;">
          <iframe src="${embedUrl}" class="w-full h-full" frameborder="0" allowfullscreen allow="autoplay; encrypted-media"></iframe>
        </div>`;
      } else if (activity.activity_type === 'pdf') {
        console.log('📄 Rendering PDF iframe with URL:', embedUrl);
        if (!embedUrl) {
          playerHTML = `<div class="flex items-center justify-center bg-gray-100 rounded-lg" style="height: calc(100vh - 280px); width: 100%; flex-shrink: 0;">
            <div class="text-center p-8">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <p class="text-gray-600 text-lg mb-2">PDF file not available</p>
              <p class="text-gray-500 text-sm">Please add a URL for this PDF in the course settings</p>
            </div>
          </div>`;
        } else {
          playerHTML = `<div class="bg-white rounded-lg overflow-hidden" style="height: calc(100vh - 280px); width: 100%; flex-shrink: 0;">
            <iframe src="${embedUrl}" class="w-full h-full" frameborder="0" onload="console.log('✅ PDF iframe loaded')"></iframe>
          </div>`;
        }
      } else if (activity.activity_type === 'audio') {
        console.log('🎵 Rendering audio player with URL:', embedUrl);
        playerHTML = `<div class="flex items-center justify-center bg-gray-900 rounded-lg" style="height: calc(100vh - 280px); width: 100%; flex-shrink: 0;">
          <audio controls class="w-full max-w-2xl"><source src="${embedUrl}" /></audio>
        </div>`;
      } else if (activity.activity_type === 'presentation') {
        console.log('📊 Rendering presentation iframe with URL:', embedUrl);
        if (!embedUrl) {
          playerHTML = `<div class="flex items-center justify-center bg-gray-100 rounded-lg" style="height: calc(100vh - 280px); width: 100%; flex-shrink: 0;">
            <div class="text-center p-8">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
              <p class="text-gray-600 text-lg mb-2">Presentation file not available</p>
              <p class="text-gray-500 text-sm">Please add a URL for this presentation in the course settings</p>
            </div>
          </div>`;
        } else {
          playerHTML = `<div class="bg-white rounded-lg overflow-hidden" style="height: calc(100vh - 280px); width: 100%; flex-shrink: 0;">
            <iframe src="${embedUrl}" class="w-full h-full" frameborder="0" onload="console.log('✅ Presentation iframe loaded')"></iframe>
          </div>`;
        }
      } else {
        console.log('❓ Unknown activity type:', activity.activity_type);
        playerHTML = `<div class="flex items-center justify-center bg-gray-100 rounded-lg" style="height: calc(100vh - 280px); width: 100%; flex-shrink: 0;">
          <p class="text-gray-500">Content type: ${activity.activity_type}</p>
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
          ${playerHTML}
        </div>
      `;
    }
  }
  
  loadCourseDetail();
})();
