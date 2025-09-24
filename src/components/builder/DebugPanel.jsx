import React, { useState, useEffect } from 'react';
import { Bug, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useBuilder } from '../../contexts/BuilderContext';

const DebugPanel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState([]);
  const { selectedElement, activeMode, currentPage } = useBuilder();

  useEffect(() => {
    // Capture console logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (type, message) => {
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [...prev.slice(-50), { type, message, timestamp }]);
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog('log', args.join(' '));
    };

    console.error = (...args) => {
      originalError(...args);
      addLog('error', args.join(' '));
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog('warn', args.join(' '));
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Open Debug Panel"
      >
        <Bug className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-80 bg-white border border-gray-300 rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 text-white p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bug className="h-4 w-4" />
          <span className="text-sm font-medium">Debug Panel</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearLogs}
            className="p-1 hover:bg-gray-700 rounded"
            title="Clear Logs"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-gray-700 rounded"
            title="Hide Debug Panel"
          >
            <EyeOff className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="p-3 bg-gray-50 border-b border-gray-200 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium">Mode:</span>
            <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
              activeMode === 'add' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {activeMode}
            </span>
          </div>
          <div>
            <span className="font-medium">Page:</span>
            <span className="ml-1 text-gray-600">{currentPage}</span>
          </div>
          <div className="col-span-2">
            <span className="font-medium">Selected:</span>
            <span className="ml-1 text-gray-600">
              {selectedElement ? `${selectedElement.type}` : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {logs.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-4">
              No logs yet. Interact with the builder to see debug information.
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`text-xs p-2 rounded ${
                  log.type === 'error'
                    ? 'bg-red-50 text-red-800'
                    : log.type === 'warn'
                    ? 'bg-yellow-50 text-yellow-800'
                    : 'bg-gray-50 text-gray-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-mono">{log.message}</span>
                  <span className="text-gray-500 text-xs">{log.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <div className="text-xs text-gray-600">
          <p className="mb-1">Quick Tests:</p>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => console.log('Test log message')}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              Test Log
            </button>
            <button
              onClick={() => {
                if (window.builderCanvas) {
                  console.log('Canvas API available');
                } else {
                  console.error('Canvas API not available');
                }
              }}
              className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
            >
              Check Canvas
            </button>
            <button
              onClick={() => {
                const mainIframe = document.querySelector('iframe[src*="srcdoc"]');
                console.log('Main iframe:', mainIframe);
                if (mainIframe && mainIframe.contentDocument) {
                  console.log('Main iframe content:', mainIframe.contentDocument.documentElement.outerHTML.substring(0, 200) + '...');
                } else {
                  console.error('Main iframe not found or no content');
                }
              }}
              className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
            >
              Check Main Iframe
            </button>
            <button
              onClick={() => {
                const previewIframe = document.querySelector('#theme-preview-iframe');
                console.log('Preview iframe:', previewIframe);
                if (previewIframe && previewIframe.contentDocument) {
                  console.log('Preview iframe content:', previewIframe.contentDocument.documentElement.outerHTML.substring(0, 200) + '...');
                } else {
                  console.error('Preview iframe not found or no content');
                }
              }}
              className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
            >
              Check Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
