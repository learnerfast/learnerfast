import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { templateService } from '../components/builder/templateService';

const BuilderContext = createContext();

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
};

export const BuilderProvider = ({ children, siteId }) => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeMode, setActiveMode] = useState('pages'); // pages, edit, design, site, add, help
  const [activeInspectorTab, setActiveInspectorTab] = useState('screen'); // screen, actions, layout, effects
  const [currentPage, setCurrentPage] = useState('home');
  const [pageData, setPageData] = useState({
    id: 'page-1',
    name: 'Home',
    elements: []
  });
  const [templateContent, setTemplateContent] = useState(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pageContents, setPageContents] = useState({});
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [sidebarToggleTimeout, setSidebarToggleTimeout] = useState(null);

  const loadPage = useCallback(async (page) => {
    if (pageContents[page]) {
      setTemplateContent(pageContents[page]);
      setCurrentPage(page);
      return;
    }

    setIsLoadingTemplate(true);
    try {
      const { template, content } = await templateService.loadTemplate(currentTemplate, page);
      const processedContent = content
        .replace(/src="(?!https?:\/\/)/g, `src="${template.path}`)
        .replace(/href="(?!https?:\/\/|#)/g, `href="${template.path}`)
        .replace(/url\("(?!https?:\/\/)/g, `url("${template.path}`)
        .replace(/url\('(?!https?:\/\/)/g, `url('${template.path}`);
      
      setTemplateContent(processedContent);
      setPageContents(prev => ({ ...prev, [page]: processedContent }));
      setCurrentPage(page);
    } catch (error) {
      console.error(`Error loading page ${page}:`, error);
    } finally {
      setIsLoadingTemplate(false);
    }
  }, [currentTemplate, pageContents]);

  // Expose template update function globally
  useEffect(() => {
    window.updateTemplateContent = (content) => {
      setTemplateContent(content);
    };
    return () => {
      delete window.updateTemplateContent;
    };
  }, []);
  const [draggedElement, setDraggedElement] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [deviceMode, setDeviceMode] = useState('desktop'); // desktop, tablet, mobile



  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);



  const updateElement = (elementId, updates) => {
    console.log('Updating element:', encodeURIComponent(elementId), 'updates applied');
    
    // Update page data
    setPageData(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === elementId ? { ...el, ...updates } : el
      )
    }));
    
    // Update selected element if it matches
    if (selectedElement && selectedElement.id === elementId) {
      setSelectedElement(prev => ({ ...prev, ...updates }));
    }
    
    // Apply updates to actual DOM element if available
    if (selectedElement && selectedElement.element && updates) {
      const element = selectedElement.element;
      
      // Update content
      if (updates.content !== undefined) {
        element.textContent = updates.content;
      }
      
      // Update styles
      if (updates.styles) {
        Object.entries(updates.styles).forEach(([property, value]) => {
          element.style[property] = value;
        });
      }
      
      // Update attributes
      if (updates.attributes) {
        Object.entries(updates.attributes).forEach(([attr, value]) => {
          element.setAttribute(attr, value);
        });
      }
      
      // DOM element updated successfully
    }
  };

  const deleteElement = (elementId) => {
    console.log('Deleting element:', encodeURIComponent(elementId));
    
    // Remove from page data
    setPageData(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== elementId)
    }));
    
    // Clear selection if this element is selected
    if (selectedElement && selectedElement.id === elementId) {
      setSelectedElement(null);
    }
    
    // Remove from DOM if available
    if (selectedElement && selectedElement.element && selectedElement.id === elementId) {
      selectedElement.element.remove();
      // DOM element removed successfully
    }
  };

  const switchMode = useCallback((mode) => {
    // Prevent rapid mode switching
    if (activeMode === mode) return;
    
    setActiveMode(mode);
    // Reset certain states when switching modes
    if (mode === 'pages') {
      setSelectedElement(null);
      // Ensure sidebar is not collapsed when entering pages mode
      if (isSidebarCollapsed) {
        setIsSidebarCollapsed(false);
      }
    }
  }, [activeMode, isSidebarCollapsed]);

  const switchPage = useCallback((pageName) => {
    // Save current page content before switching
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentDocument) {
      const currentHTML = iframe.contentDocument.documentElement.outerHTML;
      setPageContents(prev => ({ ...prev, [currentPage]: currentHTML }));
    }
    
    loadPage(pageName);
  }, [currentPage, loadPage]);

  const switchInspectorTab = useCallback((tab) => {
    setActiveInspectorTab(tab);
  }, []);

  const switchDeviceMode = useCallback((device) => {
    setDeviceMode(device);
  }, []);

  const togglePreviewMode = useCallback(() => {
    setIsPreviewMode(prev => !prev);
    if (!isPreviewMode) {
      setSelectedElement(null);
    }
  }, [isPreviewMode]);

  const saveProject = useCallback(async () => {
    setIsSaving(true);
    try {
      // Get current iframe content
      const iframe = document.querySelector('iframe');
      if (!iframe || !iframe.contentDocument) {
        throw new Error('No iframe content available');
      }

      const iframeDoc = iframe.contentDocument;
      const currentHTML = iframeDoc.documentElement.outerHTML;
      
      // Save current page content
      const updatedPageContents = {
        ...pageContents,
        [currentPage]: currentHTML
      };
      setPageContents(updatedPageContents);
      
      // Save to localStorage for persistence
      const saveData = {
        pageContents: updatedPageContents,
        pageData: pageData,
        templateId: currentTemplate,
        timestamp: new Date().toISOString(),
        siteId: siteId
      };
      
      localStorage.setItem(`builder-save-${siteId}`, JSON.stringify(saveData));
      
      // Update site status in WebsiteContext
      if (typeof window !== 'undefined' && window.updateSiteStatus) {
        window.updateSiteStatus(siteId, {
          has_saved_changes: true,
          lastEdited: new Date().toISOString().split('T')[0]
        });
      }
      
      // Project saved successfully
      
      // Show success notification
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('All changes saved!', 'success');
      }
      
      return true;
    } catch (error) {
      console.error('Error saving project:', error);
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Failed to save project', 'error');
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [pageData, siteId, currentPage, pageContents]);

  const loadSavedProject = useCallback(async () => {
    try {
      const savedData = localStorage.getItem(`builder-save-${siteId}`);
      if (savedData) {
        const { html, pageData: savedPageData } = JSON.parse(savedData);
        setTemplateContent(html);
        setPageData(savedPageData);
        return true;
      }
    } catch (error) {
      console.error('Error loading saved project:', error);
    }
    return false;
  }, [siteId]);

  // Load template on initialization
  useEffect(() => {
    const loadTemplate = async () => {
      setIsLoadingTemplate(true);
      try {
        // Get site info to determine template
        let templateId = 'modern-minimal'; // default fallback
        
        // Extract template from siteId if it contains template info
        if (siteId && siteId.includes('-')) {
          const parts = siteId.split('-');
          // Look for known template IDs in the siteId
          const knownTemplates = ['modern-minimal', 'creative-pro', 'academic-pro', 'fitness-gym', 'fitness-personal', 'fitness-yoga', 'ngo-charity', 'ngo-healthcare', 'ngo-environment', 'finance-investment', 'finance-banking', 'finance-crypto'];
          for (const template of knownTemplates) {
            if (siteId.includes(template)) {
              templateId = template;
              break;
            }
          }
        }
        
        // Try to get template from WebsiteContext
        if (typeof window !== 'undefined' && window.getSiteTemplate) {
          const siteTemplate = window.getSiteTemplate(siteId);
          if (siteTemplate && siteTemplate !== 'modern-minimal') {
            templateId = siteTemplate;
          }
        }
        
        console.log('Using template:', templateId, 'for site:', siteId);
        
        // Check for saved project first
        const savedData = localStorage.getItem(`builder-save-${siteId}`);
        if (savedData) {
          try {
            const { pageContents: savedPageContents, pageData: savedPageData, templateId: savedTemplateId } = JSON.parse(savedData);
            if (savedTemplateId) {
              templateId = savedTemplateId;
            }
            if (savedPageContents) {
              setPageContents(savedPageContents);
              // Load current page content if available
              const currentPageContent = savedPageContents[currentPage] || savedPageContents['home'];
              if (currentPageContent) {
                setTemplateContent(currentPageContent);
                setCurrentTemplate(templateId);
                console.log(`Loaded existing project for site: ${siteId}`);
                return;
              }
            }
            if (savedPageData) {
              setPageData(savedPageData);
            }
          } catch (error) {
            console.error('Failed to parse saved project data:', error);
          }
        }
        
        // Load template
        const { template, content } = await templateService.loadTemplate(templateId);
        const processedContent = content
          .replace(/src="(?!https?:\/\/)/g, `src="${template.path}`)
          .replace(/href="(?!https?:\/\/)/g, `href="${template.path}`)
          .replace(/url\("(?!https?:\/\/)/g, `url("${template.path}`)
          .replace(/url\('(?!https?:\/\/)/g, `url('${template.path}`);
        
        setTemplateContent(processedContent);
        setCurrentTemplate(templateId);
        
      } catch (error) {
        console.error('Failed to load project:', error);
      } finally {
        setIsLoadingTemplate(false);
      }
    };
    
    loadTemplate();
  }, [siteId, currentPage]);

  const value = {
    siteId,
    selectedElement,
    setSelectedElement,
    isSidebarCollapsed,
    toggleSidebar,
    activeMode,
    setActiveMode,
    switchMode,
    activeInspectorTab,
    setActiveInspectorTab,
    switchInspectorTab,
    currentPage,
    setCurrentPage,
    switchPage,
    pageData,
    setPageData,
    draggedElement,
    setDraggedElement,

    updateElement,
    deleteElement,
    isPreviewMode,
    setIsPreviewMode,
    togglePreviewMode,
    deviceMode,
    setDeviceMode,
    switchDeviceMode,
    templateContent,
    setTemplateContent,
    isLoadingTemplate,
    updateTemplateContent: setTemplateContent,
    saveProject,
    loadSavedProject,
    isSaving,
    pageContents,
    setPageContents,
    currentTemplate,
    setCurrentTemplate,
    loadPage
  };

  return (
    <BuilderContext.Provider value={value}>
      {children}
    </BuilderContext.Provider>
  );
};
