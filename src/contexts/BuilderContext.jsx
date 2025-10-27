import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { templateService } from '../components/builder/templateService';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { logError, logWarning } from '../lib/errorLogger';

const BuilderContext = createContext();

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
};

export const BuilderProvider = ({ children, siteId }) => {
  const { user } = useAuth();
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
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoRedoing, setIsUndoRedoing] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState('');
  const [saveTimeout, setSaveTimeout] = useState(null);

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
      logError(error, { context: 'loadPage', page });
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



  const saveToHistory = useCallback((content) => {
    if (isUndoRedoing || content === lastSavedContent) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(content);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setLastSavedContent(content);
  }, [history, historyIndex, isUndoRedoing, lastSavedContent]);

  const undo = useCallback(() => {
    if (historyIndex > 0 && !isUndoRedoing) {
      setIsUndoRedoing(true);
      const prevContent = history[historyIndex - 1];
      const iframe = document.querySelector('iframe[srcdoc]');
      
      if (iframe && prevContent) {
        iframe.contentDocument.open();
        iframe.contentDocument.write(prevContent);
        iframe.contentDocument.close();
        setHistoryIndex(historyIndex - 1);
        setLastSavedContent(prevContent);
      }
      
      setTimeout(() => setIsUndoRedoing(false), 50);
    }
  }, [history, historyIndex, isUndoRedoing]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1 && !isUndoRedoing) {
      setIsUndoRedoing(true);
      const nextContent = history[historyIndex + 1];
      const iframe = document.querySelector('iframe[srcdoc]');
      
      if (iframe && nextContent) {
        iframe.contentDocument.open();
        iframe.contentDocument.write(nextContent);
        iframe.contentDocument.close();
        setHistoryIndex(historyIndex + 1);
        setLastSavedContent(nextContent);
      }
      
      setTimeout(() => setIsUndoRedoing(false), 50);
    }
  }, [history, historyIndex, isUndoRedoing]);

  const updateElement = (elementId, updates) => {

    
    // Save current state to history before making changes
    saveToHistory(templateContent);
    
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
      

    }
  };

  const deleteElement = (elementId) => {

    
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
    
    if (currentTemplate) {
      loadPage(pageName);
    }
  }, [currentPage, loadPage, currentTemplate]);

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
        return true;
      }

      const iframeDoc = iframe.contentDocument;
      // Remove builder classes before saving
      iframeDoc.querySelectorAll('.builder-selected, .builder-hover').forEach(el => {
        el.classList.remove('builder-selected', 'builder-hover');
        el.removeAttribute('data-element-type');
      });
      // Get the full HTML including all inline styles
      const currentHTML = iframeDoc.documentElement.outerHTML;
      
      // Load all template pages if not already loaded
      const allPages = ['home', 'about', 'courses', 'contact', 'signin', 'register', 'course-detail'];
      const updatedPageContents = { ...pageContents, [currentPage]: currentHTML };
      
      for (const page of allPages) {
        if (!updatedPageContents[page] && currentTemplate) {
          try {
            const { template, content } = await templateService.loadTemplate(currentTemplate, page);
            const processedContent = content
              .replace(/src="(?!https?:\/\/)/g, `src="${template.path}`)
              .replace(/href="(?!https?:\/\/|#)/g, `href="${template.path}`)
              .replace(/url\("(?!https?:\/\/)/g, `url("${template.path}`)
              .replace(/url\('(?!https?:\/\/)/g, `url('${template.path}`);
            updatedPageContents[page] = processedContent;
          } catch (error) {
            logWarning('Could not load page', { error, page });
          }
        }
      }
      
      setPageContents(updatedPageContents);
      
      // Save to database
      if (user?.id) {
        try {
          const { data: existing } = await supabase
            .from('website_builder_saves')
            .select('id')
            .eq('site_id', siteId)
            .eq('user_id', user.id)
            .single();

          if (existing) {
            await supabase
              .from('website_builder_saves')
              .update({
                page_contents: updatedPageContents,
                page_data: pageData,
                template_id: currentTemplate,
                updated_at: new Date().toISOString()
              })
              .eq('site_id', siteId)
              .eq('user_id', user.id);
          } else {
            await supabase
              .from('website_builder_saves')
              .insert({
                site_id: siteId,
                user_id: user.id,
                page_contents: updatedPageContents,
                page_data: pageData,
                template_id: currentTemplate
              });
          }
        } catch (error) {
          logError(error, { context: 'saveToDatabase', siteId });
          throw error;
        }
      }
      
      // Update site status in WebsiteContext
      if (typeof window !== 'undefined' && window.updateSiteStatus) {
        window.updateSiteStatus(siteId, {
          has_saved_changes: true,
          lastEdited: new Date().toISOString().split('T')[0]
        });
      }
      
      // Show success notification
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('All changes saved!', 'success');
      }
      
      return true;
    } catch (error) {
      logError(error, { context: 'saveProject', siteId });
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Failed to save project', 'error');
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [pageData, siteId, currentPage, pageContents, currentTemplate, user]);

  const loadSavedProject = useCallback(async () => {
    if (!user?.id) return false;
    
    try {
      const { data, error } = await supabase
        .from('website_builder_saves')
        .select('*')
        .eq('site_id', siteId)
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setPageContents(data.page_contents || {});
        setPageData(data.page_data || {});
        setCurrentTemplate(data.template_id);
        return true;
      }
    } catch (error) {
      logError(error, { context: 'loadSavedProject', siteId });
    }
    return false;
  }, [siteId, user]);

  // Initialize history and track changes
  useEffect(() => {
    if (templateContent && history.length === 0) {
      setHistory([templateContent]);
      setHistoryIndex(0);
    }

    // Track iframe changes immediately
    const trackChanges = () => {
      const iframe = document.querySelector('iframe[srcdoc]');
      if (iframe?.contentDocument && !isUndoRedoing) {
        const doc = iframe.contentDocument;
        
        const handleChange = () => {
          if (isUndoRedoing) return;
          
          if (saveTimeout) clearTimeout(saveTimeout);
          
          const timeout = setTimeout(() => {
            const newContent = doc.documentElement.outerHTML;
            saveToHistory(newContent);
          }, 200);
          
          setSaveTimeout(timeout);
        };

        doc.addEventListener('input', handleChange, true);
        doc.addEventListener('keydown', handleChange, true);
        doc.addEventListener('dragend', handleChange, true);
        doc.addEventListener('drop', handleChange, true);
        doc.addEventListener('mouseup', handleChange, true);
        
        // Observer for DOM mutations (position, style changes)
        const observer = new MutationObserver(() => {
          if (!isUndoRedoing) {
            handleChange();
          }
        });
        
        if (doc.body) {
          observer.observe(doc.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'data-x', 'data-y']
          });
        }
        
        return () => {
          doc.removeEventListener('input', handleChange, true);
          doc.removeEventListener('keydown', handleChange, true);
          doc.removeEventListener('dragend', handleChange, true);
          doc.removeEventListener('drop', handleChange, true);
          doc.removeEventListener('mouseup', handleChange, true);
          if (observer) observer.disconnect();
        };
      }
    };

    const timer = setTimeout(trackChanges, 100);
    return () => {
      clearTimeout(timer);
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, [templateContent, history.length, isUndoRedoing, saveToHistory]);

  // Load template on initialization
  useEffect(() => {
    let mounted = true;
    
    const loadTemplate = async () => {
      if (!mounted || templateContent) return;
      setIsLoadingTemplate(true);
      try {
        let templateId = null;
        
        // First, try to get template from database via site lookup
        if (user?.id && siteId) {
          try {
            const { data: siteData } = await supabase
              .from('sites')
              .select('template_id')
              .eq('id', siteId)
              .eq('user_id', user.id)
              .single();
            
            if (siteData?.template_id) {
              templateId = siteData.template_id;
            }
          } catch (error) {
            logWarning('Could not load site template from database', { error, siteId });
          }
        }
        
        // Try to get template from WebsiteContext as fallback
        if (!templateId && typeof window !== 'undefined' && window.getSiteTemplate) {
          templateId = window.getSiteTemplate(siteId);
        }
        
        // Extract template from siteId if it contains template info
        if (!templateId && siteId) {
          const knownTemplates = ['modern-minimal', 'creative-pro', 'academic-pro', 'fitness-gym', 'fitness-personal', 'fitness-yoga', 'ngo-charity', 'ngo-healthcare', 'ngo-environment', 'finance-investment', 'finance-banking', 'finance-crypto'];
          for (const template of knownTemplates) {
            if (siteId.includes(template)) {
              templateId = template;
              break;
            }
          }
        }
        
        // Skip if no valid templateId found
        if (!templateId) {
          setIsLoadingTemplate(false);
          return;
        }
        
        
        // Check for saved project first
        if (user?.id) {
          try {
            const { data } = await supabase
              .from('website_builder_saves')
              .select('*')
              .eq('site_id', siteId)
              .eq('user_id', user.id)
              .single();
            
            if (data) {
              if (data.template_id) templateId = data.template_id;
              if (data.page_contents) {
                setPageContents(data.page_contents);
                const currentPageContent = data.page_contents[currentPage] || data.page_contents['home'];
                if (currentPageContent) {
                  setCurrentTemplate(templateId);
                  setTemplateContent(currentPageContent);
                  setIsLoadingTemplate(false);
                  return;
                }
              }
              if (data.page_data) {
                setPageData(data.page_data);
              }
            }
          } catch (error) {
            logWarning('Failed to load saved project', { error, siteId });
          }
        }
        
        // Load template only if templateId exists
        if (!templateId) return;
        
        const { template, content } = await templateService.loadTemplate(templateId);
        const processedContent = content
          .replace(/src="(?!https?:\/\/)/g, `src="${template.path}`)
          .replace(/href="(?!https?:\/\/)/g, `href="${template.path}`)
          .replace(/url\("(?!https?:\/\/)/g, `url("${template.path}`)
          .replace(/url\('(?!https?:\/\/)/g, `url('${template.path}`);
        
        // Set template content and template ID together to prevent flash
        setCurrentTemplate(templateId);
        setTemplateContent(processedContent);
        
      } catch (error) {
        logError(error, { context: 'loadTemplate', siteId });
      } finally {
        setIsLoadingTemplate(false);
      }
    };
    
    loadTemplate();
    
    return () => {
      mounted = false;
    };
  }, [siteId, user]);

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
    loadPage,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
  };

  return (
    <BuilderContext.Provider value={value}>
      {children}
    </BuilderContext.Provider>
  );
};
