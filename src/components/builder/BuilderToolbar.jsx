import React, { useState } from 'react';
import {
  ArrowLeft,
  Eye,
  Save,
  ChevronDown,
  Monitor,
  Tablet,
  Smartphone,
  Undo,
  Redo,
  Play,
  Code,
  Globe,
  Settings,
  Palette,
  Type,
  MousePointer,
  Droplet,
  Sliders,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useBuilder } from '../../contexts/BuilderContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { templateService } from './templateService';
import FontSelector from './FontSelector';
import ColorSelector from './ColorSelector';
import TypographyPage from './TypographyPage';

const BuilderToolbar = () => {
  const { user } = useAuth();
  const [showDesignMenu, setShowDesignMenu] = useState(false);
  const [showThemeExplorer, setShowThemeExplorer] = useState(false);
  const [activeThemeSection, setActiveThemeSection] = useState('theme-explorer');
  const [selectedColorTheme, setSelectedColorTheme] = useState('tropic-lake');
  const [selectedFont, setSelectedFont] = useState('poppins-raleway');
  const [selectedLayout, setSelectedLayout] = useState('normal');
  const [showColorSelector, setShowColorSelector] = useState(false);
  const [themeChanges, setThemeChanges] = useState({});
  const [customColors, setCustomColors] = useState({
    primary: '#FBAC00',
    accent1: '#2196F3', 
    accent2: '#FBAC00',
    darkBg: '#2A2F34',
    lightBg: '#F5F5F5',
    bodyBg: '#FFFFFF',
    darkText: '#2A2F34',
    lightText: '#FFFFFF',
    linkText: '#0064D1'
  });
  const [showHelpPopup, setShowHelpPopup] = useState(false);
  const [helpStep, setHelpStep] = useState(1);

  // Extract colors from current template elements
  React.useEffect(() => {
    if (!showThemeExplorer) return;
    
    setTimeout(() => {
      const iframe = document.querySelector('iframe[srcdoc]');
      
      if (iframe?.contentDocument) {
        const doc = iframe.contentDocument;
        const win = iframe.contentWindow;
        
        const extractedColors = {};
        
        // Extract primary color from buttons with actual background colors
        const btns = doc.querySelectorAll('button, .btn, .btn-primary, [class*="btn"]');
        let primaryFound = false;
        for (let btn of btns) {
          const bgColor = win.getComputedStyle(btn).backgroundColor;
          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
            extractedColors.primary = rgbToHex(bgColor);
            primaryFound = true;
            break;
          }
        }
        if (!primaryFound) extractedColors.primary = '#007bff'; // Default blue
        
        // Extract text colors from headings
        const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length > 0) {
          const heading = headings[0];
          const textColor = win.getComputedStyle(heading).color;
          extractedColors.darkText = rgbToHex(textColor);
        } else {
          extractedColors.darkText = '#333333';
        }
        
        // Extract body background
        if (doc.body) {
          const bgColor = win.getComputedStyle(doc.body).backgroundColor;
          extractedColors.bodyBg = rgbToHex(bgColor);
        } else {
          extractedColors.bodyBg = '#ffffff';
        }
        
        // Extract link colors
        const links = doc.querySelectorAll('a');
        if (links.length > 0) {
          const link = links[0];
          const linkColor = win.getComputedStyle(link).color;
          extractedColors.linkText = rgbToHex(linkColor);
        } else {
          extractedColors.linkText = '#007bff';
        }
        
        // Set default values for other colors
        extractedColors.accent1 = extractedColors.primary;
        extractedColors.accent2 = extractedColors.primary;
        extractedColors.darkBg = '#2c3e50';
        extractedColors.lightBg = '#f8f9fa';
        extractedColors.lightText = '#ffffff';
        
        setCustomColors(extractedColors);
      }
    }, 500);
  }, [showThemeExplorer]);
  
  const rgbToHex = (rgb) => {
    if (rgb.startsWith('#')) return rgb;
    const match = rgb.match(/\d+/g);
    if (!match) return rgb;
    return '#' + match.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
  };
  


  const applyColorToIframe = (iframe, colorType, color) => {
    if (!iframe?.contentDocument) return;
    const doc = iframe.contentDocument;
    
    let style = doc.getElementById('theme-colors-style');
    if (!style) {
      style = doc.createElement('style');
      style.id = 'theme-colors-style';
      doc.head.appendChild(style);
    }
    
    const colors = { ...customColors, [colorType]: color };
    style.textContent = `
      button, .btn, .btn-primary { background-color: ${colors.primary} !important; }
      .accent { background-color: ${colors.accent1} !important; }
      h1, h2, h3, h4, h5, h6, p { color: ${colors.darkText} !important; }
      a { color: ${colors.linkText} !important; }
      .dark-bg { background-color: ${colors.darkBg} !important; }
      .light-bg { background-color: ${colors.lightBg} !important; }
      body { background-color: ${colors.bodyBg} !important; }
    `;
  };

  const applyThemeToIframe = (iframe, changes = themeChanges) => {
    if (!iframe?.contentDocument) return;
    const doc = iframe.contentDocument;
    
    let style = doc.getElementById('theme-colors-style');
    if (!style) {
      style = doc.createElement('style');
      style.id = 'theme-colors-style';
      doc.head.appendChild(style);
    }
    
    style.textContent = `
      button, .btn, .btn-primary { background-color: ${customColors.primary} !important; }
      .accent { background-color: ${customColors.accent1} !important; }
      h1, h2, h3, h4, h5, h6, p { color: ${customColors.darkText} !important; }
      a { color: ${customColors.linkText} !important; }
      .dark-bg { background-color: ${customColors.darkBg} !important; }
      .light-bg { background-color: ${customColors.lightBg} !important; }
      body { background-color: ${customColors.bodyBg} !important; }
    `;
    
    if (changes.fonts) {
      let fontStyle = doc.getElementById('theme-fonts-style');
      if (!fontStyle) {
        fontStyle = doc.createElement('style');
        fontStyle.id = 'theme-fonts-style';
        doc.head.appendChild(fontStyle);
      }
      fontStyle.textContent = `
        h1, h2, h3, h4, h5, h6 { font-family: ${changes.fonts.heading} !important; }
        body, p, span, div { font-family: ${changes.fonts.body} !important; }
      `;
    }
  };

  const saveThemeChanges = async () => {
    const mainIframe = document.querySelector('iframe[srcdoc]');
    if (mainIframe?.contentDocument) {
      const doc = mainIframe.contentDocument;
      
      let style = doc.getElementById('theme-colors-style');
      if (!style) {
        style = doc.createElement('style');
        style.id = 'theme-colors-style';
        doc.head.appendChild(style);
      }
      
      style.textContent = `
        button, .btn, .btn-primary { background-color: ${customColors.primary} !important; }
        .accent { background-color: ${customColors.accent1} !important; }
        h1, h2, h3, h4, h5, h6, p { color: ${customColors.darkText} !important; }
        a { color: ${customColors.linkText} !important; }
        .dark-bg { background-color: ${customColors.darkBg} !important; }
        .light-bg { background-color: ${customColors.lightBg} !important; }
        body { background-color: ${customColors.bodyBg} !important; }
      `;
      
      if (themeChanges.fonts) {
        let fontStyle = doc.getElementById('theme-fonts-style');
        if (!fontStyle) {
          fontStyle = doc.createElement('style');
          fontStyle.id = 'theme-fonts-style';
          doc.head.appendChild(fontStyle);
        }
        fontStyle.textContent = `
          h1, h2, h3, h4, h5, h6 { font-family: ${themeChanges.fonts.heading} !important; }
          body, p, span, div { font-family: ${themeChanges.fonts.body} !important; }
        `;
        
        if (themeChanges.fonts.sizes) {
          let sizeStyle = doc.getElementById('theme-font-sizes-style');
          if (!sizeStyle) {
            sizeStyle = doc.createElement('style');
            sizeStyle.id = 'theme-font-sizes-style';
            doc.head.appendChild(sizeStyle);
          }
          const sizes = themeChanges.fonts.sizes;
          sizeStyle.textContent = `
            h1 { font-size: ${sizes.h1}px !important; }
            h2 { font-size: ${sizes.h2}px !important; }
            h3 { font-size: ${sizes.h3}px !important; }
            .text-large { font-size: ${sizes.large}px !important; }
            body, p { font-size: ${sizes.normal}px !important; }
            .text-small, small { font-size: ${sizes.small}px !important; }
          `;
        }
      }
    }
    
    if (window.showToast) {
      window.showToast('Theme changes saved!', 'success');
    }
  };
  const {
    selectedElement,
    activeMode,
    switchMode,
    deviceMode,
    switchDeviceMode,
    currentPage,
    saveProject,
    isSaving,
    pageContents,
    currentTemplate,
    siteId,
    undo,
    redo,
    canUndo,
    canRedo
  } = useBuilder();



  return (
    <div className="bg-white border-b border-black px-4 py-3 flex items-center justify-between text-sm z-10 shadow-sm">
      {/* Left section */}
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/websites"
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <nav className="flex items-center space-x-1" onMouseLeave={() => {
          setShowDesignMenu(false);
        }}>
          {[
            { id: 'pages', name: 'Pages', description: 'Page management and navigation' }
          ].map(item => (
            <button
              key={item.id}
              onMouseEnter={() => setShowDesignMenu(false)}
              onClick={() => {
                if (activeMode === item.id) {
                  switchMode(null);
                } else {
                  switchMode(item.id);
                }
              }}
              title={item.description}
              className={`px-3 py-1.5 rounded-md transition-colors font-medium ${
                activeMode === item.id
                  ? 'bg-primary-100 text-primary-700 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.name}
            </button>
          ))}
          
          <div className="relative">
            <button
              onClick={() => {
                if (activeMode === 'help') {
                  switchMode(null);
                } else {
                  switchMode('help');
                  setHelpStep(1);
                }
              }}
              title="Documentation and help"
              className={`px-3 py-1.5 rounded-md transition-colors font-medium ${
                activeMode === 'help'
                  ? 'bg-primary-100 text-primary-700 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Help
            </button>
            
            {activeMode === 'help' && (
              <div className="absolute top-full left-0 mt-1 w-[420px] bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-6 flex flex-col justify-between h-52">
                  <div className="text-left flex-1 flex flex-col justify-center px-2">
                    {helpStep === 1 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Welcome to the Website Builder</h3>
                        <p className="text-xs text-gray-600 leading-4 mb-3">Create professional websites with our drag-and-drop editor. Use the toolbar above to access different features:</p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li>• <strong>Pages:</strong> Manage site structure</li>
                          <li>• <strong>Design:</strong> Customize appearance</li>
                          <li>• <strong>Preview:</strong> Test your site</li>
                        </ul>
                      </div>
                    )}
                    {helpStep === 2 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Pages Management</h3>
                        <p className="text-xs text-gray-600 leading-4 mb-3">Click "Pages" to open the sidebar and navigate between different pages of your website.</p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li>• <strong>Home:</strong> Main landing page</li>
                          <li>• <strong>About:</strong> Company information</li>
                          <li>• <strong>Courses:</strong> Service offerings</li>
                          <li>• <strong>Contact:</strong> Customer contact form</li>
                        </ul>
                      </div>
                    )}
                    {helpStep === 3 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Design Customization</h3>
                        <p className="text-xs text-gray-600 leading-4 mb-3">Click "Design" to access styling options and make your site unique.</p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li>• <strong>Theme Explorer:</strong> Pre-built color schemes</li>
                          <li>• <strong>Colors:</strong> Custom color palette</li>
                          <li>• <strong>Typography:</strong> Font selection</li>
                          <li>• <strong>Layouts:</strong> Page structure options</li>
                        </ul>
                      </div>
                    )}
                    {helpStep === 4 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Save & Preview Your Work</h3>
                        <p className="text-xs text-gray-600 leading-4 mb-3">Always save your progress and test how your site appears to visitors.</p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li>• <strong>Save:</strong> Stores all changes permanently</li>
                          <li>• <strong>Preview:</strong> Opens site in new tab</li>
                          <li>• <strong>Auto-save:</strong> Periodic backup protection</li>
                          <li>• <strong>Responsive:</strong> Works on all devices</li>
                        </ul>
                      </div>
                    )}

                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex space-x-1">
                      {[1,2,3,4].map(step => (
                        <div key={step} className={`w-1.5 h-1.5 rounded-full ${helpStep === step ? 'bg-teal-600' : 'bg-gray-300'}`}></div>
                      ))}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => setHelpStep(helpStep - 1)} 
                        disabled={helpStep === 1}
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800 disabled:opacity-30 text-xs"
                      >
                        &lt;
                      </button>
                      <button 
                        onClick={() => setHelpStep(helpStep + 1)} 
                        disabled={helpStep === 4}
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800 disabled:opacity-30 text-xs"
                      >
                        &gt;
                      </button>
                      <button onClick={() => switchMode(null)} className="px-2 py-1 bg-teal-600 text-white text-xs rounded hover:bg-teal-700">
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button
              onClick={() => {
                if (activeMode === 'design') {
                  switchMode(null);
                } else {
                  switchMode('design');
                }
              }}
              title="Visual design and styling"
              className={`px-3 py-1.5 rounded-md transition-colors font-medium ${
                activeMode === 'design'
                  ? 'bg-primary-100 text-primary-700 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Design
            </button>
            
            {(showDesignMenu || activeMode === 'design') && (
              <div 
                className="absolute top-full left-0 mt-1 w-[420px] bg-white rounded-lg shadow-lg border border-gray-200 z-50 flex"
              >
                {/* Left side - Menu options */}
                <div className="w-48 py-8 border-r border-gray-100">
                  <button 
                    onClick={() => {
                      setShowThemeExplorer(true);
                      setActiveThemeSection('theme-explorer');
                      setShowDesignMenu(false);
                    }}
                    onMouseEnter={() => setActiveThemeSection('theme-explorer')}
                    className="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-4 flex justify-center mr-3">
                      <Palette className="h-4 w-4 text-gray-500" />
                    </div>
                    <span>Theme Explorer</span>
                  </button>
                  <button 
                    onClick={() => {
                      setShowThemeExplorer(true);
                      setActiveThemeSection('colors');
                      setShowDesignMenu(false);
                    }}
                    onMouseEnter={() => setActiveThemeSection('colors')}
                    className="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-4 flex justify-center mr-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    </div>
                    <span>Colors</span>
                  </button>
                  <button 
                    onClick={() => {
                      setShowThemeExplorer(true);
                      setActiveThemeSection('typography');
                      setShowDesignMenu(false);
                    }}
                    onMouseEnter={() => setActiveThemeSection('typography')}
                    className="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-4 flex justify-center mr-3">
                      <Type className="h-4 w-4 text-gray-500" />
                    </div>
                    <span>Typography</span>
                  </button>

                </div>
                
                {/* Right side - Descriptions */}
                <div className="flex-1 p-10 flex items-center justify-center">
                  <div className="text-center h-32 flex flex-col justify-center">
                    {activeThemeSection === 'theme-explorer' && (
                      <>
                        <Palette className="h-6 w-6 text-gray-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-3">Theme Explorer</h3>
                        <p className="text-xs text-gray-500 text-center leading-4">Select and configure your school's colors, typography, buttons, and layouts</p>
                      </>
                    )}
                    {activeThemeSection === 'colors' && (
                      <>
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-3"></div>
                        <h3 className="font-semibold text-gray-900 mb-3">Colors</h3>
                        <p className="text-xs text-gray-500 text-center leading-4">Customize your website's color palette including primary, accent, and background colors</p>
                      </>
                    )}
                    {activeThemeSection === 'typography' && (
                      <>
                        <Type className="h-6 w-6 text-gray-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-3">Typography</h3>
                        <p className="text-xs text-gray-500 text-center leading-4">Choose fonts and text styles for headings, body text, and other typography elements</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Middle section */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1 p-1 bg-gray-100 rounded-md">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!canUndo) return;
              undo();
            }}
            disabled={!canUndo}
            className="p-1.5 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!canRedo) return;
              redo();
            }}
            disabled={!canRedo}
            className="p-1.5 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        <button className="hidden md:flex items-center space-x-1 px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
          <span>edu / {currentPage}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={async () => {
            const { data } = await supabase.from('sites').select('url').eq('id', siteId).single();
            const subdomain = data?.url || 'demo';
            window.open(`https://${subdomain}.learnerfast.com?v=${Date.now()}`, '_blank');
          }}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Eye className="h-4 w-4" />
          <span className="hidden md:inline">Preview</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const iframe = document.querySelector('iframe');
            if (iframe?.contentDocument) {
              iframe.contentDocument.querySelectorAll('.builder-selected, .builder-hover').forEach(el => {
                el.classList.remove('builder-selected', 'builder-hover');
                el.removeAttribute('data-element-type');
              });
            }
            saveProject();
          }}
          disabled={isSaving}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>

        <button
          onClick={() => {
            if (activeMode === 'settings') {
              switchMode(null);
            } else {
              switchMode('settings');
            }
          }}
          className={`p-2 rounded-md transition-colors ${
            activeMode === 'settings' ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
      
      {/* Theme Explorer Full Screen */}
      {showThemeExplorer && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          {/* Top Navigation */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex space-x-8">
              <button 
                onClick={() => setActiveThemeSection('theme-explorer')}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  activeThemeSection === 'theme-explorer' ? 'text-teal-600 border-teal-600' : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                Theme Explorer
              </button>
              <button 
                onClick={() => setActiveThemeSection('colors')}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  activeThemeSection === 'colors' ? 'text-teal-600 border-teal-600' : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                Colors
              </button>
              <button 
                onClick={() => setActiveThemeSection('typography')}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  activeThemeSection === 'typography' ? 'text-teal-600 border-teal-600' : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                Typography
              </button>

            </div>
            <button
              onClick={() => setShowThemeExplorer(false)}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 flex">
            {/* Left Panel - Dynamic Content */}
            <div className="flex-1">
              {activeThemeSection === 'theme-explorer' && (
                <div className="flex">
                  {/* Colors Panel */}
                  <div className="w-80 p-6 space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">Current Colors</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div className="w-6 h-6 bg-orange-400 rounded"></div>
                            <div className="w-6 h-6 bg-blue-400 rounded"></div>
                            <div className="w-6 h-6 bg-gray-800 rounded"></div>
                          </div>
                        </div>
                        {[
                          { id: 'tropic-lake', name: 'Tropic lake', colors: ['bg-blue-500', 'bg-green-400', 'bg-blue-800'], css: '--primary: #3b82f6; --secondary: #4ade80; --accent: #1e40af;' },
                          { id: 'blue-monochrome', name: 'Blue monochrome', colors: ['bg-blue-600', 'bg-blue-400', 'bg-gray-800'], css: '--primary: #2563eb; --secondary: #60a5fa; --accent: #1f2937;' },
                          { id: 'tuscan-sun', name: 'Tuscan sun', colors: ['bg-yellow-400', 'bg-yellow-300', 'bg-gray-800'], css: '--primary: #facc15; --secondary: #fde047; --accent: #1f2937;' },
                          { id: 'birthday-cake', name: 'Birthday cake', colors: ['bg-teal-400', 'bg-pink-400', 'bg-gray-800'], css: '--primary: #2dd4bf; --secondary: #f472b6; --accent: #1f2937;' },
                          { id: 'electric', name: 'Electric', colors: ['bg-purple-600', 'bg-purple-400', 'bg-gray-800'], css: '--primary: #9333ea; --secondary: #a855f7; --accent: #1f2937;' },
                          { id: 'middle-east-sunset', name: 'Middle east sunset', colors: ['bg-red-500', 'bg-orange-400', 'bg-gray-800'], css: '--primary: #ef4444; --secondary: #fb923c; --accent: #1f2937;' },
                          { id: 'swedish-twist', name: 'Swedish twist', colors: ['bg-yellow-400', 'bg-green-400', 'bg-gray-800'], css: '--primary: #facc15; --secondary: #4ade80; --accent: #1f2937;' },
                          { id: 'autumn-rain', name: 'Autumn rain', colors: ['bg-teal-600', 'bg-orange-500', 'bg-gray-800'], css: '--primary: #0d9488; --secondary: #f97316; --accent: #1f2937;' }
                        ].map((theme, i) => (
                          <button 
                            key={i} 
                            onClick={() => {
                              setSelectedColorTheme(theme.id);
                              const newChanges = { ...themeChanges, colorTheme: theme.id };
                              setThemeChanges(newChanges);
                              
                              // Apply to preview iframe
                              const previewIframe = document.querySelector('#theme-preview-iframe');
                              if (previewIframe) {
                                applyThemeToIframe(previewIframe, newChanges);
                              }
                            }}
                            className={`w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors ${
                              selectedColorTheme === theme.id ? 'bg-blue-50 border border-blue-200' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex space-x-1">
                                {theme.colors.map((color, j) => (
                                  <div key={j} className={`w-4 h-4 ${color} rounded`}></div>
                                ))}
                              </div>
                              <span className="text-sm text-gray-700">{theme.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Fonts Panel */}
                  <div className="w-64 p-6 border-l border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Current Fonts</h3>
                    <div className="space-y-4">
                      {[
                        { id: 'poppins-raleway', name: 'Poppins', weight: 'Raleway', css: '--font-heading: "Poppins", sans-serif; --font-body: "Raleway", sans-serif;' },
                        { id: 'montserrat-oxygen', name: 'Montserrat', weight: 'Oxygen', css: '--font-heading: "Montserrat", sans-serif; --font-body: "Oxygen", sans-serif;' },
                        { id: 'playfair-fira', name: 'Playfair Display', weight: 'Fira Sans', css: '--font-heading: "Playfair Display", serif; --font-body: "Fira Sans", sans-serif;' },
                        { id: 'poppins-didact', name: 'Poppins', weight: 'Didact Gothic', css: '--font-heading: "Poppins", sans-serif; --font-body: "Didact Gothic", sans-serif;' }
                      ].map((font, i) => (
                        <button 
                          key={i} 
                          onClick={() => {
                            setSelectedFont(font.id);
                            const fontParts = font.css.match(/--font-heading: ([^;]+); --font-body: ([^;]+);/);
                            const newChanges = { 
                              ...themeChanges, 
                              fonts: { 
                                heading: fontParts?.[1] || '"Poppins", sans-serif',
                                body: fontParts?.[2] || '"Raleway", sans-serif'
                              }
                            };
                            setThemeChanges(newChanges);
                            
                            // Apply to preview iframe
                            const previewIframe = document.querySelector('#theme-preview-iframe');
                            if (previewIframe) {
                              applyThemeToIframe(previewIframe, newChanges);
                            }
                          }}
                          className={`w-full p-2 hover:bg-gray-50 rounded transition-colors text-left ${
                            selectedFont === font.id ? 'bg-blue-50 border border-blue-200' : ''
                          }`}
                        >
                          <div className="text-lg font-semibold text-gray-900">{font.name}</div>
                          <div className="text-xs text-gray-500">{font.weight}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {activeThemeSection === 'colors' && (
                <div className="w-[600px] p-4 space-y-4 overflow-y-auto">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Colors</h2>
                    <p className="text-gray-500 mb-4 text-sm">The colors of your site. Change them to better match your brand.</p>
                    
                    {/* Brand Colors */}
                    <div className="mb-5">
                      <h3 className="text-base font-semibold text-gray-900 mb-3">Brand colors</h3>
                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <div className="flex items-center mb-2">
                            <span className="text-sm font-medium text-gray-900 mr-2">Brand primary</span>
                            <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-xs text-gray-500">i</span>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              const rect = e.target.getBoundingClientRect();
                              setShowColorSelector({ 
                                top: rect.bottom + 10, 
                                left: rect.left + rect.width / 2,
                                colorType: 'primary'
                              });
                            }}
                            className="w-full h-12 rounded mb-1 flex items-center justify-center hover:shadow-md transition-shadow cursor-pointer"
                            style={{ backgroundColor: customColors.primary }}
                          >
                            <span className="text-white font-semibold text-xs">{customColors.primary}</span>
                          </button>
                          <div className="flex items-center space-x-3">
                            <label className="flex items-center space-x-1 cursor-pointer">
                              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                              <span className="text-xs text-gray-700">Light text</span>
                            </label>
                            <label className="flex items-center space-x-1 cursor-pointer">
                              <div className="w-3 h-3 border-2 border-gray-300 rounded-full"></div>
                              <span className="text-xs text-gray-700">Dark text</span>
                            </label>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center mb-2">
                            <span className="text-sm font-medium text-gray-900 mr-2">Accent 1</span>
                            <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-xs text-gray-500">i</span>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              const rect = e.target.getBoundingClientRect();
                              setShowColorSelector({ 
                                top: rect.bottom + 10, 
                                left: rect.left + rect.width / 2,
                                colorType: 'accent1'
                              });
                            }}
                            className="w-full h-12 rounded mb-1 flex items-center justify-center hover:shadow-md transition-shadow cursor-pointer"
                            style={{ backgroundColor: customColors.accent1 }}
                          >
                            <span className="text-white font-semibold text-xs">{customColors.accent1}</span>
                          </button>
                          <div className="flex items-center space-x-3">
                            <label className="flex items-center space-x-1 cursor-pointer">
                              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                              <span className="text-xs text-gray-700">Light text</span>
                            </label>
                            <label className="flex items-center space-x-1 cursor-pointer">
                              <div className="w-3 h-3 border-2 border-gray-300 rounded-full"></div>
                              <span className="text-xs text-gray-700">Dark text</span>
                            </label>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center mb-2">
                            <span className="text-sm font-medium text-gray-900 mr-2">Accent 2</span>
                            <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-xs text-gray-500">i</span>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              const rect = e.target.getBoundingClientRect();
                              setShowColorSelector({ 
                                top: rect.bottom + 10, 
                                left: rect.left + rect.width / 2,
                                colorType: 'accent2'
                              });
                            }}
                            className="w-full h-12 rounded mb-1 flex items-center justify-center hover:shadow-md transition-shadow cursor-pointer"
                            style={{ backgroundColor: customColors.accent2 }}
                          >
                            <span className="text-white font-semibold text-xs">{customColors.accent2}</span>
                          </button>
                          <div className="flex items-center space-x-3">
                            <label className="flex items-center space-x-1 cursor-pointer">
                              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                              <span className="text-xs text-gray-700">Light text</span>
                            </label>
                            <label className="flex items-center space-x-1 cursor-pointer">
                              <div className="w-3 h-3 border-2 border-gray-300 rounded-full"></div>
                              <span className="text-xs text-gray-700">Dark text</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Background Colors */}
                    <div className="mb-5">
                      <h3 className="text-base font-semibold text-gray-900 mb-3">Background colors</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="flex items-center mb-3">
                            <span className="text-base font-medium text-gray-900 mr-2">Dark background</span>
                            <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-xs text-gray-500">i</span>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              const rect = e.target.getBoundingClientRect();
                              setShowColorSelector({ 
                                top: rect.bottom + 10, 
                                left: rect.left + rect.width / 2,
                                colorType: 'darkBg'
                              });
                            }}
                            className="w-full h-12 rounded mb-1 flex items-center justify-center hover:shadow-md transition-shadow cursor-pointer"
                            style={{ backgroundColor: customColors.darkBg }}
                          >
                            <span className="text-white font-semibold text-xs">{customColors.darkBg}</span>
                          </button>
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <div className="w-4 h-4 bg-teal-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">Light text</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                              <span className="text-sm text-gray-700">Dark text</span>
                            </label>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center mb-3">
                            <span className="text-base font-medium text-gray-900 mr-2">Light background</span>
                            <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-xs text-gray-500">i</span>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              const rect = e.target.getBoundingClientRect();
                              setShowColorSelector({ 
                                top: rect.bottom + 10, 
                                left: rect.left + rect.width / 2,
                                colorType: 'lightBg'
                              });
                            }}
                            className="w-full h-12 rounded mb-1 flex items-center justify-center hover:shadow-md transition-shadow cursor-pointer"
                            style={{ backgroundColor: customColors.lightBg }}
                          >
                            <span className="text-gray-800 font-semibold text-xs">{customColors.lightBg}</span>
                          </button>
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                              <span className="text-sm text-gray-700">Light text</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <div className="w-4 h-4 bg-teal-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">Dark text</span>
                            </label>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center mb-3">
                            <span className="text-base font-medium text-gray-900 mr-2">Body background</span>
                            <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-xs text-gray-500">i</span>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              const rect = e.target.getBoundingClientRect();
                              setShowColorSelector({ 
                                top: rect.bottom + 10, 
                                left: rect.left + rect.width / 2,
                                colorType: 'bodyBg'
                              });
                            }}
                            className="w-full h-12 border-2 border-gray-200 rounded mb-1 flex items-center justify-center hover:shadow-md transition-shadow cursor-pointer"
                            style={{ backgroundColor: customColors.bodyBg }}
                          >
                            <span className="text-gray-800 font-semibold text-xs">{customColors.bodyBg}</span>
                          </button>
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                              <span className="text-sm text-gray-700">Light text</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <div className="w-4 h-4 bg-teal-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">Dark text</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Text Colors */}
                    <div className="mb-4">
                      <h3 className="text-base font-semibold text-gray-900 mb-3">Text colors</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="flex items-center mb-1">
                            <span className="text-xs font-medium text-gray-900 mr-1">Dark text</span>
                            <div className="w-3 h-3 border border-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-xs text-gray-500">i</span>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              const rect = e.target.getBoundingClientRect();
                              setShowColorSelector({ 
                                top: rect.bottom + 10, 
                                left: rect.left + rect.width / 2,
                                colorType: 'darkText'
                              });
                            }}
                            className="w-full h-12 rounded mb-1 hover:shadow-md transition-shadow cursor-pointer"
                            style={{ backgroundColor: customColors.darkText }}
                          ></button>
                          <div className="text-center text-gray-600 font-mono text-xs">{customColors.darkText}</div>
                        </div>
                        <div>
                          <div className="flex items-center mb-1">
                            <span className="text-xs font-medium text-gray-900 mr-1">Light text</span>
                            <div className="w-3 h-3 border border-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-xs text-gray-500">i</span>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              const rect = e.target.getBoundingClientRect();
                              setShowColorSelector({ 
                                top: rect.bottom + 10, 
                                left: rect.left + rect.width / 2,
                                colorType: 'lightText'
                              });
                            }}
                            className="w-full h-12 border-2 border-gray-200 rounded mb-1 hover:shadow-md transition-shadow cursor-pointer"
                            style={{ backgroundColor: customColors.lightText }}
                          ></button>
                          <div className="text-center text-gray-600 font-mono text-xs">{customColors.lightText}</div>
                        </div>
                        <div>
                          <div className="flex items-center mb-1">
                            <span className="text-xs font-medium text-gray-900 mr-1">Link text</span>
                            <div className="w-3 h-3 border border-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-xs text-gray-500">i</span>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              const rect = e.target.getBoundingClientRect();
                              setShowColorSelector({ 
                                top: rect.bottom + 10, 
                                left: rect.left + rect.width / 2,
                                colorType: 'linkText'
                              });
                            }}
                            className="w-full h-12 rounded mb-1 hover:shadow-md transition-shadow cursor-pointer"
                            style={{ backgroundColor: customColors.linkText }}
                          ></button>
                          <div className="text-center text-gray-600 font-mono text-xs">{customColors.linkText}</div>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        const defaultColors = {
                          primary: '#FBAC00',
                          accent1: '#2196F3', 
                          accent2: '#FBAC00',
                          darkBg: '#2A2F34',
                          lightBg: '#F5F5F5',
                          bodyBg: '#FFFFFF',
                          darkText: '#2A2F34',
                          lightText: '#FFFFFF',
                          linkText: '#0064D1'
                        };
                        setCustomColors(defaultColors);
                        const mainIframe = document.querySelector('iframe[srcdoc]');
                        if (mainIframe) {
                          Object.entries(defaultColors).forEach(([colorType, color]) => {
                            applyColorToIframe(mainIframe, colorType, color);
                          });
                        }
                      }}
                      className="text-teal-500 text-sm font-medium hover:text-teal-600 border border-teal-500 px-3 py-1 rounded"
                    >
                      Reset colors
                    </button>
                  </div>
                </div>
              )}
              
              {activeThemeSection === 'typography' && (
                <div className="flex-1">
                  <TypographyPage 
                    onFontChange={(fonts) => {
                      const newChanges = { ...themeChanges, fonts };
                      setThemeChanges(newChanges);
                      
                      // Apply to preview iframe
                      const previewIframe = document.querySelector('#theme-preview-iframe');
                      if (previewIframe) {
                        applyThemeToIframe(previewIframe, newChanges);
                      }
                    }}
                  />
                </div>
              )}
              

            </div>
            
            {/* Preview Area - Always Visible */}
            <div className="flex-1 bg-gray-50">
              <div className="bg-white shadow-sm h-full overflow-hidden">
                <iframe 
                  id="theme-preview-iframe"
                  className="w-full h-full border-0 scale-75 origin-top-left"
                  style={{ width: '133%', height: '133%', pointerEvents: 'auto' }}
                  ref={(iframe) => {
                    if (iframe && !iframe.dataset.loaded) {
                      const mainIframe = document.querySelector('iframe[srcdoc]');
                      if (mainIframe && mainIframe.srcdoc) {
                        iframe.srcdoc = mainIframe.srcdoc;
                        iframe.dataset.loaded = 'true';
                        
                        // Add event listener to handle clicks within iframe
                        iframe.onload = () => {
                          const iframeDoc = iframe.contentDocument;
                          if (iframeDoc) {
                            // Remove all builder-related attributes and classes
                            iframeDoc.querySelectorAll('*').forEach(el => {
                              el.classList.remove('builder-selected', 'builder-hover', 'sortable-ghost', 'sortable-chosen', 'sortable-drag');
                              el.removeAttribute('data-element-type');
                              el.removeAttribute('data-dragging');
                              el.removeAttribute('data-builder-element');
                              el.style.outline = '';
                              el.style.borderTop = '';
                              el.draggable = false;
                            });
                            
                            // Prevent all navigation and clicks
                            iframeDoc.addEventListener('click', (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              return false;
                            });
                            
                            // Prevent form submissions
                            iframeDoc.addEventListener('submit', (e) => {
                              e.preventDefault();
                              return false;
                            });
                          }
                        };
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Bottom Actions */}
          <div className="h-20 p-4 border-t border-gray-200 flex items-center">
            <div className="flex space-x-3">
              <button 
                onClick={() => {
                  saveThemeChanges();
                  setShowThemeExplorer(false);
                  saveProject();
                }}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
              >
                Save & Close
              </button>
              <button 
                onClick={() => {
                  saveThemeChanges();
                  saveProject();
                }}
                className="px-6 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 font-medium"
              >
                Save
              </button>
              <button 
                onClick={() => setShowThemeExplorer(false)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Discard & exit
              </button>
            </div>
          </div>
        </div>
      )}
      
      <ColorSelector
        isOpen={!!showColorSelector}
        onClose={() => setShowColorSelector(false)}
        onColorSelect={(color) => {
          const colorType = showColorSelector.colorType;
          if (colorType) {
            const newColors = { ...customColors, [colorType]: color };
            setCustomColors(newColors);
            
            const previewIframe = document.querySelector('#theme-preview-iframe');
            if (previewIframe?.contentDocument) {
              const doc = previewIframe.contentDocument;
              let style = doc.getElementById('theme-colors-style');
              if (!style) {
                style = doc.createElement('style');
                style.id = 'theme-colors-style';
                doc.head.appendChild(style);
              }
              style.textContent = `
                button, .btn, .btn-primary { background-color: ${newColors.primary} !important; }
                .accent { background-color: ${newColors.accent1} !important; }
                h1, h2, h3, h4, h5, h6, p { color: ${newColors.darkText} !important; }
                a { color: ${newColors.linkText} !important; }
                .dark-bg { background-color: ${newColors.darkBg} !important; }
                .light-bg { background-color: ${newColors.lightBg} !important; }
                body { background-color: ${newColors.bodyBg} !important; }
              `;
            }
          }
          setShowColorSelector(false);
        }}
        position={showColorSelector}
      />
      

    </div>
  );
};

export default BuilderToolbar;