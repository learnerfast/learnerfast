import React from 'react';
import { Settings, Zap, Layout, Wand2, Type, X, Copy, Trash2, Edit3, ArrowUp, ArrowDown } from 'lucide-react';
import { useBuilder } from '../../contexts/BuilderContext';
import ScreenPanel from './panels/ScreenPanel';
import ActionsPanel from './panels/ActionsPanel';
import LayoutPanel from './panels/LayoutPanel';
import EffectsPanel from './panels/EffectsPanel';
import TypographyPanel from './panels/TypographyPanel';

const TABS = [
  { id: 'screen', name: 'Screen', icon: Settings },
  { id: 'actions', name: 'Actions', icon: Zap },
  { id: 'layout', name: 'Layout', icon: Layout },
  { id: 'effects', name: 'Effects', icon: Wand2 },
  { id: 'typography', name: 'Typography', icon: Type },
];

const BuilderInspector = () => {
  const {
    selectedElement,
    setSelectedElement,
    activeInspectorTab,
    switchInspectorTab
  } = useBuilder();

  const renderTabContent = () => {
    switch (activeInspectorTab) {
      case 'screen':
        return <ScreenPanel />;
      case 'actions':
        return <ActionsPanel />;
      case 'layout':
        return <LayoutPanel />;
      case 'effects':
        return <EffectsPanel />;
      case 'typography':
        return <TypographyPanel />;
      default:
        return <ScreenPanel />;
    }
  };

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg z-20">
      {/* Element Toolbar */}
      {selectedElement && (
        <div className="border-b border-gray-200 p-2 pt-4 pb-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-1 flex-1 justify-center">
              <button
                onClick={() => {
                  if (selectedElement?.element) {
                    selectedElement.element.setAttribute('contenteditable', 'true');
                    selectedElement.element.style.outline = '2px solid #3b82f6';
                    selectedElement.element.focus();
                  }
                }}
                title="Edit"
                className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors border border-gray-200"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  if (selectedElement?.element) {
                    const cloned = selectedElement.element.cloneNode(true);
                    selectedElement.element.parentNode.insertBefore(cloned, selectedElement.element.nextSibling);
                  }
                }}
                title="Duplicate"
                className="p-2 rounded-md text-green-600 hover:bg-green-50 transition-colors border border-gray-200"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  if (selectedElement?.element?.previousElementSibling) {
                    selectedElement.element.parentNode.insertBefore(selectedElement.element, selectedElement.element.previousElementSibling);
                  }
                }}
                title="Move Up"
                className="p-2 rounded-md text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  if (selectedElement?.element?.nextElementSibling) {
                    selectedElement.element.parentNode.insertBefore(selectedElement.element.nextElementSibling, selectedElement.element);
                  }
                }}
                title="Move Down"
                className="p-2 rounded-md text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  if (selectedElement?.element) {
                    selectedElement.element.remove();
                    setSelectedElement(null);
                  }
                }}
                title="Delete"
                className="p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors border border-gray-200"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="absolute right-2">
              <button 
                onClick={() => {
                  setSelectedElement(null);
                  const iframe = document.querySelector('iframe');
                  if (iframe?.contentDocument) {
                    iframe.contentDocument.querySelectorAll('.builder-selected').forEach(el => {
                      el.classList.remove('builder-selected');
                      el.removeAttribute('data-element-type');
                    });
                  }
                }}
                className="p-1.5 rounded-md hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors"
                title="Unselect element"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border-b border-gray-200">
        <nav className="flex p-1 space-x-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => switchInspectorTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-1 px-2 py-2 text-xs font-medium rounded-md transition-colors ${
                activeInspectorTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-3 w-3" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">


          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default BuilderInspector;
