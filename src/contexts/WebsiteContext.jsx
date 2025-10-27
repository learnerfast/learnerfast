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
        setLoading(false);
      }
    };
    
    loadInitialSites();
  }, [user]);

  const loadSites = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const sitesWithContent = await Promise.all((data || []).map(async (site) => {
        try {
          const { data: saveData } = await supabase
            .from('website_builder_saves')
            .select('page_contents')
            .eq('site_id', site.id)
            .eq('user_id', user.id)
            .single();
          
          return {
            ...site,
            htmlContent: saveData?.page_contents?.home || null
          };
        } catch {
          return site;
        }
      }));
      
      setSites(sitesWithContent);
    } catch (error) {
      setSites([]);
    } finally {
      setLoading(false);
    }
  };

  const addSite = async (siteName, template) => {
    if (!user?.id) {
      throw new Error('User must be authenticated to create sites');
    }
    
    
    const supabaseSite = {
      user_id: user.id,
      name: siteName,
      url: siteName.toLowerCase().replace(/\s+/g, '-'),
      status: 'draft',
      last_edited: new Date().toISOString().split('T')[0],
      template_id: template.id,
      template_path: template.path,
    };
    
    
    try {
      // Insert site into database
      const { data: siteData, error: siteError } = await supabase
        .from('sites')
        .insert([supabaseSite])
        .select()
        .single();
      
      
      if (siteError) throw siteError;
      

      
      // Add to local state
      setSites(prevSites => [siteData, ...prevSites]);
      return siteData;
    } catch (error) {
      throw error;
    }
  };

  const deleteSite = async (id) => {
    if (!user?.id) return;
    
    try {
      // First delete related website_builder_saves
      await supabase
        .from('website_builder_saves')
        .delete()
        .eq('site_id', id)
        .eq('user_id', user.id);
      
      // Then delete the site
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Remove from local state
      setSites(prevSites => prevSites.filter(site => site.id !== id));
    } catch (error) {
      throw error;
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
