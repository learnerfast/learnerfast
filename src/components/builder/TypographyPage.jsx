import React, { useState } from 'react';
import { Plus, Info } from 'lucide-react';
import FontSelector from './FontSelector';

const TypographyPage = ({ onFontChange }) => {
  const [fonts, setFonts] = useState({ headings: 'Poppins', mainText: 'Raleway' });
  const [fontSizes, setFontSizes] = useState({
    h1: 44, h2: 38, h3: 28,
    large: 20, normal: 17, small: 15
  });
  
  const updateFont = (type, value) => {
    const newFonts = { ...fonts, [type]: value };
    setFonts(newFonts);
    
    const iframe = document.querySelector('#theme-preview-iframe');
    if (iframe?.contentDocument) {
      const doc = iframe.contentDocument;
      let style = doc.getElementById('theme-fonts-style');
      if (!style) {
        style = doc.createElement('style');
        style.id = 'theme-fonts-style';
        doc.head.appendChild(style);
      }
      style.textContent = `
        h1, h2, h3, h4, h5, h6 { font-family: "${newFonts.headings}", sans-serif !important; }
        body, p, span, div { font-family: "${newFonts.mainText}", sans-serif !important; }
      `;
    }
    
    if (onFontChange) {
      onFontChange({
        heading: `"${newFonts.headings}", ${newFonts.headings === 'Poppins' ? 'sans-serif' : 'serif'}`,
        body: `"${newFonts.mainText}", ${newFonts.mainText === 'Raleway' ? 'sans-serif' : 'serif'}`,
        sizes: fontSizes
      });
    }
  };
  
  const updateFontSize = (type, size) => {
    const newSizes = { ...fontSizes, [type]: size };
    setFontSizes(newSizes);
    
    const iframe = document.querySelector('#theme-preview-iframe');
    if (iframe?.contentDocument) {
      const doc = iframe.contentDocument;
      let style = doc.getElementById('theme-font-sizes-style');
      if (!style) {
        style = doc.createElement('style');
        style.id = 'theme-font-sizes-style';
        doc.head.appendChild(style);
      }
      style.textContent = `
        h1 { font-size: ${newSizes.h1}px !important; }
        h2 { font-size: ${newSizes.h2}px !important; }
        h3 { font-size: ${newSizes.h3}px !important; }
        .text-large { font-size: ${newSizes.large}px !important; }
        body, p { font-size: ${newSizes.normal}px !important; }
        .text-small, small { font-size: ${newSizes.small}px !important; }
      `;
    }
    
    if (onFontChange) {
      onFontChange({
        heading: `"${fonts.headings}", ${fonts.headings === 'Poppins' ? 'sans-serif' : 'serif'}`,
        body: `"${fonts.mainText}", ${fonts.mainText === 'Raleway' ? 'sans-serif' : 'serif'}`,
        sizes: newSizes
      });
    }
  };

  return (
    <div className="w-[600px] p-4 space-y-4 overflow-y-auto typography-editor-ui">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Typography</h2>
        <p className="text-gray-500 mb-4 text-sm">The font families and text sizes included in your site.</p>
        
        {/* Font families */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <h3 className="text-base font-semibold text-gray-900" style={{fontFamily: 'system-ui, sans-serif'}}>Font families</h3>
            <Info className="w-4 h-4 ml-2 text-gray-500" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2" style={{fontFamily: 'system-ui, sans-serif'}}>Headings</label>
              <FontSelector value={fonts.headings} onChange={(v) => updateFont('headings', v)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2" style={{fontFamily: 'system-ui, sans-serif'}}>Main text</label>
              <FontSelector value={fonts.mainText} onChange={(v) => updateFont('mainText', v)} />
            </div>
          </div>
        </div>

        {/* Text sizes */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4" style={{fontFamily: 'system-ui, sans-serif'}}>Text sizes</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3" style={{fontFamily: 'system-ui, sans-serif'}}>Headings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span style={{fontFamily: 'system-ui, sans-serif', fontSize: '14px'}} className="text-gray-700">H1 normal</span>
                    <span className="font-bold text-2xl text-gray-900" style={{fontFamily: 'system-ui, sans-serif'}}>Sample</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <input type="number" value={fontSizes.h1 || 44} onChange={(e) => updateFontSize('h1', parseInt(e.target.value))} className="w-12 px-1 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900" style={{fontFamily: 'system-ui, sans-serif'}} />
                    <span className="text-sm text-gray-500" style={{fontFamily: 'system-ui, sans-serif'}}>px</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span style={{fontFamily: 'system-ui, sans-serif', fontSize: '14px'}} className="text-gray-700">H2 normal</span>
                    <span className="font-bold text-xl text-gray-900" style={{fontFamily: 'system-ui, sans-serif'}}>Sample</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <input type="number" value={fontSizes.h2 || 38} onChange={(e) => updateFontSize('h2', parseInt(e.target.value))} className="w-12 px-1 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900" style={{fontFamily: 'system-ui, sans-serif'}} />
                    <span className="text-sm text-gray-500" style={{fontFamily: 'system-ui, sans-serif'}}>px</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span style={{fontFamily: 'system-ui, sans-serif', fontSize: '14px'}} className="text-gray-700">H3 normal</span>
                    <span className="font-bold text-lg text-gray-900" style={{fontFamily: 'system-ui, sans-serif'}}>Sample</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <input type="number" value={fontSizes.h3 || 28} onChange={(e) => updateFontSize('h3', parseInt(e.target.value))} className="w-12 px-1 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900" style={{fontFamily: 'system-ui, sans-serif'}} />
                    <span className="text-sm text-gray-500" style={{fontFamily: 'system-ui, sans-serif'}}>px</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3" style={{fontFamily: 'system-ui, sans-serif'}}>Main text</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span style={{fontFamily: 'system-ui, sans-serif', fontSize: '14px'}} className="text-gray-700">Large</span>
                    <span className="text-lg text-gray-900" style={{fontFamily: 'system-ui, sans-serif'}}>Sample</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <input type="number" value={fontSizes.large || 20} onChange={(e) => updateFontSize('large', parseInt(e.target.value))} className="w-12 px-1 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900" style={{fontFamily: 'system-ui, sans-serif'}} />
                    <span className="text-sm text-gray-500" style={{fontFamily: 'system-ui, sans-serif'}}>px</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span style={{fontFamily: 'system-ui, sans-serif', fontSize: '14px'}} className="text-gray-700">Normal</span>
                    <span className="text-base text-gray-900" style={{fontFamily: 'system-ui, sans-serif'}}>Sample</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <input type="number" value={fontSizes.normal || 17} onChange={(e) => updateFontSize('normal', parseInt(e.target.value))} className="w-12 px-1 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900" style={{fontFamily: 'system-ui, sans-serif'}} />
                    <span className="text-sm text-gray-500" style={{fontFamily: 'system-ui, sans-serif'}}>px</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span style={{fontFamily: 'system-ui, sans-serif', fontSize: '14px'}} className="text-gray-700">Small</span>
                    <span className="text-sm text-gray-900" style={{fontFamily: 'system-ui, sans-serif'}}>Sample</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <input type="number" value={fontSizes.small || 15} onChange={(e) => updateFontSize('small', parseInt(e.target.value))} className="w-12 px-1 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900" style={{fontFamily: 'system-ui, sans-serif'}} />
                    <span className="text-sm text-gray-500" style={{fontFamily: 'system-ui, sans-serif'}}>px</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypographyPage;