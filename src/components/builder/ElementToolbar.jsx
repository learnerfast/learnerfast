import React, { useState } from 'react';
import { 
  Copy, 
  Trash2, 
  Move, 
  Edit3, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  ArrowUp,
  ArrowDown,
  Palette,
  Type,
  Square,
  MousePointer
} from 'lucide-react';
import { useBuilder } from '../../contexts/BuilderContext';

const ElementToolbar = ({ element, position = { x: 0, y: 0 } }) => {
  const { setSelectedElement, updateElement, deleteElement } = useBuilder();
  const [isDragging, setIsDragging] = useState(false);

  const handleDuplicate = () => {
    if (element?.element) {
      const cloned = element.element.cloneNode(true);
      element.element.parentNode.insertBefore(cloned, element.element.nextSibling);
    }
  };

  const handleDelete = () => {
    if (element?.element) {
      element.element.remove();
      setSelectedElement(null);
    }
  };

  const handleMoveUp = () => {
    if (element?.element?.previousElementSibling) {
      element.element.parentNode.insertBefore(element.element, element.element.previousElementSibling);
    }
  };

  const handleMoveDown = () => {
    if (element?.element?.nextElementSibling) {
      element.element.parentNode.insertBefore(element.element.nextElementSibling, element.element);
    }
  };

  const handleStartDrag = () => {
    setIsDragging(true);
    // Add drag functionality here
  };

  const tools = [
    {
      icon: Edit3,
      label: 'Edit',
      action: () => {
        if (element?.element) {
          element.element.setAttribute('contenteditable', 'true');
          element.element.style.outline = '2px solid #3b82f6';
          element.element.focus();
        }
      },
      color: 'text-blue-600 hover:bg-blue-50'
    },
    {
      icon: Copy,
      label: 'Duplicate',
      action: handleDuplicate,
      color: 'text-green-600 hover:bg-green-50'
    },
    {
      icon: Move,
      label: 'Move',
      action: handleStartDrag,
      color: 'text-purple-600 hover:bg-purple-50'
    },
    {
      icon: ArrowUp,
      label: 'Move Up',
      action: handleMoveUp,
      color: 'text-gray-600 hover:bg-gray-50'
    },
    {
      icon: ArrowDown,
      label: 'Move Down',
      action: handleMoveDown,
      color: 'text-gray-600 hover:bg-gray-50'
    },
    {
      icon: Trash2,
      label: 'Delete',
      action: handleDelete,
      color: 'text-red-600 hover:bg-red-50'
    }
  ];

  if (!element) return null;
  
  // Ensure position has valid values
  const safePosition = {
    x: position?.x || 200,
    y: position?.y || 100
  };

  return (
    <div 
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-1 flex items-center space-x-1"
      style={{
        left: safePosition.x,
        top: safePosition.y,
        transform: 'translateX(-50%)'
      }}
    >
      {tools.map((tool, index) => (
        <button
          key={index}
          onClick={tool.action}
          title={tool.label}
          className={`p-2 rounded-md transition-colors ${tool.color}`}
        >
          <tool.icon className="h-4 w-4" />
        </button>
      ))}

    </div>
  );
};

export default ElementToolbar;
