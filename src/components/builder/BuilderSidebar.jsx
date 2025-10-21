import React, { useState } from 'react';
import { FileText, Filter, MessageCircle, BookOpen, Plus, Search, ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen, File, Layers, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuilder } from '../../contexts/BuilderContext';
import { templateService } from './templateService';

const TABS = [
  { id: 'pages', name: 'Pages', icon: FileText },
  { id: 'funnels', name: 'Funnels', icon: Filter },
  { id: 'popups', name: 'Popups', icon: MessageCircle },
  { id: 'blog', name: 'Blog', icon: BookOpen },
];

const pageGroups = [
  {
    name: 'Website Pages',
    count: 7,
    pages: ['Home', 'About', 'Contact', 'Courses', 'Course Detail', 'Register', 'Sign In']
  }
];

const AddNewMenu = ({ isOpen, onClose }) => {
  const addOptions = [
    {
      icon: File,
      title: 'New Page',
      description: 'Create a new page for your website',
      action: () => {}
    },
    {
      icon: FileText,
      title: 'New Post',
      description: 'Create a new blog post or article',
      action: () => {}
    },
    {
      icon: MessageCircle,
      title: 'New Popup',
      description: 'Create a popup or modal window',
      action: () => {}
    },
    {
      icon: Filter,
      title: 'New Funnel',
      description: 'Create a sales or conversion funnel',
      action: () => {}
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="p-3 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-800">Add New</h4>
        <p className="text-xs text-gray-500 mt-1">Create a new page for your website</p>
      </div>
      <div className="p-2">
        {addOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => {
              option.action();
              onClose();
            }}
            className="w-full flex items-start space-x-3 p-3 rounded-md hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex-shrink-0 mt-0.5">
              <option.icon className="h-4 w-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">{option.title}</p>
              <p className="text-xs text-gray-500 mt-1">{option.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const AccordionItem = ({ name, count, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left p-2 rounded-md hover:bg-gray-100 transition-colors"
      >
        <span className="text-sm font-medium text-gray-800">{name}</span>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{count}</span>
          {isOpen ? <ChevronDown className="h-3 w-3 text-gray-500" /> : <ChevronRight className="h-3 w-3 text-gray-500" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pl-4 mt-1 space-y-1"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BuilderSidebar = () => {
  const [activeTab, setActiveTab] = useState('pages');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const {
    isSidebarCollapsed,
    toggleSidebar,
    currentPage,
    switchPage,
    activeMode,
    switchMode,
    pageContents,
    setPageContents,
    currentTemplate
  } = useBuilder();

  // Handle animation state
  React.useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [isSidebarCollapsed]);

  const filteredGroups = pageGroups.map(group => ({
    ...group,
    pages: group.pages.filter(page =>
      page.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.pages.length > 0 ||
    searchQuery === ''
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="absolute top-0 left-0 h-full z-20 bg-white border-r border-gray-200 flex flex-col shadow-lg w-64"
    >
      <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">

              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Pages</h2>
                <button onClick={() => switchMode(null)} className="text-gray-500 hover:text-gray-800">
                  <X className="h-5 w-5" />
                </button>
              </div>


              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for a page"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="px-4 pb-4">
              {activeTab === 'pages' && (
                <div className="space-y-1">
                  {filteredGroups.map(group => (
                    <AccordionItem
                      key={group.name}
                      name={group.name}
                      count={group.count}
                      defaultOpen={true}
                    >
                      <div className="space-y-1">
                        {group.pages.length > 0 ? group.pages.map(page => {
                          // Create proper page slugs
                          let pageSlug;
                          switch(page) {
                            case 'Home': pageSlug = 'home'; break;
                            case 'About': pageSlug = 'about'; break;
                            case 'Contact': pageSlug = 'contact'; break;
                            case 'Courses': pageSlug = 'courses'; break;
                            case 'Course Detail': pageSlug = 'coursedetail'; break;
                            case 'Register': pageSlug = 'register'; break;
                            case 'Sign In': pageSlug = 'signin'; break;

                            default: pageSlug = page.toLowerCase().replace(/\s+/g, '');
                          }
                          const isCurrentPage = currentPage === pageSlug;
                          return (
                            <button
                              key={page}
                              onClick={() => {
                                if (isAnimating) return; // Prevent clicks during animation
                                
                                // Save current page content before switching
                                const iframe = document.querySelector('iframe');
                                if (iframe && iframe.contentDocument) {
                                  const currentHTML = iframe.contentDocument.documentElement.outerHTML;
                                  setPageContents(prev => ({
                                    ...prev,
                                    [currentPage]: currentHTML
                                  }));
                                }
                                
                                switchPage(pageSlug);
                                
                                // Delay content loading to ensure smooth transition
                                setTimeout(() => {
                                  // Check if we have saved content for this page
                                  if (pageContents[pageSlug]) {
                                    // Load saved content
                                    if (window.updateTemplateContent) {
                                      window.updateTemplateContent(pageContents[pageSlug]);
                                    }
                                  } else {
                                    // Load original template page
                                    const templateId = currentTemplate || 'modern-minimal';
                                    
                                    // Map page names to template page types
                                    const pageTypeMap = {
                                      'home': 'index',
                                      'about': 'about',
                                      'contact': 'contact',
                                      'courses': 'courses',
                                      'coursedetail': 'course-detail',
                                      'register': 'register',
                                      'signin': 'signin',
                                      'payment': 'payment',
                                      'checkout': 'checkout'
                                    };
                                    
                                    
                                    const pageType = pageTypeMap[pageSlug] || 'index';
                                    
                                    templateService.loadTemplate(templateId, pageType)
                                      .then(({ template, content }) => {
                                        const processedContent = content
                                          .replace(/src="(?!https?:\/\/)/g, `src="${template.path}`)
                                          .replace(/href="(?!https?:\/\/)/g, `href="${template.path}`)
                                          .replace(/url\("(?!https?:\/\/)/g, `url("${template.path}`)
                                          .replace(/url\('(?!https?:\/\/)/g, `url('${template.path}`);
                                        
                                        if (window.updateTemplateContent) {
                                          window.updateTemplateContent(processedContent);
                                        }
                                      })
                                      .catch(error => {});
                                  }
                                }, 100); // Small delay to ensure smooth transition
                              }}
                              disabled={isAnimating}
                              className={`w-full text-left p-2 text-sm rounded-md transition-colors ${
                                isCurrentPage
                                  ? 'bg-primary-100 text-primary-700 font-medium'
                                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                              } ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className="flex items-center space-x-2">
                                <File className={`h-3 w-3 ${
                                  isCurrentPage ? 'text-primary-500' : 'text-gray-400'
                                }`} />
                                <span>{page}</span>
                                {isCurrentPage && (
                                  <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full"></div>
                                )}
                              </div>
                            </button>
                          );
                        }) : (
                          <p className="p-2 text-sm text-gray-400 italic">
                            {searchQuery ? 'No matching pages found.' : 'No pages in this group.'}
                          </p>
                        )}
                      </div>
                    </AccordionItem>
                  ))}
                </div>
              )}

              {activeTab !== 'pages' && (
                <div className="text-center py-16 text-gray-500">
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                      {activeTab === 'funnels' && <Filter className="h-6 w-6" />}
                      {activeTab === 'popups' && <MessageCircle className="h-6 w-6" />}
                      {activeTab === 'blog' && <BookOpen className="h-6 w-6" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">No {activeTab} yet</p>
                      <p className="text-xs text-gray-400 mt-1">Click the + button to create your first {activeTab.slice(0, -1)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
      </div>
    </motion.div>
  );
};

export default BuilderSidebar;
