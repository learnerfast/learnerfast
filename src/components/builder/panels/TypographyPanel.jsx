import React, { useState } from 'react';
import { Type } from 'lucide-react';
import FontSelector from '../FontSelector';
import { useBuilder } from '../../../contexts/BuilderContext';

const TypographyPanel = () => {
  const { selectedElement } = useBuilder();
  
  const [typographySettings, setTypographySettings] = useState({
    headingFont: 'Poppins',
    mainTextFont: 'Arial'
  });

  const handleFontChange = (type, font) => {
    setTypographySettings(prev => ({
      ...prev,
      [type]: font
    }));

    // Apply font to iframe document
    const iframe = document.querySelector('iframe');
    if (iframe?.contentDocument) {
      const doc = iframe.contentDocument;
      
      if (type === 'headingFont') {
        // Apply to all heading elements
        const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(heading => {
          heading.style.fontFamily = font;
        });
      } else if (type === 'mainTextFont') {
        // Apply to body and paragraph elements
        const body = doc.body;
        if (body) {
          body.style.fontFamily = font;
        }
        const paragraphs = doc.querySelectorAll('p, div, span');
        paragraphs.forEach(p => {
          if (!p.closest('h1, h2, h3, h4, h5, h6')) {
            p.style.fontFamily = font;
          }
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
          <Type className="h-3 w-3 mr-1" />
          Typography
        </h4>
        
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Font Families</h5>
            
            <div className="space-y-4">
              <div>
                <FontSelector
                  label="Headings"
                  value={typographySettings.headingFont}
                  onChange={(font) => handleFontChange('headingFont', font)}
                />
                <p className="text-xs text-gray-500 mt-1">Font for h1, h2, h3, h4, h5, h6 elements</p>
              </div>
              
              <div>
                <FontSelector
                  label="Main text"
                  value={typographySettings.mainTextFont}
                  onChange={(font) => handleFontChange('mainTextFont', font)}
                />
                <p className="text-xs text-gray-500 mt-1">Font for body text and paragraphs</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Preview</h5>
            <div className="space-y-2">
              <h3 style={{ fontFamily: typographySettings.headingFont }} className="text-lg font-semibold">
                Heading Sample
              </h3>
              <p style={{ fontFamily: typographySettings.mainTextFont }} className="text-sm text-gray-600">
                This is how your main text will look with the selected font family.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypographyPanel;