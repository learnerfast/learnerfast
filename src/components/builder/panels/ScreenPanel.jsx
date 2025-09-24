import React, { useState } from 'react';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Eye, 
  EyeOff, 
  Settings,
  Palette,
  Image as ImageIcon,
  Grid,
  Square,
  RotateCw
} from 'lucide-react';
import { useBuilder } from '../../../contexts/BuilderContext';
import FontSelector from '../FontSelector';
import ColorExtractor from '../ColorExtractor';

const Toggle = ({ label, enabled, setEnabled, description }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm text-gray-700 font-medium">{label}</span>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  </div>
);

const SliderInput = ({ label, value, onChange, min = 0, max = 100, unit = '%', step = 1 }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700 font-medium">{label}</span>
      <span className="text-sm text-gray-600">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      style={{
        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`
      }}
    />
  </div>
);

const ColorInput = ({ label, value, onChange }) => {
  const handleColorChange = (e) => {
    const newColor = e.target.value;
    console.log('Color input changed:', label, newColor);
    
    // Apply to iframe immediately
    const iframe = document.querySelector('iframe[src*="srcdoc"], iframe[srcdoc]');
    if (iframe && iframe.contentDocument) {
      const iframeDoc = iframe.contentDocument;
      const selectedElement = iframeDoc.querySelector('.builder-selected');
      
      if (selectedElement) {
        if (label.toLowerCase().includes('background')) {
          selectedElement.style.backgroundColor = newColor;
        } else if (label.toLowerCase().includes('text') || label.toLowerCase().includes('color')) {
          selectedElement.style.color = newColor;
        } else if (label.toLowerCase().includes('border')) {
          selectedElement.style.borderColor = newColor;
        }
        console.log('Applied color to selected element:', selectedElement.tagName, newColor);
      }
    }
    
    onChange(e);
  };
  
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700 font-medium">{label}</span>
      <div className="flex items-center space-x-2 border border-gray-300 rounded-md p-2 cursor-pointer hover:border-gray-400 transition-colors">
        <input
          type="color"
          value={value}
          onChange={handleColorChange}
          className="w-4 h-4 rounded border border-gray-300 cursor-pointer"
        />
        <span className="text-xs text-gray-600">{value}</span>
      </div>
    </div>
  );
};

const SelectInput = ({ label, value, options, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-700 font-medium">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

const ScreenPanel = () => {
  const { deviceMode, switchDeviceMode, selectedElement, updateElement } = useBuilder();
  
  // Screen settings state
  const [screenSettings, setScreenSettings] = useState({
    overlay: false,
    overlayColor: '#101c1e',
    overlayOpacity: 50,
    screenCaption: false,
    captionColor: '#28313a',
    captionPosition: 'bottom',
    popup: false,
    fullscreen: false,
    autoRotate: false,
    fitToScreen: true
  });



  // Background settings
  const [backgroundSettings, setBackgroundSettings] = useState({
    backgroundColor: '#ffffff',
    backgroundImage: '',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'scroll'
  });



  const handleUpdateScreenSettings = (key, value) => {
    setScreenSettings(prev => ({ ...prev, [key]: value }));
    
    if (selectedElement?.element) {
      const element = selectedElement.element;
      
      switch (key) {
        case 'overlay':
          if (value) {
            element.style.position = 'relative';
            const overlay = element.querySelector('.screen-overlay') || document.createElement('div');
            overlay.className = 'screen-overlay';
            overlay.style.cssText = `
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: ${screenSettings.overlayColor};
              opacity: ${screenSettings.overlayOpacity / 100};
              pointer-events: none;
              z-index: 1;
            `;
            if (!element.querySelector('.screen-overlay')) {
              element.appendChild(overlay);
            }
          } else {
            const overlay = element.querySelector('.screen-overlay');
            if (overlay) overlay.remove();
          }
          break;
        case 'overlayColor':
          const overlay = element.querySelector('.screen-overlay');
          if (overlay) overlay.style.backgroundColor = value;
          break;
        case 'overlayOpacity':
          const overlayEl = element.querySelector('.screen-overlay');
          if (overlayEl) overlayEl.style.opacity = value / 100;
          break;
        case 'screenCaption':
          if (value) {
            const caption = element.querySelector('.screen-caption') || document.createElement('div');
            caption.className = 'screen-caption';
            caption.textContent = 'Screen Caption';
            caption.style.cssText = `
              position: absolute;
              ${screenSettings.captionPosition}: 0;
              left: 0;
              width: 100%;
              background-color: ${screenSettings.captionColor};
              color: white;
              padding: 8px;
              text-align: center;
              font-size: 14px;
              z-index: 2;
            `;
            if (!element.querySelector('.screen-caption')) {
              element.appendChild(caption);
            }
          } else {
            const caption = element.querySelector('.screen-caption');
            if (caption) caption.remove();
          }
          break;
        case 'captionColor':
          const caption = element.querySelector('.screen-caption');
          if (caption) caption.style.backgroundColor = value;
          break;
        case 'captionPosition':
          const captionEl = element.querySelector('.screen-caption');
          if (captionEl) {
            captionEl.style.top = value === 'top' ? '0' : '';
            captionEl.style.bottom = value === 'bottom' ? '0' : '';
            captionEl.style.top = value === 'center' ? '50%' : captionEl.style.top;
            captionEl.style.transform = value === 'center' ? 'translateY(-50%)' : '';
          }
          break;
        case 'popup':
          element.style.cursor = value ? 'pointer' : 'default';
          break;
        case 'autoRotate':
          if (value) {
            element.style.animation = 'rotate 10s linear infinite';
            const style = document.createElement('style');
            style.textContent = '@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
            if (!document.querySelector('style[data-rotate]')) {
              style.setAttribute('data-rotate', 'true');
              document.head.appendChild(style);
            }
          } else {
            element.style.animation = '';
          }
          break;
        case 'fitToScreen':
          if (value) {
            element.style.width = '100%';
            element.style.height = '100%';
            element.style.objectFit = 'contain';
          } else {
            element.style.width = '';
            element.style.height = '';
            element.style.objectFit = '';
          }
          break;
        case 'fullscreen':
          if (value) {
            element.style.position = 'fixed';
            element.style.top = '0';
            element.style.left = '0';
            element.style.width = '100vw';
            element.style.height = '100vh';
            element.style.zIndex = '9999';
          } else {
            element.style.position = '';
            element.style.top = '';
            element.style.left = '';
            element.style.width = '';
            element.style.height = '';
            element.style.zIndex = '';
          }
          break;
      }
    }
  };



  const handleUpdateBackgroundSettings = (key, value) => {
    setBackgroundSettings(prev => ({ ...prev, [key]: value }));
    
    if (selectedElement?.element) {
      const element = selectedElement.element;
      
      switch (key) {
        case 'backgroundColor':
          element.style.backgroundColor = value;
          break;
        case 'backgroundImage':
          element.style.backgroundImage = value ? `url(${value})` : '';
          break;
        case 'backgroundSize':
          element.style.backgroundSize = value;
          break;
        case 'backgroundPosition':
          element.style.backgroundPosition = value;
          break;
        case 'backgroundRepeat':
          element.style.backgroundRepeat = value;
          break;
        case 'backgroundAttachment':
          element.style.backgroundAttachment = value;
          break;
      }
    }
  };

  return (
    <div className="space-y-6">

      {/* Screen Overlay */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
          <Square className="h-3 w-3 mr-1" />
          Screen Overlay
        </h4>
        
        <Toggle
          label="Apply overlay"
          enabled={screenSettings.overlay}
          setEnabled={(value) => handleUpdateScreenSettings('overlay', value)}
          description="Add a color overlay to the screen"
        />
        
        {screenSettings.overlay && (
          <div className="space-y-3 pl-4 border-l-2 border-blue-100">
            <ColorInput
              label="Overlay color"
              value={screenSettings.overlayColor}
              onChange={(e) => handleUpdateScreenSettings('overlayColor', e.target.value)}
            />
            <SliderInput 
              label="Opacity" 
              value={screenSettings.overlayOpacity} 
              onChange={(value) => handleUpdateScreenSettings('overlayOpacity', value)}
            />
          </div>
        )}
      </div>

      {/* Screen Caption */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
          <ImageIcon className="h-3 w-3 mr-1" />
          Screen Caption
        </h4>
        
        <Toggle
          label="Add screen caption"
          enabled={screenSettings.screenCaption}
          setEnabled={(value) => handleUpdateScreenSettings('screenCaption', value)}
          description="Display a caption overlay"
        />
        
        {screenSettings.screenCaption && (
          <div className="space-y-3 pl-4 border-l-2 border-blue-100">
            <ColorInput
              label="Background color"
              value={screenSettings.captionColor}
              onChange={(e) => handleUpdateScreenSettings('captionColor', e.target.value)}
            />
            <SelectInput
              label="Position"
              value={screenSettings.captionPosition}
              options={[
                { value: 'top', label: 'Top' },
                { value: 'bottom', label: 'Bottom' },
                { value: 'center', label: 'Center' }
              ]}
              onChange={(value) => handleUpdateScreenSettings('captionPosition', value)}
            />
          </div>
        )}
      </div>



      {/* Color Extractor */}
      <ColorExtractor />

      {/* Background Settings */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
          <Palette className="h-3 w-3 mr-1" />
          Background
        </h4>
        
        <div className="space-y-3">
          <ColorInput
            label="Background Color"
            value={backgroundSettings.backgroundColor}
            onChange={(e) => handleUpdateBackgroundSettings('backgroundColor', e.target.value)}
          />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">Background Image</span>
            <input
              type="url"
              placeholder="Image URL"
              value={backgroundSettings.backgroundImage}
              onChange={(e) => handleUpdateBackgroundSettings('backgroundImage', e.target.value)}
              className="w-32 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <SelectInput
            label="Background Size"
            value={backgroundSettings.backgroundSize}
            options={[
              { value: 'cover', label: 'Cover' },
              { value: 'contain', label: 'Contain' },
              { value: 'auto', label: 'Auto' },
              { value: '100% 100%', label: 'Stretch' }
            ]}
            onChange={(value) => handleUpdateBackgroundSettings('backgroundSize', value)}
          />
          
          <SelectInput
            label="Background Position"
            value={backgroundSettings.backgroundPosition}
            options={[
              { value: 'center', label: 'Center' },
              { value: 'top', label: 'Top' },
              { value: 'bottom', label: 'Bottom' },
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' }
            ]}
            onChange={(value) => handleUpdateBackgroundSettings('backgroundPosition', value)}
          />
          
          <SelectInput
            label="Background Repeat"
            value={backgroundSettings.backgroundRepeat}
            options={[
              { value: 'no-repeat', label: 'No Repeat' },
              { value: 'repeat', label: 'Repeat' },
              { value: 'repeat-x', label: 'Repeat X' },
              { value: 'repeat-y', label: 'Repeat Y' }
            ]}
            onChange={(value) => handleUpdateBackgroundSettings('backgroundRepeat', value)}
          />
          
          <SelectInput
            label="Background Attachment"
            value={backgroundSettings.backgroundAttachment}
            options={[
              { value: 'scroll', label: 'Scroll' },
              { value: 'fixed', label: 'Fixed' },
              { value: 'local', label: 'Local' }
            ]}
            onChange={(value) => handleUpdateBackgroundSettings('backgroundAttachment', value)}
          />
        </div>
      </div>

      {/* Element Styling */}
      {selectedElement && (
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
            <Palette className="h-3 w-3 mr-1" />
            Element Styling
          </h4>
          
          <div className="space-y-3">
            <ColorInput
              label="Text Color"
              value={selectedElement?.element?.style.color || "#000000"}
              onChange={(e) => {
                if (selectedElement?.element) {
                  selectedElement.element.style.color = e.target.value;
                  console.log('Text color updated:', e.target.value);
                }
              }}
            />
            
            <ColorInput
              label="Background Color"
              value={selectedElement?.element?.style.backgroundColor || "#ffffff"}
              onChange={(e) => {
                if (selectedElement?.element) {
                  selectedElement.element.style.backgroundColor = e.target.value;
                }
              }}
            />
            
            <ColorInput
              label="Border Color"
              value={selectedElement?.element?.style.borderColor || "#000000"}
              onChange={(e) => {
                if (selectedElement?.element) {
                  selectedElement.element.style.borderColor = e.target.value;
                }
              }}
            />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">Font Size</span>
              <input
                type="number"
                min="8"
                max="72"
                defaultValue="16"
                onChange={(e) => {
                  if (selectedElement?.element) {
                    selectedElement.element.style.fontSize = e.target.value + 'px';
                  }
                }}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <FontSelector
              label="Font Family"
              value={selectedElement?.element?.style.fontFamily?.replace(/["']/g, '').split(',')[0] || "Arial"}
              onChange={(value) => {
                if (selectedElement?.element) {
                  selectedElement.element.style.fontFamily = value;
                }
              }}
            />
            
            <SelectInput
              label="Font Weight"
              value={selectedElement?.element?.style.fontWeight || "normal"}
              options={[
                { value: 'normal', label: 'Normal' },
                { value: 'bold', label: 'Bold' },
                { value: 'lighter', label: 'Light' },
                { value: '100', label: '100' },
                { value: '300', label: '300' },
                { value: '500', label: '500' },
                { value: '700', label: '700' },
                { value: '900', label: '900' }
              ]}
              onChange={(value) => {
                if (selectedElement?.element) {
                  selectedElement.element.style.fontWeight = value;
                }
              }}
            />
            
            <SelectInput
              label="Text Align"
              value={selectedElement?.element?.style.textAlign || "left"}
              options={[
                { value: 'left', label: 'Left' },
                { value: 'center', label: 'Center' },
                { value: 'right', label: 'Right' },
                { value: 'justify', label: 'Justify' }
              ]}
              onChange={(value) => {
                if (selectedElement?.element) {
                  selectedElement.element.style.textAlign = value;
                }
              }}
            />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">Line Height</span>
              <input
                type="number"
                min="0.5"
                max="3"
                step="0.1"
                defaultValue="1.5"
                onChange={(e) => {
                  if (selectedElement?.element) {
                    selectedElement.element.style.lineHeight = e.target.value;
                  }
                }}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">Letter Spacing</span>
              <input
                type="number"
                min="-2"
                max="10"
                step="0.1"
                defaultValue="0"
                onChange={(e) => {
                  if (selectedElement?.element) {
                    selectedElement.element.style.letterSpacing = e.target.value + 'px';
                  }
                }}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">Padding</span>
              <input
                type="number"
                min="0"
                max="100"
                defaultValue="0"
                onChange={(e) => {
                  if (selectedElement?.element) {
                    selectedElement.element.style.padding = e.target.value + 'px';
                  }
                }}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">Margin</span>
              <input
                type="number"
                min="0"
                max="100"
                defaultValue="0"
                onChange={(e) => {
                  if (selectedElement?.element) {
                    selectedElement.element.style.margin = e.target.value + 'px';
                  }
                }}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">Border Width</span>
              <input
                type="number"
                min="0"
                max="20"
                defaultValue="0"
                onChange={(e) => {
                  if (selectedElement?.element) {
                    selectedElement.element.style.borderWidth = e.target.value + 'px';
                    selectedElement.element.style.borderStyle = 'solid';
                  }
                }}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">Border Radius</span>
              <input
                type="number"
                min="0"
                max="50"
                defaultValue="0"
                onChange={(e) => {
                  if (selectedElement?.element) {
                    selectedElement.element.style.borderRadius = e.target.value + 'px';
                  }
                }}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <SliderInput 
              label="Opacity" 
              value={parseFloat(selectedElement?.element?.style.opacity || 1) * 100} 
              onChange={(value) => {
                if (selectedElement?.element) {
                  selectedElement.element.style.opacity = value / 100;
                }
              }}
              unit="%"
            />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">Edit Text</span>
              <button
                onClick={() => {
                  if (selectedElement?.element) {
                    const element = selectedElement.element;
                    element.setAttribute('contenteditable', 'true');
                    element.style.outline = '2px solid #3b82f6';
                    element.focus();
                    
                    const handleKeyDown = (e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        element.setAttribute('contenteditable', 'false');
                        element.style.outline = '';
                        element.removeEventListener('keydown', handleKeyDown);
                      }
                    };
                    
                    element.addEventListener('keydown', handleKeyDown);
                  }
                }}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
              >
                Edit
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">Box Shadow</span>
              <button
                onClick={() => {
                  if (selectedElement?.element) {
                    const current = selectedElement.element.style.boxShadow;
                    selectedElement.element.style.boxShadow = current ? '' : '0 4px 6px rgba(0, 0, 0, 0.1)';
                  }
                }}
                className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
              >
                Toggle
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">Text Shadow</span>
              <button
                onClick={() => {
                  if (selectedElement?.element) {
                    const current = selectedElement.element.style.textShadow;
                    selectedElement.element.style.textShadow = current ? '' : '2px 2px 4px rgba(0, 0, 0, 0.3)';
                  }
                }}
                className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
              >
                Toggle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen Options */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
          <Settings className="h-3 w-3 mr-1" />
          Screen Options
        </h4>
        
        <div className="space-y-3">
          <Toggle
            label="Open in pop-up window"
            enabled={screenSettings.popup}
            setEnabled={(value) => handleUpdateScreenSettings('popup', value)}
            description="Open content in a modal popup"
          />
          
          <Toggle
            label="Fullscreen mode"
            enabled={screenSettings.fullscreen}
            setEnabled={(value) => handleUpdateScreenSettings('fullscreen', value)}
            description="Display in fullscreen mode"
          />
          
          <Toggle
            label="Auto-rotate"
            enabled={screenSettings.autoRotate}
            setEnabled={(value) => handleUpdateScreenSettings('autoRotate', value)}
            description="Auto-rotate on device orientation change"
          />
          
          <Toggle
            label="Fit to screen"
            enabled={screenSettings.fitToScreen}
            setEnabled={(value) => handleUpdateScreenSettings('fitToScreen', value)}
            description="Scale content to fit screen"
          />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">Screen Zoom</span>
            <input
              type="range"
              min="50"
              max="200"
              defaultValue="100"
              onChange={(e) => {
                if (selectedElement?.element) {
                  selectedElement.element.style.transform = `scale(${e.target.value / 100})`;
                }
              }}
              className="w-20"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenPanel;
