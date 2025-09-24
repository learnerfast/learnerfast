import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const WebsiteContext = createContext();

export const useWebsite = () => {
  const context = useContext(WebsiteContext);
  if (!context) {
    throw new Error('useWebsite must be used within a WebsiteProvider');
  }
  return context;
};

const initialSites = [];

// Migration function to add templatePath to existing sites
const migrateSites = (sites) => {
  return sites.map(site => {
    if (!site.templatePath) {
      // Map old template names to new template IDs
      if (site.template === 'Modern Course' || site.template === 'Modern Minimal') {
        return {
          ...site,
          template: 'Modern Minimal',
          templatePath: '/templates/modern-minimal/',
          templateId: 'modern-minimal'
        };
      } else if (site.template === 'Creative Studio' || site.template === 'Creative Pro') {
        return {
          ...site,
          template: 'Creative Pro',
          templatePath: '/templates/creative-pro/',
          templateId: 'creative-pro'
        };
      } else {
        // Default to modern-minimal for unknown templates
        return {
          ...site,
          template: 'Modern Minimal',
          templatePath: '/templates/modern-minimal/',
          templateId: 'modern-minimal'
        };
      }
    }
    return site;
  });
};

export const WebsiteProvider = ({ children }) => {
  const { user } = useAuth();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  const updateSiteStatus = React.useCallback((siteId, updates) => {
    setSites(prevSites => 
      prevSites.map(site => 
        site.id === siteId ? { ...site, ...updates } : site
      )
    );
  }, []);

  const getSiteTemplate = React.useCallback((siteId) => {
    const site = sites.find(s => s.id === siteId);
    return site?.templateId || site?.template_id || 'modern-minimal';
  }, [sites]);

  // Expose functions globally
  useEffect(() => {
    window.updateSiteStatus = updateSiteStatus;
    window.getSiteTemplate = getSiteTemplate;
    return () => {
      delete window.updateSiteStatus;
      delete window.getSiteTemplate;
    };
  }, [updateSiteStatus, getSiteTemplate]);

  // Load sites from Supabase - only on initial load
  useEffect(() => {
    const loadInitialSites = async () => {
      if (user) {
        await loadSites();
      } else {
        // Load saved projects for demo - only if sites array is empty
        if (sites.length === 0) {
          const savedSites = [...initialSites];
          const seenIds = new Set();
          
          const userPrefix = `user-${user?.id || 'guest'}-`;
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`builder-save-${userPrefix}`)) {
              const siteId = key.replace('builder-save-', '');
              
              // Skip if we've already seen this ID
              if (seenIds.has(siteId)) {
                continue;
              }
              
              try {
                const savedData = JSON.parse(localStorage.getItem(key));
                const siteName = savedData.siteName || `Site ${siteId.substring(0, 8)}`;
                savedSites.push({
                  id: siteId,
                  name: siteName,
                  url: `${siteName.toLowerCase().replace(/\s+/g, '-')}.videmy.com`,
                  status: 'draft',
                  lastEdited: new Date(savedData.timestamp).toISOString().split('T')[0],
                  has_saved_changes: true
                });
                seenIds.add(siteId);
              } catch (e) {
                console.warn(`Failed to parse saved data for ${siteId}:`, e);
              }
            }
          }
          setSites(savedSites);
        }
        setLoading(false);
      }
    };
    
    loadInitialSites();
  }, [user]);

  const loadSites = async () => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Add saved projects from localStorage
      const allSites = [...(data || []), ...initialSites];
      const seenIds = new Set(allSites.map(site => site.id));
      
      const userPrefix = `user-${user.id}-`;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`builder-save-${userPrefix}`)) {
          const siteId = key.replace('builder-save-', '');
          
          // Skip if we've already seen this ID
          if (seenIds.has(siteId)) {
            const existingSite = allSites.find(site => site.id === siteId);
            if (existingSite) {
              try {
                const savedData = JSON.parse(localStorage.getItem(key));
                existingSite.lastEdited = new Date(savedData.timestamp).toISOString().split('T')[0];
                existingSite.has_saved_changes = true;
                if (savedData.siteName && savedData.siteName !== existingSite.name) {
                  existingSite.name = savedData.siteName;
                }
              } catch (e) {
                console.warn(`Failed to parse saved data for ${siteId}:`, e);
              }
            }
            continue;
          }
          
          try {
            const savedData = JSON.parse(localStorage.getItem(key));
            const siteName = savedData.siteName || `Site ${siteId.substring(0, 8)}`;
            allSites.push({
              id: siteId,
              name: siteName,
              url: `${siteName.toLowerCase().replace(/\s+/g, '-')}.videmy.com`,
              status: 'draft',
              lastEdited: new Date(savedData.timestamp).toISOString().split('T')[0],
              has_saved_changes: true
            });
            seenIds.add(siteId);
          } catch (e) {
            console.warn(`Failed to parse saved data for ${siteId}:`, e);
          }
        }
      }
      setSites(allSites);
    } catch (error) {
      console.warn('Error loading sites:', error?.message || 'Unknown error');
      setSites(initialSites);
    } finally {
      setLoading(false);
    }
  };

  const addSite = async (siteName, template) => {
    // Generate truly unique ID with user prefix
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 9);
    const userPrefix = `user-${user?.id || 'guest'}-`;
    const uniqueId = `${userPrefix}site-${timestamp}-${randomSuffix}`;
    
    const newSite = {
      id: uniqueId,
      name: siteName,
      url: `${siteName.toLowerCase().replace(/\s+/g, '-')}.videmy.com`,
      status: 'draft',
      lastEdited: new Date().toISOString().split('T')[0],
      template: template.name,
      templatePath: template.path,
      templateId: template.id
    };
    
    if (!user) {
      // For non-authenticated users, just add to local state
      setSites(prevSites => [newSite, ...prevSites]);
      return newSite;
    }
    
    const supabaseSite = {
      user_id: user.id,
      name: siteName,
      url: `${siteName.toLowerCase().replace(/\s+/g, '-')}.videmy.com`,
      status: 'draft',
      last_edited: new Date().toISOString().split('T')[0],
      template_id: template.id,
      template_path: template.path,
    };
    
    try {
      const { data, error } = await supabase
        .from('sites')
        .insert([supabaseSite])
        .select()
        .single();
      
      if (error) {
        // If Supabase fails, still add to local state
        setSites(prevSites => [newSite, ...prevSites]);
        return newSite;
      }
      
      setSites(prevSites => [data, ...prevSites]);
      return data;
    } catch (error) {
      // Site creation failed - error details omitted for security
      throw error;
    }
  };

  const deleteSite = async (id) => {
    try {
      // Always remove from local state first
      setSites(prevSites => prevSites.filter(site => site.id !== id));
      
      // Remove from localStorage if it exists (user-specific)
      localStorage.removeItem(`builder-save-${id}`);
      
      // Also clean up any old non-prefixed entries
      if (user && !id.startsWith(`user-${user.id}-`)) {
        localStorage.removeItem(`builder-save-user-${user.id}-${id}`);
      }
      
      // Only try to delete from Supabase if user is authenticated
      if (user) {
        const { error } = await supabase
          .from('sites')
          .delete()
          .eq('id', id);
        
        if (error) {
          // Don't throw error for Supabase failures, local deletion already succeeded
        }
      }
    } catch (error) {
      console.error('Error deleting site:', error);
      // Re-add the site if deletion failed
      loadSites();
    }
  };

  const value = useMemo(() => ({
    sites,
    loading,
    addSite,
    deleteSite,
    loadSites,
    updateSiteStatus,
    getSiteTemplate,
  }), [sites, loading, addSite, deleteSite, loadSites, updateSiteStatus, getSiteTemplate]);

  return (
    <WebsiteContext.Provider value={value}>
      {children}
    </WebsiteContext.Provider>
  );
};
