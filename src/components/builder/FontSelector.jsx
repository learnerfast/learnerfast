import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const FONTS = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New',
  'Trebuchet MS', 'Arial Black', 'Impact', 'Comic Sans MS', 'Palatino',
  'Garamond', 'Bookman', 'Avant Garde', 'Tahoma', 'Geneva', 'Lucida Console',
  'Monaco', 'Brush Script MT', 'Lucida Handwriting', 'Copperplate', 'Papyrus',
  'Chalkduster', 'Hoefler Text', 'Optima', 'Gill Sans', 'Futura', 'Century Gothic',
  'Franklin Gothic Medium', 'Calibri', 'Cambria', 'Candara', 'Consolas', 'Constantia',
  'Corbel', 'Segoe UI', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Source Sans Pro', 'Raleway', 'Ubuntu', 'Nunito', 'Playfair Display', 'Merriweather',
  'Oswald', 'PT Sans', 'Droid Sans'
];

const FontSelector = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentValue, setCurrentValue] = useState(value);
  const dropdownRef = useRef(null);

  const filteredFonts = FONTS.filter(font =>
    font.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {label && <span className="block text-sm text-gray-700 font-medium mb-2">{label}</span>}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-400 transition-colors"
      >
        <span className="truncate" style={{ fontFamily: currentValue }}>{currentValue}</span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-64 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search fonts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="max-h-40 overflow-y-auto">
            {filteredFonts.map((font) => (
              <button
                key={font}
                onClick={() => {
                  setCurrentValue(font);
                  onChange(font);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${
                  currentValue === font ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                }`}
                style={{ fontFamily: font }}
              >
                {font}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FontSelector;