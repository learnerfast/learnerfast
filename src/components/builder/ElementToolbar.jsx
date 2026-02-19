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
  const [isVisible, setIsVisible] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  const handleDuplicate = () => {
    if (element?.element) {
      try {
        const cloned = element.element.cloneNode(true);
        cloned.removeAttribute('data-builder-selected');
        cloned.classList.remove('builder-selected');
        element.element.parentNode.insertBefore(cloned, element.element.nextSibling);
        
        if (window.showToast) {
          window.showToast('Element duplicated', 'success');
        }
      } catch (error) {
        console.error('Duplicate failed:', error);
        if (window.showToast) {
          window.showToast('Failed to duplicate element', 'error');
        }
      }
    }
  };

  const handleDelete = () => {
    if (element?.element) {
      if (confirm('Are you sure you want to delete this element?')) {
        try {
          element.element.remove();
          setSelectedElement(null);
          
          if (window.showToast) {
            window.showToast('Element deleted', 'success');
          }
        } catch (error) {
          console.error('Delete failed:', error);
          if (window.showToast) {
            window.showToast('Failed to delete element', 'error');
          }
        }
      }
    }
  };

  const handleMoveUp = () => {
    if (element?.element?.previousElementSibling) {
      try {
        element.element.parentNode.insertBefore(element.element, element.element.previousElementSibling);
        
        if (window.showToast) {
          window.showToast('Element moved up', 'success');
        }
      } catch (error) {
        console.error('Move up failed:', error);
        if (window.showToast) {
          window.showToast('Failed to move element', 'error');
        }
      }
    }
  };

  const handleMoveDown = () => {
    if (element?.element?.nextElementSibling) {
      try {
        element.element.parentNode.insertBefore(element.element.nextElementSibling, element.element);
        
        if (window.showToast) {
          window.showToast('Element moved down', 'success');
        }
      } catch (error) {
        console.error('Move down failed:', error);
        if (window.showToast) {
          window.showToast('Failed to move element', 'error');
        }
      }
    }
  };

  const handleStartDrag = () => {
    if (isLocked) {
      if (window.showToast) {
        window.showToast('Element is locked', 'warning');
      }
      return;
    }
    
    setIsDragging(true);
    if (element?.element) {
      element.element.style.cursor = 'move';
      element.element.draggable = true;
    }
  };

  const handleToggleVisibility = () => {
    if (element?.element) {
      const newVisibility = !isVisible;
      setIsVisible(newVisibility);
      element.element.style.display = newVisibility ? '' : 'none';
      
      if (window.showToast) {
        window.showToast(`Element ${newVisibility ? 'shown' : 'hidden'}`, 'success');
      }
    }
  };

  const handleToggleLock = () => {
    if (element?.element) {
      const newLockState = !isLocked;
      setIsLocked(newLockState);
      element.element.style.pointerEvents = newLockState ? 'none' : 'auto';
      element.element.setAttribute('data-locked', newLockState);
      
      if (window.showToast) {
        window.showToast(`Element ${newLockState ? 'locked' : 'unlocked'}`, 'success');
      }
    }
  };

  const handleEdit = () => {
    if (element?.element) {
      try {
        const isEditable = element.element.getAttribute('contenteditable') === 'true';
        
        if (isEditable) {
          element.element.setAttribute('contenteditable', 'false');
          element.element.style.outline = '';
          element.element.blur();
        } else {
          element.element.setAttribute('contenteditable', 'true');
          element.element.style.outline = '2px solid #3b82f6';
          element.element.focus();
        }
      } catch (error) {
        console.error('Edit toggle failed:', error);
        if (window.showToast) {
          window.showToast('Failed to enable editing', 'error');
        }
      }
    }
  };

  const tools = [
    {
      icon: Edit3,
      label: 'Edit',
      action: handleEdit,
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
      color: 'text-gray-600 hover:bg-gray-50',
      disabled: !element?.element?.previousElementSibling
    },
    {
      icon: ArrowDown,
      label: 'Move Down',
      action: handleMoveDown,
      color: 'text-gray-600 hover:bg-gray-50',
      disabled: !element?.element?.nextElementSibling
    },
    {
      icon: isVisible ? Eye : EyeOff,
      label: isVisible ? 'Hide' : 'Show',
      action: handleToggleVisibility,
      color: 'text-indigo-600 hover:bg-indigo-50'
    },
    {
      icon: isLocked ? Lock : Unlock,
      label: isLocked ? 'Unlock' : 'Lock',
      action: handleToggleLock,
      color: 'text-yellow-600 hover:bg-yellow-50'
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
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-1 flex items-center space-x-1 transition-smooth"
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
          disabled={tool.disabled}
          className={`p-2 rounded-md transition-smooth ${tool.color} ${tool.disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
        >
          <tool.icon className="h-4 w-4" />
        </button>
      ))}

    </div>
  );
};

export default ElementToolbar;
