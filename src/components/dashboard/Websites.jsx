'use client';
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Edit, Trash2, Globe, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import CreateSiteModal from '../modals/CreateSiteModal';
import { useWebsite } from '../../contexts/WebsiteContext';
import { templateService } from '../builder/templateService';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const siteTemplates = templateService.getTemplates();

const TemplatePreview = ({ template }) => {
  const [templateHtml, setTemplateHtml] = React.useState('');
  
  React.useEffect(() => {
    const loadTemplate = async () => {
      try {
        const response = await fetch(`${template.path}index.html`);
        let html = await response.text();
        
        // Fix relative paths and force desktop viewport
        html = html
          .replace(/href="css\//g, `href="${template.path}css/`)
          .replace(/src="(?!https?:\/\/)/g, `src="${template.path}`)
          .replace(/url\("(?!https?:\/\/)/g, `url("${template.path}`)
          .replace(/url\('(?!https?:\/\/)/g, `url('${template.path}`)
          .replace(/<meta name="viewport"[^>]*>/gi, '<meta name="viewport" content="width=1366, initial-scale=1, user-scalable=no">');
        
        // Add desktop viewport if not present
        if (!html.includes('name="viewport"')) {
          html = html.replace('<head>', '<head>\n<meta name="viewport" content="width=1366, initial-scale=1, user-scalable=no">');
        }
        
        // Force desktop layout with CSS
        const desktopCSS = `<style>
          html, body { min-width: 1366px !important; width: 1366px !important; }
          * { box-sizing: border-box !important; }
          @media (max-width: 1366px) { html, body { width: 1366px !important; } }
        </style>`;
        html = html.replace('</head>', desktopCSS + '</head>');
        
        setTemplateHtml(html);
      } catch (error) {
        console.error('Failed to load template:', error);
      }
    };
    
    loadTemplate();
  }, [template]);
  
  if (!templateHtml) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <iframe 
      srcDoc={templateHtml}
      className="w-full h-full border-0 pointer-events-none origin-top-left"
      style={{ width: '366%', height: '366%', transform: 'scale(0.273)' }}
      sandbox="allow-same-origin allow-scripts"
    />
  );
};

const Websites = () => {
  return <WebsitesList />;
};

const WebsitesList = () => {
  const { sites, loading, addSite, deleteSite: deleteSiteFromContext } = useWebsite();
  const { user } = useAuth();
  const router = useRouter();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  // Delete confirmation state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, siteId: null, siteName: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Loading screen state
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  
  // Memoized sorted sites
  const sortedSites = useMemo(() => 
    sites.sort((a, b) => new Date(b.lastEdited || b.last_edited || 0) - new Date(a.lastEdited || a.last_edited || 0))
  , [sites]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    // Reset state after closing animation
    setTimeout(() => {
      setSiteName('');
      setSelectedTemplate(null);
    }, 300);
  };

  const handleCreateSite = () => {
    return new Promise((resolve) => {
      if (!selectedTemplate || !siteName.trim()) {
        toast.error('Please select a template and enter a site name.');
        resolve();
        return;
      }
      
      // Check if site name already exists
      const existingSite = sites.find(site => site.name.toLowerCase() === siteName.trim().toLowerCase());
      if (existingSite) {
        toast.error('Website with this name already exists. Please choose a different name.');
        resolve();
        return;
      }
      
      // Show loading screen
      setShowLoadingScreen(true);
      closeModal();
      
      setTimeout(async () => {
        window.currentSiteName = siteName;
        const newSite = await addSite(siteName, selectedTemplate);
        
        // Load and save the actual template content
        try {
          const response = await fetch(`${selectedTemplate.path}index.html`);
          let templateContent = await response.text();
          
          // Customize content based on category
          if (selectedTemplate.category === 'Fitness') {
            templateContent = templateContent
              .replace(/EduFlow/g, selectedTemplate.name)
              .replace(/Premium Learning Platform/g, 'Fitness & Wellness Center')
              .replace(/The Future of Learning is Here/g, 'Transform Your Body & Mind')
              .replace(/Experience next-generation education/g, 'Experience professional fitness training')
              .replace(/AI & Machine Learning Mastery/g, 'Personal Training Programs')
              .replace(/Full Stack Development Pro/g, 'Group Fitness Classes')
              .replace(/UX\/UI Design Excellence/g, 'Nutrition & Wellness')
              .replace(/🤖/g, '💪')
              .replace(/💻/g, '🏃‍♂️')
              .replace(/🎨/g, '🥗');
          }
          
          // Load additional template pages
          const additionalPages = {};
          const pageFiles = ['about.html', 'courses.html', 'contact.html', 'course-detail.html', 'signin.html', 'register.html'];
          
          for (const pageFile of pageFiles) {
            try {
              const pageResponse = await fetch(`${selectedTemplate.path}${pageFile}`);
              if (pageResponse.ok) {
                const pageContent = await pageResponse.text();
                const pageName = pageFile.replace('.html', '').replace('-', ' ');
                additionalPages[pageName] = pageContent;
              }
            } catch (pageError) {
              console.warn(`Failed to load ${pageFile}:`, pageError);
            }
          }
          
          // Process all pages to fix navigation and assets
          const processedPages = {};
          let processedContent = '';
          
          const processPage = (content, isHome = false) => {
            let processed = content
              // Clean up malformed URLs with quotes
              .replace(/src="%22([^%]+)%22"/g, 'src="$1"')
              .replace(/url\(%22([^%]+)%22\)/g, 'url($1)')
              .replace(/%22/g, '')
              // Fix relative asset paths only
              .replace(/src="(?!https?:\/\/|data:|\/|#)([^"]+)"/g, `src="${selectedTemplate.path}$1"`)
              .replace(/href="(?!https?:\/\/|#|\/|mailto:|tel:)([^"]+\.css)"/g, `href="${selectedTemplate.path}$1"`)
              .replace(/url\("(?!https?:\/\/|data:|\/|#)([^"]+)"\)/g, `url("${selectedTemplate.path}$1")`)
              .replace(/url\('(?!https?:\/\/|data:|\/|#)([^']+)'\)/g, `url('${selectedTemplate.path}$1')`)
              .replace(/url\((?!https?:\/\/|data:|\/|#|'|")([^)]+)\)/g, `url(${selectedTemplate.path}$1)`)
              // Fix navigation links
              .replace(/href="index\.html"/g, 'href="#home"')
              .replace(/href="about\.html"/g, 'href="#about"')
              .replace(/href="courses\.html"/g, 'href="#courses"')
              .replace(/href="contact\.html"/g, 'href="#contact"')
              .replace(/href="course-detail\.html"/g, 'href="#course-detail"')
              .replace(/href="signin\.html"/g, 'href="#signin"')
              .replace(/href="register\.html"/g, 'href="#register"');
            
            return processed;
          };
          
          Object.keys(additionalPages).forEach(pageName => {
            processedPages[pageName] = processPage(additionalPages[pageName]);
          });
          
          processedContent = processPage(templateContent);
          
          // Add navigation script to head section
          const navScript = `
            <script>
              // Navigation functionality for single-page app
              function showPage(pageName) {
                console.log('Navigating to:', pageName);
              }
              
              // Handle hash navigation
              window.addEventListener('hashchange', function() {
                const hash = window.location.hash.substring(1);
                console.log('Hash changed to:', hash);
              });
            </script>
          `;
          processedContent = processedContent.replace('</head>', navScript + '</head>');
          
          // Ensure we have a valid site ID before saving
          if (newSite && newSite.id) {
            const saveData = {
              pageContents: { 
                'home': processedContent,
                ...processedPages
              },
              pageData: { id: 'page-1', name: 'Home', elements: [] },
              templateId: selectedTemplate.id,
              timestamp: new Date().toISOString(),
              siteId: newSite.id,
              siteName: siteName
            };
            
            // Save to database if user is logged in
            if (user?.id) {
              try {
                await supabase
                  .from('website_builder_saves')
                  .insert({
                    site_id: newSite.id,
                    user_id: user.id,
                    page_contents: saveData.pageContents,
                    page_data: saveData.pageData,
                    template_id: selectedTemplate.id,
                    site_name: siteName
                  });
              } catch (error) {
                console.warn('Failed to save initial builder data:', error);
              }
            }
          }
        } catch (error) {
          console.error('Failed to load template:', error);
        }
        
        // Navigate to builder
        router.push(`/builder/${newSite.id}`);
        resolve();
      }, 5000);
    });
  };

  const openDeleteModal = (id, name) => {
    setDeleteModal({ isOpen: true, siteId: id, siteName: name });
    setConfirmDelete(false);
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, siteId: null, siteName: '' });
    setConfirmDelete(false);
  };

  const handleDeleteSite = () => {
    if (!confirmDelete) {
      toast.error('Please confirm deletion by checking the checkbox');
      return;
    }
    deleteSiteFromContext(deleteModal.siteId);
    toast.success('Site deleted successfully');
    closeDeleteModal();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Websites</h1>
          <p className="text-muted-foreground mt-1">Manage your course websites</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Site</span>
        </button>
      </div>

      {!loading && sortedSites.length === 0 ? (
        <div className="bg-card rounded-xl shadow-subtle border border-border p-16 text-center">
          <div className="flex justify-center items-center mx-auto w-20 h-20 bg-primary/10 rounded-full mb-6">
            <Globe className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No Websites Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first website to start building your online presence and sharing your content with the world.
          </p>
          <button 
            onClick={openModal}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Create Your First Website
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading && sortedSites.map((site) => (
          <motion.div
            key={site.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl shadow-subtle border border-border overflow-hidden transition-all hover:shadow-md hover:-translate-y-1"
          >
            <div 
              className="aspect-video bg-muted relative overflow-hidden"
              onMouseEnter={(e) => {
                const iframe = e.currentTarget.querySelector('iframe');
                if (iframe && iframe.contentWindow) {
                  iframe.scrollingDown = true;
                  iframe.scrollingUp = false;
                  
                  const scrollDown = () => {
                    if (!iframe.scrollingDown || !iframe.contentWindow || !iframe.contentWindow.document.documentElement) return;
                    const currentScroll = iframe.contentWindow.scrollY;
                    const maxScroll = iframe.contentWindow.document.documentElement.scrollHeight - iframe.contentWindow.innerHeight;
                    if (currentScroll < maxScroll) {
                      iframe.contentWindow.scrollTo(0, currentScroll + 10);
                      requestAnimationFrame(scrollDown);
                    }
                  };
                  scrollDown();
                }
              }}
              onMouseLeave={(e) => {
                const iframe = e.currentTarget.querySelector('iframe');
                if (iframe && iframe.contentWindow) {
                  iframe.scrollingDown = false;
                  iframe.scrollingUp = true;
                  const scrollUp = () => {
                    if (!iframe.scrollingUp || !iframe.contentWindow) return;
                    const currentScroll = iframe.contentWindow.scrollY;
                    if (currentScroll > 0) {
                      iframe.contentWindow.scrollTo(0, currentScroll - 15);
                      requestAnimationFrame(scrollUp);
                    } else {
                      iframe.scrollingUp = false;
                    }
                  };
                  scrollUp();
                }
              }}
            >
              {(() => {
                const template = siteTemplates.find(t => t.id === site.template_id);
                return template ? (
                  <TemplatePreview template={template} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Globe className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                );
              })()}
            </div>
            
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">{site.name}</h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    site.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {site.status}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-1">{site.url}</p>
              <p className="text-xs text-muted-foreground mb-4">
                Last edited: {site.last_edited || site.lastEdited}
                {site.has_saved_changes && <span className="ml-2 text-green-600">• Saved</span>}
              </p>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => router.push(`/builder/${site.id}`)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors font-medium"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                
                <button 
                  onClick={() => {
                    window.open(`/api/preview/${site.id}`, '_blank');
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-sm bg-accent text-accent-foreground rounded-md hover:bg-muted transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview</span>
                </button>
                
                <button
                  onClick={() => openDeleteModal(site.id, site.name)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
          ))}
        </div>
      )}

      <CreateSiteModal
        isOpen={isModalOpen}
        onClose={closeModal}
        templates={siteTemplates}
        siteName={siteName}
        setSiteName={setSiteName}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        onCreate={handleCreateSite}
      />

      {/* Loading Screen */}
      {showLoadingScreen && createPortal(
        <div className="fixed inset-0 bg-gradient-to-br from-slate-100 via-gray-50 to-blue-50 flex flex-col items-center justify-center z-[9999] overflow-hidden">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 text-center"
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Building Your Website</h1>
            <p className="text-gray-600">{siteName}</p>
          </motion.div>

          {/* Webpage Construction */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative w-96 h-64 mb-8"
          >
            {/* Webpage Frame */}
            <motion.div
              className="absolute inset-0 bg-white shadow-2xl overflow-hidden border-4 border-gray-400 rounded-lg"
              initial={{ opacity: 0.3, rotateY: -5 }}
              animate={{ opacity: 1, rotateY: 0 }}
              transition={{ duration: 2, delay: 1 }}
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
            >
              {/* Browser Bar */}
              <motion.div
                className="h-10 bg-gradient-to-b from-gray-100 to-gray-200 border-b border-gray-400 flex items-center px-4 relative shadow-sm"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 1.5 }}
              >
                <div className="flex space-x-2">
                  <motion.div 
                    className="w-4 h-4 bg-red-500 rounded-full shadow-inner border border-red-600 relative"
                    animate={{ 
                      rotate: [0, 0, 360, 360, 360, 360]
                    }}
                    transition={{ duration: 6, repeat: Infinity, delay: 2, ease: "linear", times: [0, 0.33, 0.33, 0.66, 0.66, 1] }}
                  ></motion.div>
                  <motion.div 
                    className="w-4 h-4 bg-yellow-500 rounded-full shadow-inner border border-yellow-600 relative"
                    animate={{ 
                      rotate: [0, 0, 0, 0, 360, 360]
                    }}
                    transition={{ duration: 6, repeat: Infinity, delay: 2, ease: "linear", times: [0, 0.33, 0.33, 0.66, 0.66, 1] }}
                  ></motion.div>
                  <motion.div 
                    className="w-4 h-4 bg-green-500 rounded-full shadow-inner border border-green-600 relative"
                    animate={{ 
                      rotate: [0, 0, 0, 0, 0, 360]
                    }}
                    transition={{ duration: 6, repeat: Infinity, delay: 2, ease: "linear", times: [0, 0.33, 0.33, 0.66, 0.66, 1] }}
                  ></motion.div>
                </div>
                <div className="ml-6 flex-1 h-6 bg-white rounded border border-gray-300 shadow-inner"></div>
              </motion.div>
              
              {/* Video Hero Section */}
              <motion.div
                className="h-32 bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 128, opacity: 1 }}
                transition={{ duration: 1.2, delay: 1.8 }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 2.5, duration: 0.8 }}
                >
                  <div className="w-20 h-16 bg-black/70 rounded-xl border-2 border-white/80 flex items-center justify-center backdrop-blur-sm shadow-2xl">
                    <div className="w-0 h-0 border-l-8 border-l-white border-t-6 border-b-6 border-t-transparent border-b-transparent ml-2"></div>
                  </div>
                </motion.div>
                <div className="absolute bottom-3 left-4 text-white text-sm font-medium opacity-90">Featured Content</div>
                <div className="absolute top-3 right-4 text-white/70 text-xs">HD</div>
              </motion.div>
              
              {/* Professional Content Layout */}
              <div className="p-4 space-y-4 bg-gradient-to-b from-white to-gray-50">
                {/* Navigation Pills */}
                <motion.div
                  className="flex space-x-4 mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3, duration: 0.6 }}
                >
                  <div className="px-4 py-2 bg-blue-600 text-white rounded-full text-xs font-semibold shadow-md">Home</div>
                  <div className="px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">About</div>
                  <div className="px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">Services</div>
                  <div className="px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">Contact</div>
                </motion.div>
                
                {/* Hero Text */}
                <motion.div
                  className="space-y-2 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3.2, duration: 0.8 }}
                >
                  <div className="h-8 bg-gradient-to-r from-gray-800 to-gray-700 rounded shadow-sm"></div>
                  <div className="h-4 bg-gray-400 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </motion.div>
                
                {/* Feature Cards */}
                <motion.div
                  className="grid grid-cols-3 gap-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 3.5, duration: 0.8 }}
                >
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-sm border border-gray-300"></div>
                  ))}
                </motion.div>
                
                {/* CTA Section */}
                <motion.div
                  className="flex justify-center mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 4, duration: 0.6 }}
                >
                  <div className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg text-sm font-semibold">Get Started</div>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Professional Construction Tools */}
            {/* Stationary Screwdriver on Browser Buttons */}
            <motion.div
              className="absolute -top-6 left-4 text-2xl z-30 filter drop-shadow-lg"
              animate={{ 
                x: [0, 0, 8, 8, 16, 16]
              }}
              transition={{ duration: 6, repeat: Infinity, delay: 2, ease: "linear", times: [0, 0.33, 0.33, 0.66, 0.66, 1] }}
            >
              🪛
            </motion.div>
            
            {/* Professional Chisel Shaping Right Edge */}
            <motion.div
              className="absolute top-12 -right-8 text-2xl z-30 filter drop-shadow-lg"
              animate={{ 
                rotate: [30, 45, 30],
                x: [0, -15, -10, -15, 0],
                y: [0, 30, 60, 90, 120]
              }}
              transition={{ duration: 6, repeat: Infinity, delay: 1.5, ease: "linear" }}
            >
              🪚
            </motion.div>
            
            {/* Heavy Hammer Flattening Front */}
            <motion.div
              className="absolute bottom-8 left-1/2 text-3xl transform -translate-x-1/2 z-30 filter drop-shadow-xl"
              animate={{ 
                rotate: [0, -60, 0],
                y: [0, -25, 0],
                scale: [1, 1.4, 1]
              }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 1, ease: "easeInOut" }}
            >
              🔨
            </motion.div>
            
            {/* Sequential Screwing Effects */}
            {[0, 1, 2].map((buttonIndex) => (
              [...Array(2)].map((_, sparkIndex) => (
                <motion.div
                  key={`screw-${buttonIndex}-${sparkIndex}`}
                  className="absolute w-1 h-1 bg-yellow-400 rounded-full z-20"
                  style={{
                    left: `${16 + buttonIndex * 8}px`,
                    top: '24px'
                  }}
                  animate={{
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                    x: [0, (Math.random() - 0.5) * 6],
                    y: [0, -Math.random() * 4]
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: 2 + buttonIndex * 2 + sparkIndex * 0.3,
                    ease: "easeOut"
                  }}
                />
              ))
            )).flat()}
            
            {/* Professional Hammer Impact Effects */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`hammer-${i}`}
                className="absolute w-2 h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full z-20 shadow-xl"
                style={{
                  left: `${40 + (i % 4) * 15}%`,
                  bottom: '32px'
                }}
                animate={{
                  scale: [0, 3, 0],
                  opacity: [0, 1, 0],
                  x: [0, (Math.random() - 0.5) * 40],
                  y: [0, -Math.random() * 30],
                  rotate: [0, 720]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: 1 + i * 0.15,
                  ease: "easeOut"
                }}
              />
            ))}
            
            {/* Realistic Wood Shavings from Chisel */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`shaving-${i}`}
                className="absolute bg-amber-300 z-20"
                style={{
                  width: `${Math.random() * 2 + 1}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  right: `${-12}px`,
                  top: `${48 + i * 12}px`,
                  borderRadius: '1px'
                }}
                animate={{
                  x: [0, 40 + Math.random() * 20],
                  y: [0, i * 6 + Math.random() * 10],
                  rotate: [0, Math.random() * 720],
                  opacity: [0.9, 0.4, 0],
                  scale: [1, 0.7, 0.2]
                }}
                transition={{
                  duration: 2.5 + Math.random(),
                  repeat: Infinity,
                  delay: 1.5 + i * 0.2,
                  ease: "easeOut"
                }}
              />
            ))}
            
            {/* Sequential Metal Filings */}
            {[0, 1, 2].map((buttonIndex) => (
              [...Array(3)].map((_, filingIndex) => (
                <motion.div
                  key={`metal-${buttonIndex}-${filingIndex}`}
                  className="absolute w-0.5 h-1 bg-gray-400 z-20"
                  style={{
                    left: `${16 + buttonIndex * 8}px`,
                    top: '40px'
                  }}
                  animate={{
                    y: [0, 30, 50],
                    x: [0, (Math.random() - 0.5) * 8],
                    rotate: [0, 360],
                    opacity: [0.8, 0.3, 0],
                    scale: [1, 0.5, 0.1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 2 + buttonIndex * 2 + filingIndex * 0.2,
                    ease: "easeIn"
                  }}
                />
              ))
            )).flat()}
          </motion.div>
          
          {/* Progress Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center space-y-2"
          >
            <motion.p
              className="text-gray-600 font-medium"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
Engineering your digital masterpiece...
            </motion.p>
            
            {/* Progress Bar */}
            <motion.div
              className="w-80 h-2 bg-gray-200 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4, ease: "easeInOut", delay: 1 }}
              />
            </motion.div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl shadow-lg border border-border p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Delete Website</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-foreground mb-4">
                Are you sure you want to delete <strong>"{deleteModal.siteName}"</strong>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> All saved data, edits, and customizations will be permanently deleted.
                </p>
              </div>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.checked)}
                  className="mt-1 h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-foreground">
                  I understand that all data, saved edits, and customizations will be permanently deleted
                </span>
              </label>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSite}
                disabled={!confirmDelete}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
              >
                Delete Website
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const WebsiteDesign = () => {
  const router = useRouter();
  const { addSite } = useWebsite();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    // Reset state after closing animation
    setTimeout(() => {
      setSiteName('');
      setSelectedTemplate(null);
    }, 300);
  };

  const handleCreateSite = () => {
    return new Promise((resolve) => {
      if (!selectedTemplate || !siteName.trim()) {
        toast.error('Please select a template and enter a site name.');
        resolve();
        return;
      }
      
      const toastId = toast.loading('Creating your site flavor...');
      setTimeout(() => {
        const newSite = addSite(siteName, selectedTemplate);
        toast.success('Site flavor created successfully!', { id: toastId });
        closeModal();
        router.push(`/builder/${newSite.id}`);
        resolve();
      }, 1500);
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Design</h1>
          <p className="text-muted-foreground mt-1">Create and customize your site flavors</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Create Site Flavor</span>
        </button>
      </div>

      <div className="bg-card rounded-xl shadow-subtle border border-border p-16 text-center">
        <div className="flex justify-center items-center mx-auto w-20 h-20 bg-primary/10 rounded-full mb-6">
          <Globe className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Manage Your Site Designs</h3>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          "Site Flavors" are your saved designs and templates. Create a new flavor to start building a new look for your websites.
        </p>
      </div>

      <CreateSiteModal
        isOpen={isModalOpen}
        onClose={closeModal}
        templates={siteTemplates}
        siteName={siteName}
        setSiteName={setSiteName}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        onCreate={handleCreateSite}
        title="Create site flavor"
      />
    </div>
  );
};

export default Websites;
