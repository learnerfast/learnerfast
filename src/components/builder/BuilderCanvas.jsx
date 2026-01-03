import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [elementPosition, setElementPosition] = useState({ x: 200, y: 100 });
  const [isDragOver, setIsDragOver] = useState(false);

  // Ensure no selection on mount
  useEffect(() => {
    setSelectedElement(null);
  }, []);

  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  // Simplified drag system
  let draggedElement = null;
  let dragOverlay = null;
  let dragSuccessful = false;
  let originalParent = null;
  let originalNextSibling = null;

  // Expose color extraction trigger
  useEffect(() => {
    window.triggerColorExtraction = () => {
      if (window.extractColors) window.extractColors();
    };
    return () => { delete window.triggerColorExtraction; };
  }, []);

  // Use template content from BuilderContext
  useEffect(() => {
    if (builderTemplateContent && !isLoadingTemplate) {
      setLoading(false);
    }
  }, [builderTemplateContent, isLoadingTemplate]);

  const createDragOverlay = (element, doc) => {
    const overlay = element.cloneNode(true);
    const rect = element.getBoundingClientRect();
    
    overlay.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      opacity: 0.7;
      pointer-events: none;
      z-index: 10000;
      border: 2px solid #3b82f6;
      background: rgba(59, 130, 246, 0.1);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    `;
    overlay.classList.add('drag-overlay');
    overlay.removeAttribute('draggable');
    
    doc.body.appendChild(overlay);
    return overlay;
  };

  // Sync iframe changes back to template content
  const syncIframeToTemplate = useCallback(() => {
    if (iframeRef.current?.contentDocument && !isLoadingTemplate) {
      const doc = iframeRef.current.contentDocument;
      const selectedEls = doc.querySelectorAll('.builder-selected, .builder-hover');
      selectedEls.forEach(el => {
        el.classList.remove('builder-selected', 'builder-hover');
        el.removeAttribute('data-element-type');
      });
      const newHTML = doc.documentElement.outerHTML;
      if (window.updateTemplateContent) {
        window.updateTemplateContent(newHTML);
      }
    }
  }, [isLoadingTemplate]);

  // Handle iframe load and setup interaction
  const handleIframeLoad = () => {
    setIframeLoaded(true);
    
    if (iframeRef.current) {
      try {
        const iframeDoc = iframeRef.current.contentDocument;
        if (iframeDoc) {
          // Check for existing selected elements in loaded HTML
          const existingSelected = iframeDoc.querySelectorAll('.builder-selected');
          existingSelected.forEach(el => {
            // Element with .builder-selected
          });
          
          // Clear selection immediately
          setSelectedElement(null);
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
            .drag-overlay {
              position: fixed !important;
              pointer-events: none !important;
              z-index: 10000 !important;
            }
            .builder-editable {
              min-height: 20px;
            }
            .builder-editable:empty::before {
              content: 'Click to edit...';
              color: #9ca3af;
              font-style: italic;
            }
          `;
          iframeDoc.head.appendChild(style);

          // Add click handlers and drag functionality to all elements
          const addInteractivity = (element) => {
            // Skip non-interactive elements
            if (['script', 'style', 'meta', 'link', 'title'].includes(element.tagName.toLowerCase())) {
              return;
            }

            element.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();

              // Remove previous selections
              iframeDoc.querySelectorAll('.builder-selected').forEach(el => {
                el.classList.remove('builder-selected');
                el.removeAttribute('data-element-type');
              });

              // Select current element
              element.classList.add('builder-selected');
              element.setAttribute('data-element-type', element.tagName.toLowerCase());

              // Calculate element position for toolbar
              const rect = element.getBoundingClientRect();
              const iframeRect = iframeRef.current.getBoundingClientRect();
              
              const elementX = iframeRect.left + rect.left + rect.width / 2;
              const elementY = iframeRect.top + rect.top - 60;

              setElementPosition({ x: elementX, y: elementY });

              // Create element data
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

              setSelectedElement(elementData);
            });

            // Make element draggable
            element.draggable = true;
            element.style.cursor = 'grab';
            
            element.addEventListener('dragstart', (e) => {
              e.stopImmediatePropagation();
              
              draggedElement = element;
              originalParent = element.parentNode;
              originalNextSibling = element.nextSibling;
              dragSuccessful = false;
              
              setTimeout(() => {
                dragOverlay = createDragOverlay(element, iframeDoc);
                element.style.opacity = '0.3';
              }, 0);
              
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/html', element.outerHTML);
            });
            
            element.addEventListener('dragend', (e) => {
              if (!dragSuccessful) {
                element.style.opacity = '';
              }
              
              if (dragOverlay) {
                dragOverlay.remove();
              }
              
              draggedElement = null;
              dragOverlay = null;
              originalParent = null;
              originalNextSibling = null;
            });

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
                enableInlineEditing(element);
              });
            }
          };

          // Apply to all elements
          const allElements = iframeDoc.body.querySelectorAll('*');
          allElements.forEach(addInteractivity);
          
          iframeDoc.addEventListener('dragover', (e) => {
            if (!draggedElement) return;
            
            e.preventDefault();
            e.stopImmediatePropagation();
            e.dataTransfer.dropEffect = 'move';
            
            if (dragOverlay) {
              dragOverlay.style.left = `${e.clientX - dragOverlay.offsetWidth / 2}px`;
              dragOverlay.style.top = `${e.clientY - dragOverlay.offsetHeight / 2}px`;
            }
          });
          
          iframeDoc.addEventListener('drop', (e) => {
            if (!draggedElement) return;
            
            e.preventDefault();
            e.stopImmediatePropagation();
            
            const target = e.target;
            if (!target || target === draggedElement || target.classList.contains('drag-overlay')) {
              dragSuccessful = false;
              return;
            }
            
            const rect = target.getBoundingClientRect();
            const insertBefore = e.clientY < rect.top + rect.height / 2;
            
            try {
              if (insertBefore) {
                target.parentNode.insertBefore(draggedElement, target);
              } else {
                target.parentNode.insertBefore(draggedElement, target.nextSibling);
              }
              
              draggedElement.style.opacity = '';
              dragSuccessful = true;
              
            } catch (error) {
              dragSuccessful = false;
            }
          });

          // Clear any existing selections
          const selectedElements = iframeDoc.querySelectorAll('.builder-selected, .builder-hover');
          selectedElements.forEach(el => {
            el.classList.remove('builder-selected', 'builder-hover');
            el.removeAttribute('data-element-type');
          });
          
          // Trigger color extraction after a short delay
          setTimeout(() => {
            if (window.extractColors) {
              window.extractColors();
            }
          }, 500);

          // Setup mutation observer to track style changes
          const observer = new MutationObserver((mutations) => {
            // Skip if any element is being edited
            const isEditing = iframeDoc.querySelector('[data-editing="true"]');
            if (isEditing) return;
            
            // Only sync if style attribute changed
            const hasStyleChange = mutations.some(m => 
              m.type === 'attributes' && m.attributeName === 'style'
            );
            if (hasStyleChange) {
              // Debounce the sync
              if (iframeRef.current._syncTimeout) {
                clearTimeout(iframeRef.current._syncTimeout);
              }
              iframeRef.current._syncTimeout = setTimeout(() => {
                syncIframeToTemplate();
              }, 300);
            }
          });

          observer.observe(iframeDoc.body, {
            attributes: true,
            attributeFilter: ['style'],
            subtree: true,
            childList: false
          });

          // Store observer for cleanup
          iframeRef.current._styleObserver = observer;
        }
      } catch (error) {
      }
    }
  };

  // Enable inline editing for text elements
  const enableInlineEditing = (element) => {
    element.setAttribute('contenteditable', 'true');
    element.setAttribute('data-editing', 'true');
    element.style.outline = '2px solid #3b82f6';
    element.style.cursor = 'text';
    element.focus();

    const finishEditing = () => {
      element.setAttribute('contenteditable', 'false');
      element.removeAttribute('data-editing');
      element.style.outline = '';
      element.style.cursor = 'grab';
      syncIframeToTemplate();
    };

    element.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        finishEditing();
      }
      e.stopPropagation();
    });

    element.addEventListener('blur', finishEditing, { once: true });
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
        }
      }
    }
  };

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (iframeRef.current?._styleObserver) {
        iframeRef.current._styleObserver.disconnect();
      }
      if (iframeRef.current?._syncTimeout) {
        clearTimeout(iframeRef.current._syncTimeout);
      }
    };
  }, []);



  // Only render when template content is loaded and not loading
  if (builderTemplateContent && !loading && !isLoadingTemplate) {
    return (
      <div className="flex-1 bg-gray-100 h-full">
        <div
          ref={containerRef}
          className="w-full mx-auto transition-all duration-300 ease-in-out bg-white shadow-lg h-full"
        >
          <iframe
            ref={iframeRef}
            srcDoc={builderTemplateContent}
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

  // Show loading screen while template loads
  return (
    <div className="flex-1 bg-gray-100 h-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading template...</p>
      </div>
    </div>
  );
};

export default BuilderCanvas;