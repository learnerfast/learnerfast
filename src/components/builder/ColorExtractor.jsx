import React, { useState, useEffect } from 'react';
import { Palette, RefreshCw } from 'lucide-react';

const ColorExtractor = () => {
  const [extractedColors, setExtractedColors] = useState({});
  const [isExtracting, setIsExtracting] = useState(false);

  const extractColorsFromIframe = () => {
    setIsExtracting(true);
    
    const iframe = document.querySelector('iframe[src*="srcdoc"], iframe[srcdoc]');
    if (!iframe || !iframe.contentDocument || !iframe.contentDocument.body) {
      setIsExtracting(false);
      return;
    }

    const iframeDoc = iframe.contentDocument;
    const iframeWindow = iframe.contentWindow;

    console.log('Iframe found:', !!iframe);
    console.log('Document and window found:', !!iframeDoc, !!iframeWindow);

    const getComputedColor = (element, property) => {
      if (!element || !iframeWindow) return null;
      const computed = iframeWindow.getComputedStyle(element);
      const color = computed.getPropertyValue(property);
      return color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent' ? color : null;
    };

    const rgbToHex = (rgb) => {
      if (!rgb || rgb === 'transparent') return null;
      const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) return rgb.startsWith('#') ? rgb : null;
      return '#' + [1,2,3].map(i => parseInt(match[i]).toString(16).padStart(2, '0')).join('');
    };

    const findColorBySelectors = (selectors, property) => {
      for (const selector of selectors) {
        const elements = iframeDoc.querySelectorAll(selector);
        for (const el of elements) {
          const color = getComputedColor(el, property);
          if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
            return rgbToHex(color);
          }
        }
      }
      return null;
    };

    const colors = {
      primary: findColorBySelectors([
        'button:not(.secondary):not(.outline)',
        '.btn-primary', '.btn:not(.btn-secondary)',
        '.bg-primary', '.primary',
        'input[type="submit"]'
      ], 'background-color'),
      
      secondary: findColorBySelectors([
        '.btn-secondary', 'button.secondary',
        '.bg-secondary', '.secondary'
      ], 'background-color'),
      
      accent1: findColorBySelectors([
        '.accent', '.highlight', '.featured',
        'nav', 'header', '.hero'
      ], 'background-color'),
      
      accent2: findColorBySelectors([
        '.card', '.box', 'section:nth-child(2)',
        'footer', '.cta'
      ], 'background-color'),
      
      headingText: findColorBySelectors([
        'h1', 'h2', 'h3'
      ], 'color'),
      
      bodyText: findColorBySelectors([
        'p', 'body', '.content'
      ], 'color'),
      
      linkText: findColorBySelectors([
        'a:not(.btn)', '.link'
      ], 'color'),
      
      background: rgbToHex(getComputedColor(iframeDoc.body, 'background-color'))
    };

    // Filter out null values and provide defaults
    Object.keys(colors).forEach(key => {
      if (!colors[key]) {
        colors[key] = key === 'background' ? '#ffffff' : '#000000';
      }
    });

    console.log('Extracted colors:', colors);
    setExtractedColors(colors);
    setIsExtracting(false);

    return colors;
  };

  const applyColorToTemplate = (colorKey, newColor) => {
    const iframe = document.querySelector('iframe[src*="srcdoc"], iframe[srcdoc]');
    if (!iframe || !iframe.contentDocument || !iframe.contentDocument.body) {
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
    
    const colorMap = {
      primary: {
        bg: ['button:not(.secondary)', '.btn-primary', '.btn:not(.btn-secondary)', '.bg-primary', 'input[type="submit"]'],
        text: ['.text-primary'],
        border: ['.border-primary']
      },
      secondary: {
        bg: ['.btn-secondary', 'button.secondary', '.bg-secondary'],
        text: ['.text-secondary']
      },
      accent1: {
        bg: ['.accent', '.highlight', 'nav', 'header', '.hero', '.bg-accent'],
        text: ['.text-accent']
      },
      accent2: {
        bg: ['.card', '.box', 'footer', '.cta', '.bg-accent-2'],
        text: ['.text-accent-2']
      },
      headingText: {
        text: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', '.heading']
      },
      bodyText: {
        text: ['p', 'body', '.content', 'div']
      },
      linkText: {
        text: ['a:not(.btn):not(.button)', '.link']
      },
      background: {
        bg: ['body', '.main-content', '.wrapper']
      }
    };

    const config = colorMap[colorKey];
    if (config) {
      if (config.bg) cssRules += config.bg.map(s => `${s} { background-color: ${newColor} !important; }`).join('\n');
      if (config.text) cssRules += config.text.map(s => `${s} { color: ${newColor} !important; }`).join('\n');
      if (config.border) cssRules += config.border.map(s => `${s} { border-color: ${newColor} !important; }`).join('\n');
      cssRules += `:root { --${colorKey}: ${newColor} !important; }`;
    }
    
    style.textContent = cssRules;
    iframeDoc.head.appendChild(style);
    
    setExtractedColors(prev => ({
      ...prev,
      [colorKey]: newColor
    }));
  };

  // Auto-extract colors when component mounts or iframe loads
  useEffect(() => {
    // Expose extraction function globally
    window.extractColors = extractColorsFromIframe;
    
    const checkAndExtract = () => {
      const iframe = document.querySelector('iframe[src*="srcdoc"], iframe[srcdoc]');
      if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
        extractColorsFromIframe();
      }
    };
    
    const timer = setTimeout(checkAndExtract, 1500);

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

      <div className="space-y-2">
        {Object.entries(extractedColors).map(([key, color]) => (
          <div key={key} className="flex items-center space-x-2">
            <input
              type="color"
              value={color || '#000000'}
              onChange={(e) => applyColorToTemplate(key, e.target.value)}
              className="w-8 h-8 rounded border border-gray-300 cursor-pointer flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className="text-xs text-gray-500 font-mono truncate">
                {color || '#000000'}
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