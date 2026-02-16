'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import BuilderToolbar from '../components/builder/BuilderToolbar';
import BuilderSidebar from '../components/builder/BuilderSidebar';
import BuilderCanvas from '../components/builder/BuilderCanvas';
import BuilderInspector from '../components/builder/BuilderInspector';

import DebugPanel from '../components/builder/DebugPanel';

import { ToastContainer, useToast } from '../components/builder/ToastNotification';
import { BuilderProvider, useBuilder } from '../contexts/BuilderContext';

const SiteBuilder = () => {
  const { siteId } = useParams();

  return (
    <BuilderProvider siteId={siteId}>
      <BuilderLayout />
    </BuilderProvider>
  );
};

const BuilderLayout = () => {
  const { selectedElement, activeMode } = useBuilder();
  const { toasts, showToast, removeToast } = useToast();

  // Expose toast function globally for other components
  React.useEffect(() => {
    window.showToast = showToast;
    return () => {
      delete window.showToast;
    };
  }, [showToast]);



  return (
    <div className="h-screen flex flex-col bg-gray-100 text-secondary-800 font-sans">
      <BuilderToolbar />
      <div className="flex-1 relative overflow-hidden">
        <BuilderCanvas />
        {activeMode === 'pages' && <BuilderSidebar />}
        {selectedElement && activeMode !== 'add' && activeMode !== 'design' && activeMode !== 'site' && <BuilderInspector />}
        <DebugPanel />
      </div>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default SiteBuilder;
