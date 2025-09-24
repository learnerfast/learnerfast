'use client';
import { useState, useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WebsiteProvider } from '@/contexts/WebsiteContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Toaster } from 'react-hot-toast';
import TypographyContent from '@/components/builder/TypographyPage';
import '@/dashboard.css';

function PageContent() {
  const [activeTab, setActiveTab] = useState('Theme Explorer');
  const tabs = ['Theme Explorer', 'Colors', 'Typography', 'Buttons & Inputs', 'Layout'];
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Typography':
        return (
          <div className="flex bg-card rounded-xl shadow-subtle border border-border overflow-hidden" style={{ height: '600px' }}>
<TypographyContent />
          </div>
        );
      case 'Theme Explorer':
        return (
          <div className="bg-card rounded-xl shadow-subtle border border-border p-16 text-center">
            <h3 className="text-xl font-semibold text-foreground">Theme Explorer</h3>
            <p className="text-muted-foreground mt-2">Explore and customize your website themes.</p>
          </div>
        );
      case 'Colors':
        return (
          <div className="bg-card rounded-xl shadow-subtle border border-border p-16 text-center">
            <h3 className="text-xl font-semibold text-foreground">Colors</h3>
            <p className="text-muted-foreground mt-2">Customize your website color palette.</p>
          </div>
        );
      case 'Buttons & Inputs':
        return (
          <div className="bg-card rounded-xl shadow-subtle border border-border p-16 text-center">
            <h3 className="text-xl font-semibold text-foreground">Buttons & Inputs</h3>
            <p className="text-muted-foreground mt-2">Design your buttons and input elements.</p>
          </div>
        );
      case 'Layout':
        return (
          <div className="bg-card rounded-xl shadow-subtle border border-border p-16 text-center">
            <h3 className="text-xl font-semibold text-foreground">Layout</h3>
            <p className="text-muted-foreground mt-2">Configure your website layout and structure.</p>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Design</h1>
        <p className="text-muted-foreground mt-1">Manage your website design</p>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex space-x-8">
          {tabs.map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-medium transition-colors ${
                activeTab === tab 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <WebsiteProvider>
          <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
                <div className="container mx-auto px-6 py-8">
                  <PageContent />
                </div>
              </main>
            </div>
          </div>
          <Toaster position="top-right" />
        </WebsiteProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
