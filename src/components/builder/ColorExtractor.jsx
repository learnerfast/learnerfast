import React, { useState, useEffect } from 'react';
import { Palette, RefreshCw } from 'lucide-react';

const ColorExtractor = () => {
  const [extractedColors, setExtractedColors] = useState({});
  const [isExtracting, setIsExtracting] = useState(false);

  const extractColorsFromIframe = () => {
    setIsExtracting(true);
    
    const iframe = document.querySelector('iframe[src*="srcdoc"], iframe[srcdoc]');
    if (!iframe || !iframe.contentDocument) {
      console.error('Iframe not found or no content');
      setIsExtracting(false);
      return;
    }

    const iframeDoc = iframe.contentDocument;
    const iframeWindow = iframe.contentWindow;

    console.log('Iframe found:', !!iframe);
    console.log('Document and window found:', !!iframeDoc, !!iframeWindow);

    // Extract colors from various elements
    const buttons = iframeDoc.querySelectorAll('button, .btn, .button, input[type="submit"], input[type="button"]');
    const headings = iframeDoc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const links = iframeDoc.querySelectorAll('a');
    const body = iframeDoc.body;

    console.log('Buttons found:', buttons.length);
    console.log('Headings found:', headings.length);
    console.log('Links found:', links.length);

    // Get computed styles
    const getComputedColor = (element, property) => {
      if (!element || !iframeWindow) return null;
      const computed = iframeWindow.getComputedStyle(element);
      const color = computed.getPropertyValue(property);
      return color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent' ? color : null;
    };

    // Convert RGB to HEX
    const rgbToHex = (rgb) => {
      if (!rgb || rgb === 'transparent') return null;
      
      const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!match) return rgb.startsWith('#') ? rgb : null;
      
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      
      return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    };

    // Extract primary color from buttons
    let primaryColor = null;
    if (buttons.length > 0) {
      const buttonColor = getComputedColor(buttons[0], 'background-color');
      primaryColor = rgbToHex(buttonColor);
      console.log('Primary color found:', primaryColor);
    }

    // Extract heading color
    let headingColor = null;
    if (headings.length > 0) {
      const hColor = getComputedColor(headings[0], 'color');
      headingColor = rgbToHex(hColor);
      console.log('Heading color:', headingColor);
    }

    // Extract body background
    let bodyBgColor = null;
    if (body) {
      const bgColor = getComputedColor(body, 'background-color');
      bodyBgColor = rgbToHex(bgColor);
      console.log('Body bg color:', bodyBgColor);
    }

    // Extract link color
    let linkColor = null;
    if (links.length > 0) {
      const lColor = getComputedColor(links[0], 'color');
      linkColor = rgbToHex(lColor);
      console.log('Link color:', linkColor);
    }

    const colors = {
      primary: primaryColor || '#ff6b35',
      darkText: headingColor || '#ffffff',
      bodyBg: bodyBgColor || '#0f0f0f',
      linkText: linkColor || '#ff6b35',
      accent1: primaryColor || '#ff6b35',
      accent2: linkColor || '#ff6b35'
    };

    console.log('Extracted colors:', colors);
    setExtractedColors(colors);
    setIsExtracting(false);

    return colors;
  };

  const applyColorToTemplate = (colorKey, newColor) => {
    console.log('Applying color:', colorKey, newColor);
    
    const iframe = document.querySelector('iframe[src*="srcdoc"], iframe[srcdoc]');
    if (!iframe || !iframe.contentDocument) {
      console.error('Iframe not found for color application');
      return;
    }

    const iframeDoc = iframe.contentDocument;
    
    // Remove existing color override styles
    const existingStyle = iframeDoc.querySelector('#color-overrides');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create new style element
    const style = iframeDoc.createElement('style');
    style.id = 'color-overrides';
    
    let cssRules = '';
    
    switch (colorKey) {
      case 'primary':
        cssRules = `
          button:not(.secondary):not(.outline), .btn:not(.btn-secondary):not(.btn-outline), .button:not(.secondary), input[type="submit"], input[type="button"] {
            background-color: ${newColor} !important;
          }
          .bg-primary, .primary-bg, .btn-primary {
            background-color: ${newColor} !important;
          }
          .text-primary, .primary-color {
            color: ${newColor} !important;
          }
          .border-primary {
            border-color: ${newColor} !important;
          }
          /* CSS Variables */
          :root {
            --primary-color: ${newColor} !important;
            --accent-color: ${newColor} !important;
          }
        `;
        break;
      case 'linkText':
        cssRules = `
          a:not(.btn):not(.button) {
            color: ${newColor} !important;
          }
          .link-color {
            color: ${newColor} !important;
          }
          :root {
            --link-color: ${newColor} !important;
          }
        `;
        break;
      case 'darkText':
        cssRules = `
          h1, h2, h3, h4, h5, h6, .heading {
            color: ${newColor} !important;
          }
          .heading-color, .text-dark {
            color: ${newColor} !important;
          }
          :root {
            --heading-color: ${newColor} !important;
            --text-dark: ${newColor} !important;
          }
        `;
        break;
      case 'bodyBg':
        cssRules = `
          body, .main-content, .content {
            background-color: ${newColor} !important;
          }
          :root {
            --body-bg: ${newColor} !important;
            --background-color: ${newColor} !important;
          }
        `;
        break;
      case 'accent1':
      case 'accent2':
        cssRules = `
          .${colorKey}, .accent {
            color: ${newColor} !important;
          }
          .bg-${colorKey}, .bg-accent {
            background-color: ${newColor} !important;
          }
          :root {
            --${colorKey}: ${newColor} !important;
          }
        `;
        break;
      default:
        cssRules = `
          .${colorKey} {
            color: ${newColor} !important;
          }
          .bg-${colorKey} {
            background-color: ${newColor} !important;
          }
          :root {
            --${colorKey}: ${newColor} !important;
          }
        `;
    }
    
    style.textContent = cssRules;
    iframeDoc.head.appendChild(style);
    
    // Update extracted colors state
    setExtractedColors(prev => ({
      ...prev,
      [colorKey]: newColor
    }));
    
    console.log('Color applied successfully:', colorKey, newColor);
    
    // Show toast notification
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast(`${colorKey} color updated!`, 'success');
    }
  };

  // Auto-extract colors when component mounts or iframe loads
  useEffect(() => {
    // Expose extraction function globally
    window.extractColors = extractColorsFromIframe;
    
    const timer = setTimeout(() => {
      extractColorsFromIframe();
    }, 1000);

    return () => {
      clearTimeout(timer);
      delete window.extractColors;
    };
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Palette className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-800">Theme Colors</h3>
        </div>
        <button
          onClick={extractColorsFromIframe}
          disabled={isExtracting}
          className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${isExtracting ? 'animate-spin' : ''}`} />
          <span>Extract</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(extractedColors).map(([key, color]) => (
          <div key={key} className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 flex-1">
              <input
                type="color"
                value={color || '#000000'}
                onChange={(e) => applyColorToTemplate(key, e.target.value)}
                className="w-6 h-6 rounded border border-gray-300 cursor-pointer"
              />
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  {color || '#000000'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(extractedColors).length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">No colors extracted yet</p>
          <p className="text-xs text-gray-400 mt-1">Click Extract to analyze template colors</p>
        </div>
      )}
    </div>
  );
};

export default ColorExtractor;