import React, { useState, useEffect, useRef } from 'react';
import { useBuilder } from '../../contexts/BuilderContext';
import { useWebsite } from '../../contexts/WebsiteContext';



const BuilderCanvas = () => {
  const {
    pageData,
    setSelectedElement,
    selectedElement,
    siteId,
    updateElement,
    isPreviewMode,
    activeMode,

    templateContent: builderTemplateContent,
    isLoadingTemplate
  } = useBuilder();
  const { sites } = useWebsite();
  const [loading, setLoading] = useState(true);
  const [templateContent, setTemplateContent] = useState(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [editableElements, setEditableElements] = useState([]);
  const [elementPosition, setElementPosition] = useState({ x: 200, y: 100 });
  const [isDragOver, setIsDragOver] = useState(false);
  const iframeRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Expose color extraction trigger
  useEffect(() => {
    window.triggerColorExtraction = () => {
      if (window.extractColors) {
        window.extractColors();
      }
    };

    return () => {
      delete window.triggerColorExtraction;
    };
  }, []);

  // Handle iframe load and setup interaction
  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setSelectedElement(null);

    if (iframeRef.current) {
      try {
        const iframeDoc = iframeRef.current.contentDocument;
        if (iframeDoc) {
          // Add editor styles to iframe
          const style = iframeDoc.createElement('style');
          style.textContent = `
            .builder-hover {
              outline: 1px dashed #6b7280 !important;
              outline-offset: 1px !important;
              cursor: pointer !important;
            }
            .builder-selected {
              outline: 2px solid #3b82f6 !important;
              outline-offset: 2px !important;
            }
            .dragging {
              opacity: 0.6 !important;
              z-index: 1000 !important;
            }
            .drop-indicator {
              height: 3px !important;
              background: #3b82f6 !important;
              margin: 2px 0 !important;
              border-radius: 2px !important;
              border: none !important;
              box-shadow: 0 0 4px rgba(59, 130, 246, 0.5) !important;
            }
            .builder-editable {
              min-height: 20px;
            }
            .builder-editable:empty::before {
              content: 'Click to edit...';
              color: #9ca3af;
              font-style: italic;
            }
            .preview-mode * {
              border: none !important;
            }
            .preview-mode .builder-selected,
            .preview-mode .builder-hover {
              border: none !important;
              background: none !important;
            }
          `;
          iframeDoc.head.appendChild(style);

          // Add click handlers and drag functionality to all elements
          const addInteractivity = (element) => {
            // Skip non-interactive elements
            if (['script', 'style', 'meta', 'link', 'title'].includes(element.tagName.toLowerCase())) {
              return;
            }

            // Make element draggable
            element.draggable = true;
            element.style.cursor = 'grab';

            element.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();

              console.log('Element clicked:', element.tagName, element.className);

              // Remove previous selections
              iframeDoc.querySelectorAll('.builder-selected').forEach(el => {
                el.classList.remove('builder-selected');
                el.removeAttribute('data-element-type');
              });

              // Select current element
              element.classList.add('builder-selected');
              element.setAttribute('data-element-type', element.tagName.toLowerCase());

              // Calculate element position for toolbar - position just above element in viewport
              const rect = element.getBoundingClientRect();
              const iframeRect = iframeRef.current.getBoundingClientRect();
              
              const elementX = iframeRect.left + rect.left + rect.width / 2;
              const elementY = iframeRect.top + rect.top - 60;

              console.log('Setting element position:', { elementX, elementY, rect, iframeRect });
              setElementPosition({ x: elementX, y: elementY });

              // Create comprehensive element data
              const elementData = {
                id: element.id || `element-${Date.now()}`,
                type: element.tagName.toLowerCase(),
                content: element.textContent?.trim() || element.innerHTML || '',
                element: element,
                attributes: {},
                styles: {},
                computedStyles: window.getComputedStyle(element)
              };

              // Extract all attributes
              Array.from(element.attributes).forEach(attr => {
                elementData.attributes[attr.name] = attr.value;
              });

              // Extract inline styles
              if (element.style.cssText) {
                const styleProps = element.style.cssText.split(';').filter(s => s.trim());
                styleProps.forEach(prop => {
                  const [key, value] = prop.split(':').map(s => s.trim());
                  if (key && value) {
                    elementData.styles[key] = value;
                  }
                });
              }

              console.log('Element selected:', elementData);
              setSelectedElement(elementData);
              

            });

            // Make element draggable
            element.draggable = true;
            element.style.cursor = 'grab';

            // Add hover effects
            element.addEventListener('mouseenter', (e) => {
              if (!element.classList.contains('builder-selected')) {
                element.classList.add('builder-hover');
              }
            });

            element.addEventListener('mouseleave', (e) => {
              element.classList.remove('builder-hover');
            });

            // Make text elements editable
            if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button', 'div'].includes(element.tagName.toLowerCase())) {
              element.addEventListener('dblclick', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Double-click detected, enabling inline editing');
                enableInlineEditing(element);
              });
            }
          };

          // Apply to all elements
          const allElements = iframeDoc.body.querySelectorAll('*');
          allElements.forEach(addInteractivity);
          
          // Initialize drag and drop for element repositioning
          let draggedElement = null;
          let dropIndicator = null;
          
          const createDropIndicator = () => {
            const indicator = iframeDoc.createElement('div');
            indicator.style.cssText = `
              height: 2px;
              background: #3b82f6;
              margin: 4px 0;
              border-radius: 1px;
              opacity: 0;
              transition: opacity 0.2s;
              pointer-events: none;
            `;
            indicator.className = 'drop-indicator';
            return indicator;
          };
          
          const showDropIndicator = (targetElement, position) => {
            if (dropIndicator) {
              dropIndicator.remove();
            }
            dropIndicator = createDropIndicator();
            
            if (position === 'before') {
              targetElement.parentNode.insertBefore(dropIndicator, targetElement);
            } else {
              targetElement.parentNode.insertBefore(dropIndicator, targetElement.nextSibling);
            }
          };
          
          const hideDropIndicator = () => {
            if (dropIndicator) {
              dropIndicator.remove();
              dropIndicator = null;
            }
          };
          

          
          // Make all elements draggable with performance optimizations
          const draggableEls = iframeDoc.querySelectorAll('*');
          let dragTimeout;
          
          draggableEls.forEach(el => {
            if (['script', 'style', 'meta', 'link', 'title', 'html', 'head', 'body'].includes(el.tagName.toLowerCase())) {
              return;
            }
            
            el.draggable = true;
            el.style.cursor = 'grab';
            
            el.addEventListener('dragstart', (e) => {
              draggedElement = el;
              el.style.opacity = '0.7';
              el.classList.add('dragging');
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', 'element');
              e.stopPropagation();
            });
            
            el.addEventListener('dragend', (e) => {
              el.style.opacity = '';
              el.classList.remove('dragging');
              hideDropIndicator();
              draggedElement = null;
              clearTimeout(dragTimeout);
            });
          });
          
          // Throttled dragover handler
          let lastDragOver = 0;
          const throttleDelay = 50;
          
          iframeDoc.addEventListener('dragover', (e) => {
            if (!draggedElement) return;
            
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
            
            const now = Date.now();
            if (now - lastDragOver < throttleDelay) return;
            lastDragOver = now;
            
            const target = e.target;
            if (!target || target === draggedElement || target.contains(draggedElement) || draggedElement.contains(target)) {
              return;
            }
            
            const rect = target.getBoundingClientRect();
            const middle = rect.top + rect.height / 2;
            const position = e.clientY < middle ? 'before' : 'after';
            
            clearTimeout(dragTimeout);
            dragTimeout = setTimeout(() => {
              showDropIndicator(target, position);
            }, 10);
          });
          
          iframeDoc.addEventListener('drop', (e) => {
            if (!draggedElement) return;
            
            e.preventDefault();
            e.stopPropagation();
            hideDropIndicator();
            
            const target = e.target;
            if (!target || target === draggedElement || target.contains(draggedElement) || draggedElement.contains(target)) {
              return;
            }
            
            const rect = target.getBoundingClientRect();
            const dragRect = draggedElement.getBoundingClientRect();
            
            // Smart drag behavior: replace if similar size/type, otherwise insert
            const shouldReplace = (
              Math.abs(rect.width - dragRect.width) < 50 &&
              Math.abs(rect.height - dragRect.height) < 50 &&
              target.tagName === draggedElement.tagName
            ) || (
              rect.width < 100 && rect.height < 50 // Small elements get replaced
            );
            
            try {
              if (shouldReplace) {
                // Replace the target element
                const parent = target.parentNode;
                parent.replaceChild(draggedElement, target);
                if (window.showToast) {
                  window.showToast('Element replaced!', 'success');
                }
              } else {
                // Insert before/after based on position
                const middle = rect.top + rect.height / 2;
                const position = e.clientY < middle ? 'before' : 'after';
                const parent = target.parentNode;
                
                if (position === 'before') {
                  parent.insertBefore(draggedElement, target);
                } else {
                  parent.insertBefore(draggedElement, target.nextSibling);
                }
                
                if (window.showToast) {
                  window.showToast('Element moved!', 'success');
                }
              }
            } catch (error) {
              console.error('Error moving element:', error);
            }
          });



          // Clear any existing selections
          iframeDoc.querySelectorAll('.builder-selected, .builder-hover').forEach(el => {
            el.classList.remove('builder-selected', 'builder-hover');
            el.removeAttribute('data-element-type');
          });
          
          console.log('Interactive editor initialized with', allElements.length, 'elements');
          
          // Trigger color extraction after a short delay
          setTimeout(() => {
            if (window.extractColors) {
              window.extractColors();
            }
          }, 500);
        }
      } catch (error) {
        console.error('Error setting up iframe interaction:', error);
      }
    }
  };

  // Enable inline editing for text elements
  const enableInlineEditing = (element) => {
    element.setAttribute('contenteditable', 'true');
    element.style.outline = '2px solid #3b82f6';
    element.focus();

    const finishEditing = () => {
      element.setAttribute('contenteditable', 'false');
      element.style.outline = '';
    };

    element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        finishEditing();
      }
    });

    element.addEventListener('blur', finishEditing);
  };



  // Use template content from BuilderContext
  useEffect(() => {
    if (builderTemplateContent) {
      setTemplateContent(builderTemplateContent);
      setLoading(false);
    } else {
      setLoading(isLoadingTemplate);
    }
  }, [builderTemplateContent, isLoadingTemplate]);

  const handleSelectElement = (e) => {
    e.stopPropagation(); // Prevent background click from firing
    setSelectedElement({
      id: 'hero-section-1',
      type: 'Hero Section',
      settings: {
        overlay: true,
        opacity: 50,
        caption: false,
        popup: false,
      }
    });
  };

  const handleCanvasClick = (e) => {
    // Only clear selection if clicking directly on the canvas background div
    if (e.target.classList.contains('canvas-background')) {
      setSelectedElement(null);

      // Clear selection in iframe
      if (iframeRef.current && iframeLoaded) {
        try {
          const iframeDoc = iframeRef.current.contentDocument;
          if (iframeDoc) {
            iframeDoc.querySelectorAll('.builder-selected').forEach(el => {
              el.classList.remove('builder-selected');
              el.removeAttribute('data-element-type');
            });
          }
        } catch (error) {
          console.error('Error clearing iframe selection:', error);
        }
      }
    }
  };



  // Always render template content
  if (templateContent || !loading) {
    return (
      <div className="flex-1 bg-gray-100 h-full">
        <div
          ref={containerRef}
          className="w-full mx-auto transition-all duration-300 ease-in-out bg-white shadow-lg h-full"
        >
          <iframe
            ref={iframeRef}
            srcDoc={templateContent}
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts"
            title="Interactive Website Editor"
            onLoad={handleIframeLoad}
            style={{ minWidth: '1200px', width: '100%' }}
          />

          {/* Drag overlay */}
          {isDragOver && (
            <div className="absolute inset-0 bg-primary-500 bg-opacity-5 border-2 border-dashed border-primary-400 z-30" />
          )}






        </div>
      </div>
    );
  }

  // Fallback - should not reach here
  return null;
};

export default BuilderCanvas;
