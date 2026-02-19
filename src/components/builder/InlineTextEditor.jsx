'use client';
import { useState, useRef, useEffect } from 'react';

export default function InlineTextEditor({ 
  initialText = '', 
  onSave, 
  tag = 'div',
  className = '',
  placeholder = 'Click to edit...'
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText);
  const [isSaving, setIsSaving] = useState(false);
  const elementRef = useRef(null);
  const Tag = tag;

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => elementRef.current?.focus(), 0);
  };

  const handleBlur = async () => {
    if (text !== initialText) {
      setIsSaving(true);
      try {
        await onSave?.(text);
      } catch (error) {
        console.error('Save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setText(initialText);
      setIsEditing(false);
      elementRef.current?.blur();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      elementRef.current?.blur();
    }
  };

  return (
    <Tag
      ref={elementRef}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onInput={(e) => setText(e.currentTarget.textContent)}
      className={`${className} ${isEditing ? 'outline outline-2 outline-blue-500' : 'cursor-pointer hover:bg-gray-50'} ${isSaving ? 'opacity-50' : ''} transition-smooth`}
      data-placeholder={!text && !isEditing ? placeholder : ''}
    >
      {text}
    </Tag>
  );
}
