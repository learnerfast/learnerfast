import React, { useState } from 'react';
import { 
  Layout, 
  Move, 
  Maximize, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  AlignJustify,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Square,
  Circle,
  Grid,
  Layers,
  RotateCw,
  FlipHorizontal,
  FlipVertical
} from 'lucide-react';
import { useBuilder } from '../../../contexts/BuilderContext';

const NumberInput = ({ label, value, onChange, unit, min, max, step = 1 }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-700 font-medium">{label}</span>
    <div className="flex items-center space-x-1">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {unit && <span className="text-xs text-gray-500">{unit}</span>}
    </div>
  </div>
);

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

const AlignmentButtons = ({ value, onChange, type = 'horizontal' }) => {
  const horizontalOptions = [
    { value: 'left', icon: AlignLeft, label: 'Left' },
    { value: 'center', icon: AlignCenter, label: 'Center' },
    { value: 'right', icon: AlignRight, label: 'Right' },
    { value: 'justify', icon: AlignJustify, label: 'Justify' }
  ];

  const verticalOptions = [
    { value: 'top', icon: AlignVerticalJustifyStart, label: 'Top' },
    { value: 'middle', icon: AlignVerticalJustifyCenter, label: 'Middle' },
    { value: 'bottom', icon: AlignVerticalJustifyEnd, label: 'Bottom' }
  ];

  const options = type === 'horizontal' ? horizontalOptions : verticalOptions;

  return (
    <div className="flex space-x-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`p-2 rounded border transition-colors ${
            value === option.value
              ? 'border-blue-500 bg-blue-50 text-blue-600'
              : 'border-gray-200 hover:border-gray-300 text-gray-600'
          }`}
          title={option.label}
        >
          <option.icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
};

const SpacingControls = ({ spacing, onChange, label }) => (
  <div className="space-y-3">
    <h5 className="text-xs font-medium text-gray-600">{label}</h5>
    <div className="grid grid-cols-2 gap-2">
      <NumberInput
        label="Top"
        value={spacing.top}
        onChange={(value) => onChange({ ...spacing, top: value })}
        unit="px"
        min={0}
      />
      <NumberInput
        label="Right"
        value={spacing.right}
        onChange={(value) => onChange({ ...spacing, right: value })}
        unit="px"
        min={0}
      />
      <NumberInput
        label="Bottom"
        value={spacing.bottom}
        onChange={(value) => onChange({ ...spacing, bottom: value })}
        unit="px"
        min={0}
      />
      <NumberInput
        label="Left"
        value={spacing.left}
        onChange={(value) => onChange({ ...spacing, left: value })}
        unit="px"
        min={0}
      />
    </div>
  </div>
);

const LayoutPanel = () => {
  const { selectedElement, updateElement } = useBuilder();
  
  // Layout settings state
  const [layoutSettings, setLayoutSettings] = useState({
    // Position
    position: 'relative',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
    
    // Size
    width: 'auto',
    height: 'auto',
    minWidth: 0,
    minHeight: 0,
    maxWidth: 'none',
    maxHeight: 'none',
    
    // Display
    display: 'block',
    visibility: 'visible',
    opacity: 100,
    overflow: 'visible',
    
    // Flexbox
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    flexWrap: 'nowrap',
    gap: 0,
    
    // Grid
    gridColumns: 12,
    gridRows: 'auto',
    gridGap: 0,
    
    // Transform
    rotate: 0,
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    skewY: 0,
    translateX: 0,
    translateY: 0,
    
    // Alignment
    textAlign: 'left',
    verticalAlign: 'top'
  });

  // Spacing settings
  const [spacing, setSpacing] = useState({
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    padding: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  const handleUpdateLayoutSettings = (key, value) => {
    const newSettings = { ...layoutSettings, [key]: value };
    setLayoutSettings(newSettings);
    
    if (selectedElement?.element) {
      const element = selectedElement.element;
      element.style[key] = value;
    }
  };

  const handleUpdateSpacing = (type, value) => {
    const newSpacing = { ...spacing, [type]: value };
    setSpacing(newSpacing);
    
    if (selectedElement?.element) {
      const element = selectedElement.element;
      if (type === 'margin') {
        element.style.margin = `${value.top}px ${value.right}px ${value.bottom}px ${value.left}px`;
      } else if (type === 'padding') {
        element.style.padding = `${value.top}px ${value.right}px ${value.bottom}px ${value.left}px`;
      }
    }
  };

  const positionOptions = [
    { value: 'static', label: 'Static' },
    { value: 'relative', label: 'Relative' },
    { value: 'absolute', label: 'Absolute' },
    { value: 'fixed', label: 'Fixed' },
    { value: 'sticky', label: 'Sticky' }
  ];

  const displayOptions = [
    { value: 'block', label: 'Block' },
    { value: 'inline', label: 'Inline' },
    { value: 'inline-block', label: 'Inline Block' },
    { value: 'flex', label: 'Flex' },
    { value: 'grid', label: 'Grid' },
    { value: 'none', label: 'None' }
  ];

  const overflowOptions = [
    { value: 'visible', label: 'Visible' },
    { value: 'hidden', label: 'Hidden' },
    { value: 'scroll', label: 'Scroll' },
    { value: 'auto', label: 'Auto' }
  ];

  return (
    <div className="space-y-6">
      {/* Position */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
          <Move className="h-3 w-3 mr-1" />
          Position
        </h4>
        
        <SelectInput
          label="Position"
          value={layoutSettings.position}
          options={positionOptions}
          onChange={(value) => {
            if (selectedElement?.element) {
              selectedElement.element.style.position = value;
            }
          }}
        />
        
        {layoutSettings.position !== 'static' && (
          <div className="grid grid-cols-2 gap-2 pl-4 border-l-2 border-blue-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">Top</span>
              <input
                type="number"
                defaultValue="0"
                onChange={(e) => {
                  if (selectedElement?.element) {
                    selectedElement.element.style.top = e.target.value + 'px';
                  }
                }}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">Right</span>
              <input
                type="number"
                defaultValue="0"
                onChange={(e) => {
                  if (selectedElement?.element) {
                    selectedElement.element.style.right = e.target.value + 'px';
                  }
                }}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">Bottom</span>
              <input
                type="number"
                defaultValue="0"
                onChange={(e) => {
                  if (selectedElement?.element) {
                    selectedElement.element.style.bottom = e.target.value + 'px';
                  }
                }}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">Left</span>
              <input
                type="number"
                defaultValue="0"
                onChange={(e) => {
                  if (selectedElement?.element) {
                    selectedElement.element.style.left = e.target.value + 'px';
                  }
                }}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 font-medium">Z-Index</span>
          <input
            type="number"
            defaultValue="1"
            onChange={(e) => {
              if (selectedElement?.element) {
                selectedElement.element.style.zIndex = e.target.value;
              }
            }}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Size */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
          <Maximize className="h-3 w-3 mr-1" />
          Size
        </h4>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <span className="text-xs text-gray-600">Width</span>
            <input
              type="text"
              value={layoutSettings.width}
              onChange={(e) => handleUpdateLayoutSettings('width', e.target.value)}
              placeholder="auto"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <span className="text-xs text-gray-600">Height</span>
            <input
              type="text"
              value={layoutSettings.height}
              onChange={(e) => handleUpdateLayoutSettings('height', e.target.value)}
              placeholder="auto"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">Min Width</span>
            <input
              type="number"
              defaultValue="0"
              onChange={(e) => {
                if (selectedElement?.element) {
                  selectedElement.element.style.minWidth = e.target.value + 'px';
                }
              }}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">Min Height</span>
            <input
              type="number"
              defaultValue="0"
              onChange={(e) => {
                if (selectedElement?.element) {
                  selectedElement.element.style.minHeight = e.target.value + 'px';
                }
              }}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Display & Visibility */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
          <Square className="h-3 w-3 mr-1" />
          Display & Visibility
        </h4>
        
        <SelectInput
          label="Display"
          value={layoutSettings.display}
          options={displayOptions}
          onChange={(value) => {
            if (selectedElement?.element) {
              selectedElement.element.style.display = value;
            }
          }}
        />
        
        <SelectInput
          label="Overflow"
          value={layoutSettings.overflow}
          options={overflowOptions}
          onChange={(value) => {
            if (selectedElement?.element) {
              selectedElement.element.style.overflow = value;
            }
          }}
        />
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 font-medium">Opacity</span>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="100"
            onChange={(e) => {
              if (selectedElement?.element) {
                selectedElement.element.style.opacity = e.target.value / 100;
              }
            }}
            className="w-24"
          />
        </div>
      </div>

      {/* Spacing */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
          <Grid className="h-3 w-3 mr-1" />
          Spacing
        </h4>
        
        <SpacingControls
          spacing={spacing.margin}
          onChange={(value) => handleUpdateSpacing('margin', value)}
          label="Margin"
        />
        
        <SpacingControls
          spacing={spacing.padding}
          onChange={(value) => handleUpdateSpacing('padding', value)}
          label="Padding"
        />
      </div>

      {/* Flexbox (when display is flex) */}
      {layoutSettings.display === 'flex' && (
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
            <Layers className="h-3 w-3 mr-1" />
            Flexbox
          </h4>
          
          <SelectInput
            label="Direction"
            value={layoutSettings.flexDirection}
            options={[
              { value: 'row', label: 'Row' },
              { value: 'column', label: 'Column' },
              { value: 'row-reverse', label: 'Row Reverse' },
              { value: 'column-reverse', label: 'Column Reverse' }
            ]}
            onChange={(value) => handleUpdateLayoutSettings('flexDirection', value)}
          />
          
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-700 font-medium mb-2 block">Justify Content</span>
              <AlignmentButtons
                value={layoutSettings.justifyContent}
                onChange={(value) => handleUpdateLayoutSettings('justifyContent', value)}
                type="horizontal"
              />
            </div>
            
            <div>
              <span className="text-sm text-gray-700 font-medium mb-2 block">Align Items</span>
              <AlignmentButtons
                value={layoutSettings.alignItems}
                onChange={(value) => handleUpdateLayoutSettings('alignItems', value)}
                type="vertical"
              />
            </div>
          </div>
          
          <NumberInput
            label="Gap"
            value={layoutSettings.gap}
            onChange={(value) => handleUpdateLayoutSettings('gap', value)}
            unit="px"
            min={0}
          />
        </div>
      )}

      {/* Transform */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
          <RotateCw className="h-3 w-3 mr-1" />
          Transform
        </h4>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">Rotate</span>
            <input
              type="number"
              defaultValue="0"
              onChange={(e) => {
                if (selectedElement?.element) {
                  selectedElement.element.style.transform = `rotate(${e.target.value}deg)`;
                }
              }}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">Scale X</span>
            <input
              type="number"
              step="0.1"
              defaultValue="1"
              onChange={(e) => {
                if (selectedElement?.element) {
                  selectedElement.element.style.transform = `scaleX(${e.target.value})`;
                }
              }}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">Scale Y</span>
            <input
              type="number"
              step="0.1"
              defaultValue="1"
              onChange={(e) => {
                if (selectedElement?.element) {
                  selectedElement.element.style.transform = `scaleY(${e.target.value})`;
                }
              }}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">Skew X</span>
            <input
              type="number"
              defaultValue="0"
              onChange={(e) => {
                if (selectedElement?.element) {
                  selectedElement.element.style.transform = `skewX(${e.target.value}deg)`;
                }
              }}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">Translate X</span>
            <input
              type="number"
              defaultValue="0"
              onChange={(e) => {
                if (selectedElement?.element) {
                  selectedElement.element.style.transform = `translateX(${e.target.value}px)`;
                }
              }}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">Translate Y</span>
            <input
              type="number"
              defaultValue="0"
              onChange={(e) => {
                if (selectedElement?.element) {
                  selectedElement.element.style.transform = `translateY(${e.target.value}px)`;
                }
              }}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Alignment */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
          <AlignCenter className="h-3 w-3 mr-1" />
          Alignment
        </h4>
        
        <div className="space-y-3">
          <div>
            <span className="text-sm text-gray-700 font-medium mb-2 block">Text Align</span>
            <AlignmentButtons
              value={layoutSettings.textAlign}
              onChange={(value) => handleUpdateLayoutSettings('textAlign', value)}
              type="horizontal"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Quick Actions
        </h4>
        
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              if (selectedElement?.element) {
                selectedElement.element.style.display = 'flex';
                selectedElement.element.style.justifyContent = 'center';
                selectedElement.element.style.alignItems = 'center';
              }
            }}
            className="p-2 text-center border border-gray-200 rounded hover:border-gray-300 transition-colors"
          >
            <div className="w-4 h-4 mx-auto mb-1 bg-blue-500 rounded"></div>
            <p className="text-xs">Center</p>
          </button>
          
          <button
            onClick={() => {
              if (selectedElement?.element) {
                selectedElement.element.style.display = 'flex';
                selectedElement.element.style.justifyContent = 'space-between';
              }
            }}
            className="p-2 text-center border border-gray-200 rounded hover:border-gray-300 transition-colors"
          >
            <div className="flex justify-between w-4 mx-auto mb-1">
              <div className="w-1 h-4 bg-green-500 rounded"></div>
              <div className="w-1 h-4 bg-green-500 rounded"></div>
            </div>
            <p className="text-xs">Space</p>
          </button>
          
          <button
            onClick={() => {
              if (selectedElement?.element) {
                selectedElement.element.style.width = '100%';
                selectedElement.element.style.height = '100%';
              }
            }}
            className="p-2 text-center border border-gray-200 rounded hover:border-gray-300 transition-colors"
          >
            <div className="w-4 h-4 mx-auto mb-1 bg-purple-500 rounded border-2 border-purple-300"></div>
            <p className="text-xs">Full</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LayoutPanel;
