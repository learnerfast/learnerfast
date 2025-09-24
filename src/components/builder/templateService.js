// Template service to load and manage templates from the templates folder
export const templateService = {
  // Get all available templates
  getTemplates: () => {
    return [
      {
        id: 'modern-minimal',
        name: 'Modern Minimal',
        category: 'Education',
        thumbnail: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=300&h=200&fit=crop',
        path: '/templates/modern-minimal/',
        indexFile: 'index.html',
        courseDetailFile: 'course-detail.html',
        description: 'Clean, minimal design with focus on typography and simplicity'
      },
      {
        id: 'creative-pro',
        name: 'Creative Pro',
        category: 'Education',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=200&fit=crop',
        path: '/templates/creative-pro/',
        indexFile: 'index.html',
        courseDetailFile: 'course-detail.html',
        description: 'Creative course marketplace design'
      },
      {
        id: 'academic-pro',
        name: 'Academic Pro',
        category: 'Education',
        thumbnail: 'https://images.unsplash.com/photo-1562774053-701939374585?w=300&h=200&fit=crop',
        path: '/templates/academic-pro/',
        indexFile: 'index.html',
        courseDetailFile: 'course-detail.html',
        description: 'Professional academic course platform'
      },
      {
        id: 'fitness-gym',
        name: 'Elite Fitness Academy',
        category: 'Fitness',
        thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=200&fit=crop',
        path: '/templates/fitness-gym/',
        indexFile: 'index.html',
        courseDetailFile: 'course-detail.html',
        description: 'Professional strength training academy with dark theme and vertical layout'
      },
      {
        id: 'fitness-personal',
        name: 'FitCoach Pro',
        category: 'Fitness',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
        path: '/templates/fitness-personal/',
        indexFile: 'index.html',
        courseDetailFile: 'course-detail.html',
        description: 'Personal training services with organic green theme and asymmetric layout'
      },
      {
        id: 'fitness-yoga',
        name: 'Mindful Movement Studio',
        category: 'Fitness',
        thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop',
        path: '/templates/fitness-yoga/',
        indexFile: 'index.html',
        courseDetailFile: 'course-detail.html',
        description: 'Yoga and wellness studio with ethereal purple theme and circular masonry layout'
      },
      {
        id: 'ngo-charity',
        name: 'HopeForward',
        category: 'NGO',
        thumbnail: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&h=200&fit=crop',
        path: '/templates/ngo-charity/',
        indexFile: 'index.html',
        courseDetailFile: 'course-detail.html',
        description: 'Inspiring charity and education NGO template'
      },
      {
        id: 'ngo-healthcare',
        name: 'HealthReach',
        category: 'NGO',
        thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=200&fit=crop',
        path: '/templates/ngo-healthcare/',
        indexFile: 'index.html',
        courseDetailFile: 'course-detail.html',
        description: 'Professional healthcare NGO template'
      },
      {
        id: 'ngo-environment',
        name: 'EcoGuardian',
        category: 'NGO',
        thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop',
        path: '/templates/ngo-environment/',
        indexFile: 'index.html',
        courseDetailFile: 'course-detail.html',
        description: 'Environmental conservation NGO template'
      },
      {
        id: 'finance-investment',
        name: 'WealthMaster',
        category: 'Financial',
        thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300&h=200&fit=crop',
        path: '/templates/finance-investment/',
        indexFile: 'index.html',
        courseDetailFile: 'course-detail.html',
        description: 'Professional investment education platform'
      },
      {
        id: 'finance-banking',
        name: 'BankPro Academy',
        category: 'Financial',
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200&fit=crop',
        path: '/templates/finance-banking/',
        indexFile: 'index.html',
        courseDetailFile: 'course-detail.html',
        description: 'Banking and finance career training template'
      },
      {
        id: 'finance-crypto',
        name: 'CryptoLearn',
        category: 'Financial',
        thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=300&h=200&fit=crop',
        path: '/templates/finance-crypto/',
        indexFile: 'index.html',
        courseDetailFile: 'course-detail.html',
        description: 'Cryptocurrency and blockchain education platform'
      }
    ];
  },

  // Load template content
  loadTemplate: async (templateId, pageType = 'index') => {
    const templates = templateService.getTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const fileName = pageType === 'course-detail' ? template.courseDetailFile : template.indexFile;
    
    try {
      const response = await fetch(`${template.path}${fileName}`);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.statusText}`);
      }
      const content = await response.text();
      return { template, content };
    } catch (error) {
      console.error('Error loading template:', error);
      throw error;
    }
  },

  // Get course detail URL for a template
  getCourseDetailUrl: (templateId) => {
    const templates = templateService.getTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      return null;
    }
    
    return `${template.path}${template.courseDetailFile}`;
  }
};
