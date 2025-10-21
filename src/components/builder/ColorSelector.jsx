import React, { useState, useRef, useEffect } from 'react';

const ColorSelector = ({ isOpen, onClose, onColorSelect, position }) => {
  const [activeTab, setActiveTab] = useState('HEXA');
  const [currentColor, setCurrentColor] = useState('#2196F3');
  const [hue, setHue] = useState(210);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(60);
  const [alpha, setAlpha] = useState(1);
  const modalRef = useRef(null);
  const colorAreaRef = useRef(null);
  const hueSliderRef = useRef(null);
  const alphaSliderRef = useRef(null);

  const hslToHex = (h, s, l) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  useEffect(() => {
    const hexColor = hslToHex(hue, saturation, lightness);
    setCurrentColor(hexColor);
  }, [hue, saturation, lightness]);

  const applyColorToIframe = (color) => {
    const iframe = document.querySelector('iframe[src*="srcdoc"], iframe[srcdoc]');
    if (iframe && iframe.contentDocument) {
      const iframeDoc = iframe.contentDocument;
      const selectedElement = iframeDoc.querySelector('.builder-selected');
      
      if (selectedElement) {
        if (selectedElement.tagName.toLowerCase() === 'button' || 
            selectedElement.classList.contains('btn') ||
            selectedElement.classList.contains('button')) {
          selectedElement.style.backgroundColor = color;
        } else {
          selectedElement.style.color = color;
        }
      } else {
        const rootStyle = iframeDoc.documentElement.style;
        rootStyle.setProperty('--primary-color', color);
        rootStyle.setProperty('--accent-color', color);
        
        const existingStyle = iframeDoc.querySelector('#color-picker-style');
        if (existingStyle) existingStyle.remove();
        
        const style = iframeDoc.createElement('style');
        style.id = 'color-picker-style';
        style.textContent = `
          .text-primary, .primary-color { color: ${color} !important; }
          .bg-primary, .primary-bg { background-color: ${color} !important; }
          .border-primary { border-color: ${color} !important; }
          .btn-primary { background-color: ${color} !important; }
          a { color: ${color} !important; }
        `;
        iframeDoc.head.appendChild(style);
      }
      
      // Update template colors
      const colorIndex = backgroundColors.indexOf(currentColor);
      const colorKeys = ['primary', 'accent1', 'accent2', 'darkBg', 'lightBg', 'bodyBg'];
      if (colorIndex >= 0 && colorKeys[colorIndex]) {
        setTemplateColors(prev => ({
          ...prev,
          [colorKeys[colorIndex]]: color
        }));
      }
    }
  };

  const handleColorSelect = (color, closeModal = true) => {
    applyColorToIframe(color);
    onColorSelect(color);
    if (closeModal) onClose();
  };

  const [templateColors, setTemplateColors] = useState({
    primary: '#2196F3',
    accent1: '#FBAC00', 
    accent2: '#0064D1',
    darkBg: '#2A2F34',
    lightBg: '#FFFFFF',
    bodyBg: '#F5F5F5'
  });

  const backgroundColors = [
    templateColors.primary,
    templateColors.accent1,
    templateColors.accent2,
    templateColors.darkBg,
    templateColors.lightBg,
    templateColors.bodyBg
  ];

  const colorLabels = ['Primary', 'Accent 1', 'Accent 2', 'Dark BG', 'Light BG', 'Body BG'];

  // Extract colors from iframe on mount
  useEffect(() => {
    const extractTemplateColors = () => {
      const iframe = document.querySelector('iframe[src*="srcdoc"], iframe[srcdoc]');
      if (iframe && iframe.contentDocument) {
        const iframeDoc = iframe.contentDocument;
        const iframeWindow = iframe.contentWindow;
        
        const getComputedColor = (element, property) => {
          if (!element || !iframeWindow) return null;
          const computed = iframeWindow.getComputedStyle(element);
          const color = computed.getPropertyValue(property);
          return color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent' ? color : null;
        };
        
        const rgbToHex = (rgb) => {
          if (!rgb || rgb === 'transparent') return null;
          const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (!match) return rgb.startsWith('#') ? rgb : null;
          const r = parseInt(match[1]);
          const g = parseInt(match[2]);
          const b = parseInt(match[3]);
          return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
        };
        
        const buttons = iframeDoc.querySelectorAll('button, .btn');
        const body = iframeDoc.body;
        const links = iframeDoc.querySelectorAll('a');
        
        const primary = buttons.length > 0 ? rgbToHex(getComputedColor(buttons[0], 'background-color')) : null;
        const bodyBg = rgbToHex(getComputedColor(body, 'background-color'));
        const linkColor = links.length > 0 ? rgbToHex(getComputedColor(links[0], 'color')) : null;
        
        setTemplateColors(prev => ({
          ...prev,
          primary: primary || prev.primary,
          bodyBg: bodyBg || prev.bodyBg,
          accent1: linkColor || prev.accent1
        }));
      }
    };
    
    const timer = setTimeout(extractTemplateColors, 500);
    return () => clearTimeout(timer);
  }, []);
  const colorPalette = [
    ['#FFFFFF', '#2A2F34', '#2196F3', '#E53E3E', '#D53F8C', '#9F7AEA', '#805AD5', '#4C51BF'],
    ['#2B6CB0', '#2C7A7B', '#2F855A', '#68D391', '#9AE6B4', '#F6E05E', '#F6AD55', '#ED8936'],
    ['#DD6B20', '#C05621', '#8B4513', '#A0AEC0', '#718096', '#4A5568', '#2D3748', '#1A202C']
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getPosition = () => {
    if (!position) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    const modalWidth = 280;
    const modalHeight = 400;
    const padding = 10;
    
    let top = position.top;
    let left = position.left - modalWidth / 2;
    
    // Keep within viewport bounds
    if (typeof window !== 'undefined') {
      if (left < padding) left = padding;
      if (left + modalWidth > window.innerWidth - padding) {
        left = window.innerWidth - modalWidth - padding;
      }
      if (top + modalHeight > window.innerHeight - padding) {
        top = position.top - modalHeight - 10;
      }
    }
    
    return { top: `${top}px`, left: `${left}px`, transform: 'none' };
  };

  return (
    <div className="fixed inset-0 z-50">
      <div 
        ref={modalRef} 
        className="absolute bg-gray-900 rounded-lg shadow-xl text-white p-3" 
        style={{ 
          ...getPosition(),
          width: '280px' 
        }}
      >
        {/* Color Picker */}
        <div className="relative mb-3">
          <div 
            ref={colorAreaRef}
            className="w-full h-24 rounded mb-2 relative cursor-crosshair" 
            style={{ background: `linear-gradient(to right, white, transparent), linear-gradient(to bottom, transparent, black), hsl(${hue}, 100%, 50%)` }}
            onMouseDown={(e) => {
              const handleMove = (e) => {
                const rect = colorAreaRef.current.getBoundingClientRect();
                const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
                const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
                setSaturation((x / rect.width) * 100);
                setLightness(100 - (y / rect.height) * 100);
                const newColor = hslToHex(hue, (x / rect.width) * 100, 100 - (y / rect.height) * 100);
                applyColorToIframe(newColor);
              };
              const handleUp = () => {
                document.removeEventListener('mousemove', handleMove);
                document.removeEventListener('mouseup', handleUp);
              };
              handleMove(e);
              document.addEventListener('mousemove', handleMove);
              document.addEventListener('mouseup', handleUp);
            }}
          >
            <div className="absolute w-3 h-3 border-2 border-white rounded-full bg-white" style={{ top: `${100 - lightness}%`, left: `${saturation}%`, transform: 'translate(-50%, -50%)' }}></div>
          </div>
          <div className="space-y-2">
            <div 
              ref={hueSliderRef}
              className="w-full h-3 rounded cursor-pointer" 
              style={{ background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }}
              onMouseDown={(e) => {
                const handleMove = (e) => {
                  const rect = hueSliderRef.current.getBoundingClientRect();
                  const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
                  const newHue = (x / rect.width) * 360;
                  setHue(newHue);
                  const newColor = hslToHex(newHue, saturation, lightness);
                  applyColorToIframe(newColor);
                };
                const handleUp = () => {
                  document.removeEventListener('mousemove', handleMove);
                  document.removeEventListener('mouseup', handleUp);
                };
                handleMove(e);
                document.addEventListener('mousemove', handleMove);
                document.addEventListener('mouseup', handleUp);
              }}
            >

            </div>
            <div 
              ref={alphaSliderRef}
              className="w-full h-3 rounded relative cursor-pointer" 
              style={{ 
                background: `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
              }}
              onMouseDown={(e) => {
                const handleMove = (e) => {
                  const rect = alphaSliderRef.current.getBoundingClientRect();
                  const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
                  setAlpha(x / rect.width);
                };
                const handleUp = () => {
                  document.removeEventListener('mousemove', handleMove);
                  document.removeEventListener('mouseup', handleUp);
                };
                handleMove(e);
                document.addEventListener('mousemove', handleMove);
                document.addEventListener('mouseup', handleUp);
              }}
            >
              <div 
                className="absolute inset-0 rounded" 
                style={{ background: `linear-gradient(to right, transparent, ${currentColor})` }}
              />
              <div className="absolute w-1 h-3 border border-white bg-white" style={{ left: `${alpha * 100}%`, top: 0, transform: 'translateX(-50%)' }}></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-2 border-b border-gray-700">
          <button onClick={() => setActiveTab('HEXA')} className={`px-2 py-1 text-xs ${activeTab === 'HEXA' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}>HEXA</button>
          <button onClick={() => setActiveTab('RGBA')} className={`px-2 py-1 text-xs ${activeTab === 'RGBA' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}>RGBA</button>
        </div>

        {/* Color Value */}
        <div className="bg-gray-800 rounded px-2 py-1 mb-2 text-center text-xs">{currentColor}</div>

        {/* Background Colors */}
        <div className="mb-2">
          <h3 className="text-xs mb-1 text-gray-300">Your background colors</h3>
          <div className="grid grid-cols-6 gap-1">
            {backgroundColors.map((color, i) => (
              <button key={i} onClick={() => {
                setCurrentColor(color);
                const r = parseInt(color.slice(1, 3), 16) / 255;
                const g = parseInt(color.slice(3, 5), 16) / 255;
                const b = parseInt(color.slice(5, 7), 16) / 255;
                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const diff = max - min;
                const add = max + min;
                const l = add * 0.5;
                let s, h;
                if (diff === 0) {
                  s = h = 0;
                } else {
                  s = l < 0.5 ? diff / add : diff / (2 - add);
                  switch (max) {
                    case r: h = ((g - b) / diff) + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / diff + 2; break;
                    case b: h = (r - g) / diff + 4; break;
                  }
                  h /= 6;
                }
                setHue(h * 360);
                setSaturation(s * 100);
                setLightness(l * 100);
              }} className="w-full h-6 rounded border border-gray-600 hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>

        {/* Current Color */}
        <div className="mb-2">
          <h3 className="text-xs mb-1 text-gray-300">Current selection</h3>
          <div className="w-full h-8 rounded border border-gray-600 relative overflow-hidden">
            <div className="absolute inset-0 rounded" style={{ backgroundColor: currentColor }}></div>
            <button onClick={() => handleColorSelect(currentColor, true)} className="w-full h-full hover:scale-105 transition-transform bg-transparent" />
          </div>
        </div>

        {/* Color Palette */}
        <div className="space-y-1">
          {colorPalette.map((row, i) => (
            <div key={i} className="grid grid-cols-8 gap-1">
              {row.map((color, j) => (
                <button key={j} onClick={() => { setCurrentColor(color); handleColorSelect(color, false); }} className="w-full h-5 rounded hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorSelector;