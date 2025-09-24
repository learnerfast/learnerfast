import React, { useState } from 'react';
import { 
  Wand2, 
  Play, 
  Pause, 
  RotateCw, 
  Zap, 
  Eye,
  Sparkles,
  Wind,
  Sun,
  Moon,
  Droplets,
  Snowflake,
  Flame,
  Clock,
  Layers,
  Filter,
  Palette
} from 'lucide-react';
import { useBuilder } from '../../../contexts/BuilderContext';

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

const SliderInput = ({ label, value, onChange, min = 0, max = 100, unit = '', step = 1 }) => (
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

const AnimationPreset = ({ name, icon: Icon, description, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`p-3 border rounded-lg transition-all text-left ${
      isActive 
        ? 'border-blue-500 bg-blue-50 text-blue-700' 
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
    }`}
  >
    <div className="flex items-center space-x-2 mb-1">
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{name}</span>
    </div>
    <p className="text-xs text-gray-500">{description}</p>
  </button>
);

const EffectsPanel = () => {
  const { selectedElement, updateElement } = useBuilder();
  
  // Animation settings
  const [animationSettings, setAnimationSettings] = useState({
    entranceAnimation: false,
    entranceType: 'fadeIn',
    entranceDuration: 1000,
    entranceDelay: 0,
    entranceEasing: 'ease-in-out',
    
    scrollAnimation: false,
    scrollType: 'parallax',
    scrollSpeed: 0.5,
    scrollDirection: 'vertical',
    scrollTrigger: 'onScroll',
    
    hoverAnimation: false,
    hoverType: 'scale',
    hoverDuration: 300,
    hoverEasing: 'ease-out',
    
    autoAnimation: false,
    autoType: 'pulse',
    autoInterval: 3000,
    autoIterations: 'infinite'
  });

  // Filter effects
  const [filterSettings, setFilterSettings] = useState({
    blur: 0,
    brightness: 100,
    contrast: 100,
    grayscale: 0,
    hueRotate: 0,
    invert: 0,
    opacity: 100,
    saturate: 100,
    sepia: 0,
    dropShadow: false,
    shadowX: 0,
    shadowY: 4,
    shadowBlur: 8,
    shadowColor: '#000000',
    shadowOpacity: 25
  });

  // Transform effects
  const [transformSettings, setTransformSettings] = useState({
    perspective: 1000,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    skewY: 0,
    translateX: 0,
    translateY: 0,
    translateZ: 0
  });

  // Transition settings
  const [transitionSettings, setTransitionSettings] = useState({
    transitionProperty: 'all',
    transitionDuration: 300,
    transitionDelay: 0,
    transitionEasing: 'ease-in-out'
  });

  const animationTypes = [
    { value: 'fadeIn', label: 'Fade In', icon: Sun },
    { value: 'fadeOut', label: 'Fade Out', icon: Moon },
    { value: 'slideInLeft', label: 'Slide In Left', icon: Wind },
    { value: 'slideInRight', label: 'Slide In Right', icon: Wind },
    { value: 'slideInUp', label: 'Slide In Up', icon: Wind },
    { value: 'slideInDown', label: 'Slide In Down', icon: Wind },
    { value: 'zoomIn', label: 'Zoom In', icon: Sparkles },
    { value: 'zoomOut', label: 'Zoom Out', icon: Sparkles },
    { value: 'rotateIn', label: 'Rotate In', icon: RotateCw },
    { value: 'bounce', label: 'Bounce', icon: Droplets },
    { value: 'pulse', label: 'Pulse', icon: Zap },
    { value: 'shake', label: 'Shake', icon: Snowflake },
    { value: 'flip', label: 'Flip', icon: RotateCw },
    { value: 'float', label: 'Float', icon: Wind }
  ];

  const easingOptions = [
    { value: 'ease', label: 'Ease' },
    { value: 'ease-in', label: 'Ease In' },
    { value: 'ease-out', label: 'Ease Out' },
    { value: 'ease-in-out', label: 'Ease In Out' },
    { value: 'linear', label: 'Linear' },
    { value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', label: 'Bounce' }
  ];

  const handleUpdateAnimationSettings = (key, value) => {
    const newSettings = { ...animationSettings, [key]: value };
    setAnimationSettings(newSettings);
    
    if (selectedElement?.element) {
      const element = selectedElement.element;
      
      if (key === 'entranceAnimation' && value) {
        element.style.animation = `${newSettings.entranceType} ${newSettings.entranceDuration}ms ${newSettings.entranceEasing} ${newSettings.entranceDelay}ms`;
      } else if (key === 'entranceType' && newSettings.entranceAnimation) {
        element.style.animation = `${value} ${newSettings.entranceDuration}ms ${newSettings.entranceEasing} ${newSettings.entranceDelay}ms`;
      }
    }
  };

  const handleUpdateFilterSettings = (key, value) => {
    const newSettings = { ...filterSettings, [key]: value };
    setFilterSettings(newSettings);
    
    if (selectedElement?.element) {
      const element = selectedElement.element;
      
      const filters = [
        newSettings.blur > 0 ? `blur(${newSettings.blur}px)` : '',
        newSettings.brightness !== 100 ? `brightness(${newSettings.brightness}%)` : '',
        newSettings.contrast !== 100 ? `contrast(${newSettings.contrast}%)` : '',
        newSettings.grayscale > 0 ? `grayscale(${newSettings.grayscale}%)` : '',
        newSettings.hueRotate > 0 ? `hue-rotate(${newSettings.hueRotate}deg)` : '',
        newSettings.saturate !== 100 ? `saturate(${newSettings.saturate}%)` : '',
        newSettings.dropShadow ? `drop-shadow(${newSettings.shadowX}px ${newSettings.shadowY}px ${newSettings.shadowBlur}px rgba(0,0,0,${newSettings.shadowOpacity/100}))` : ''
      ].filter(f => f).join(' ');
      
      element.style.filter = filters || 'none';
    }
  };

  const handleUpdateTransformSettings = (key, value) => {
    const newSettings = { ...transformSettings, [key]: value };
    setTransformSettings(newSettings);
    
    if (selectedElement?.element) {
      const element = selectedElement.element;
      
      const transforms = [
        newSettings.rotateX !== 0 ? `rotateX(${newSettings.rotateX}deg)` : '',
        newSettings.rotateY !== 0 ? `rotateY(${newSettings.rotateY}deg)` : '',
        newSettings.rotateZ !== 0 ? `rotateZ(${newSettings.rotateZ}deg)` : '',
        newSettings.scaleX !== 1 || newSettings.scaleY !== 1 ? `scale(${newSettings.scaleX}, ${newSettings.scaleY})` : '',
        newSettings.skewX !== 0 ? `skewX(${newSettings.skewX}deg)` : '',
        newSettings.skewY !== 0 ? `skewY(${newSettings.skewY}deg)` : '',
        newSettings.translateX !== 0 || newSettings.translateY !== 0 ? `translate(${newSettings.translateX}px, ${newSettings.translateY}px)` : ''
      ].filter(t => t).join(' ');
      
      element.style.transform = transforms || 'none';
    }
  };

  const handleUpdateTransitionSettings = (key, value) => {
    const newSettings = { ...transitionSettings, [key]: value };
    setTransitionSettings(newSettings);
    
    if (selectedElement?.element) {
      const element = selectedElement.element;
      element.style.transition = `${newSettings.transitionProperty} ${newSettings.transitionDuration}ms ${newSettings.transitionEasing} ${newSettings.transitionDelay}ms`;
    }
  };

  const handleApplyAnimationPreset = (type) => {
    setAnimationSettings(prev => ({ ...prev, entranceAnimation: true, entranceType: type }));
    
    if (selectedElement?.element) {
      const element = selectedElement.element;
      element.style.animation = `${type} ${animationSettings.entranceDuration}ms ${animationSettings.entranceEasing} ${animationSettings.entranceDelay}ms`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Entrance Animations */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
          <Play className="h-3 w-3 mr-1" />
          Entrance Animation
        </h4>
        
        <Toggle
          label="Apply entrance animation"
          enabled={animationSettings.entranceAnimation}
          setEnabled={(value) => handleUpdateAnimationSettings('entranceAnimation', value)}
          description="Animate element when it enters the viewport"
        />
        
        {animationSettings.entranceAnimation && (
          <div className="space-y-3 pl-4 border-l-2 border-blue-100">
            <SelectInput
              label="Animation Type"
              value={animationSettings.entranceType}
              options={animationTypes}
              onChange={(value) => handleUpdateAnimationSettings('entranceType', value)}
            />
            
            <SliderInput
              label="Duration"
              value={animationSettings.entranceDuration}
              onChange={(value) => handleUpdateAnimationSettings('entranceDuration', value)}
              min={100}
              max={5000}
              unit="ms"
              step={100}
            />
            
            <SliderInput
              label="Delay"
              value={animationSettings.entranceDelay}
              onChange={(value) => handleUpdateAnimationSettings('entranceDelay', value)}
              min={0}
              max={5000}
              unit="ms"
              step={100}
            />
            
            <SelectInput
              label="Easing"
              value={animationSettings.entranceEasing}
              options={easingOptions}
              onChange={(value) => handleUpdateAnimationSettings('entranceEasing', value)}
            />
          </div>
        )}
      </div>

      {/* Animation Presets */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
          <Sparkles className="h-3 w-3 mr-1" />
          Animation Presets
        </h4>
        
        <div className="grid grid-cols-2 gap-2">
          {animationTypes.slice(0, 6).map((animation) => (
            <AnimationPreset
              key={animation.value}
              name={animation.label}
              icon={animation.icon}
              description={`Apply ${animation.label.toLowerCase()} effect`}
              onClick={() => handleApplyAnimationPreset(animation.value)}
              isActive={animationSettings.entranceType === animation.value && animationSettings.entranceAnimation}
            />
          ))}
        </div>
      </div>

      {/* Scroll Effects */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
          <Wind className="h-3 w-3 mr-1" />
          Scroll Effects
        </h4>
        
        <Toggle
          label="Apply scroll animation"
          enabled={animationSettings.scrollAnimation}
          setEnabled={(value) => handleUpdateAnimationSettings('scrollAnimation', value)}
          description="Animate element while scrolling"
        />
        
        {animationSettings.scrollAnimation && (
          <div className="space-y-3 pl-4 border-l-2 border-blue-100">
            <SelectInput
              label="Effect Type"
              value={animationSettings.scrollType}
              options={[
                { value: 'parallax', label: 'Parallax' },
                { value: 'fadeScroll', label: 'Fade on Scroll' },
                { value: 'scaleScroll', label: 'Scale on Scroll' },
                { value: 'rotateScroll', label: 'Rotate on Scroll' }
              ]}
              onChange={(value) => handleUpdateAnimationSettings('scrollType', value)}
            />
            
            <SliderInput
              label="Speed"
              value={animationSettings.scrollSpeed}
              onChange={(value) => handleUpdateAnimationSettings('scrollSpeed', value)}
              min={0.1}
              max={2}
              step={0.1}
            />
          </div>
        )}
      </div>

      {/* Hover Effects */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
          <Eye className="h-3 w-3 mr-1" />
          Hover Effects
        </h4>
        
        <Toggle
          label="Apply hover animation"
          enabled={animationSettings.hoverAnimation}
          setEnabled={(value) => handleUpdateAnimationSettings('hoverAnimation', value)}
          description="Animate element on hover"
        />
        
        {animationSettings.hoverAnimation && (
          <div className="space-y-3 pl-4 border-l-2 border-blue-100">
            <SelectInput
              label="Hover Type"
              value={animationSettings.hoverType}
              options={[
                { value: 'scale', label: 'Scale' },
                { value: 'rotate', label: 'Rotate' },
                { value: 'lift', label: 'Lift' },
                { value: 'glow', label: 'Glow' },
                { value: 'bounce', label: 'Bounce' }
              ]}
              onChange={(value) => handleUpdateAnimationSettings('hoverType', value)}
            />
            
            <SliderInput
              label="Duration"
              value={animationSettings.hoverDuration}
              onChange={(value) => handleUpdateAnimationSettings('hoverDuration', value)}
              min={100}
              max={1000}
              unit="ms"
              step={50}
            />
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
          <Filter className="h-3 w-3 mr-1" />
          Filters
        </h4>
        
        <div className="space-y-3">
          <SliderInput
            label="Blur"
            value={filterSettings.blur}
            onChange={(value) => handleUpdateFilterSettings('blur', value)}
            min={0}
            max={20}
            unit="px"
            step={0.5}
          />
          
          <SliderInput
            label="Brightness"
            value={filterSettings.brightness}
            onChange={(value) => handleUpdateFilterSettings('brightness', value)}
            min={0}
            max={200}
            unit="%"
          />
          
          <SliderInput
            label="Contrast"
            value={filterSettings.contrast}
            onChange={(value) => handleUpdateFilterSettings('contrast', value)}
            min={0}
            max={200}
            unit="%"
          />
          
          <SliderInput
            label="Saturation"
            value={filterSettings.saturate}
            onChange={(value) => handleUpdateFilterSettings('saturate', value)}
            min={0}
            max={200}
            unit="%"
          />
          
          <SliderInput
            label="Hue Rotate"
            value={filterSettings.hueRotate}
            onChange={(value) => handleUpdateFilterSettings('hueRotate', value)}
            min={0}
            max={360}
            unit="deg"
          />
          
          <SliderInput
            label="Grayscale"
            value={filterSettings.grayscale}
            onChange={(value) => handleUpdateFilterSettings('grayscale', value)}
            min={0}
            max={100}
            unit="%"
          />
        </div>
      </div>

      {/* Drop Shadow */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
          <Layers className="h-3 w-3 mr-1" />
          Drop Shadow
        </h4>
        
        <Toggle
          label="Apply drop shadow"
          enabled={filterSettings.dropShadow}
          setEnabled={(value) => handleUpdateFilterSettings('dropShadow', value)}
          description="Add shadow effect to element"
        />
        
        {filterSettings.dropShadow && (
          <div className="space-y-3 pl-4 border-l-2 border-blue-100">
            <SliderInput
              label="Horizontal Offset"
              value={filterSettings.shadowX}
              onChange={(value) => handleUpdateFilterSettings('shadowX', value)}
              min={-50}
              max={50}
              unit="px"
            />
            
            <SliderInput
              label="Vertical Offset"
              value={filterSettings.shadowY}
              onChange={(value) => handleUpdateFilterSettings('shadowY', value)}
              min={-50}
              max={50}
              unit="px"
            />
            
            <SliderInput
              label="Blur Radius"
              value={filterSettings.shadowBlur}
              onChange={(value) => handleUpdateFilterSettings('shadowBlur', value)}
              min={0}
              max={50}
              unit="px"
            />
            
            <SliderInput
              label="Shadow Opacity"
              value={filterSettings.shadowOpacity}
              onChange={(value) => handleUpdateFilterSettings('shadowOpacity', value)}
              min={0}
              max={100}
              unit="%"
            />
          </div>
        )}
      </div>

      {/* Transitions */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Transitions
        </h4>
        
        <SelectInput
          label="Property"
          value={transitionSettings.transitionProperty}
          options={[
            { value: 'all', label: 'All Properties' },
            { value: 'opacity', label: 'Opacity' },
            { value: 'transform', label: 'Transform' },
            { value: 'color', label: 'Color' },
            { value: 'background-color', label: 'Background' },
            { value: 'border-color', label: 'Border' }
          ]}
          onChange={(value) => handleUpdateTransitionSettings('transitionProperty', value)}
        />
        
        <SliderInput
          label="Duration"
          value={transitionSettings.transitionDuration}
          onChange={(value) => handleUpdateTransitionSettings('transitionDuration', value)}
          min={0}
          max={2000}
          unit="ms"
          step={50}
        />
        
        <SliderInput
          label="Delay"
          value={transitionSettings.transitionDelay}
          onChange={(value) => handleUpdateTransitionSettings('transitionDelay', value)}
          min={0}
          max={2000}
          unit="ms"
          step={50}
        />
        
        <SelectInput
          label="Easing"
          value={transitionSettings.transitionEasing}
          options={easingOptions}
          onChange={(value) => handleUpdateTransitionSettings('transitionEasing', value)}
        />
      </div>

      {/* Quick Effects */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Quick Effects
        </h4>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              handleUpdateFilterSettings('blur', 5);
              handleUpdateFilterSettings('brightness', 80);
            }}
            className="p-2 text-center border border-gray-200 rounded hover:border-gray-300 transition-colors"
          >
            <div className="w-4 h-4 mx-auto mb-1 bg-blue-400 rounded opacity-60"></div>
            <p className="text-xs">Blur</p>
          </button>
          
          <button
            onClick={() => {
              handleUpdateFilterSettings('grayscale', 100);
            }}
            className="p-2 text-center border border-gray-200 rounded hover:border-gray-300 transition-colors"
          >
            <div className="w-4 h-4 mx-auto mb-1 bg-gray-400 rounded"></div>
            <p className="text-xs">B&W</p>
          </button>
          
          <button
            onClick={() => {
              handleUpdateFilterSettings('dropShadow', true);
              handleUpdateFilterSettings('shadowY', 8);
              handleUpdateFilterSettings('shadowBlur', 16);
            }}
            className="p-2 text-center border border-gray-200 rounded hover:border-gray-300 transition-colors"
          >
            <div className="w-4 h-4 mx-auto mb-1 bg-purple-500 rounded shadow-lg"></div>
            <p className="text-xs">Shadow</p>
          </button>
          
          <button
            onClick={() => {
              handleUpdateAnimationSettings('hoverAnimation', true);
              handleUpdateAnimationSettings('hoverType', 'scale');
            }}
            className="p-2 text-center border border-gray-200 rounded hover:border-gray-300 transition-colors"
          >
            <div className="w-4 h-4 mx-auto mb-1 bg-green-500 rounded transform hover:scale-110 transition-transform"></div>
            <p className="text-xs">Hover</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EffectsPanel;
