'use client';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WebsiteProvider } from '@/contexts/WebsiteContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Toaster } from 'react-hot-toast';
import '@/dashboard.css';

function PageContent() {
  const pageName = window.location.pathname.split('/').pop();
  const title = pageName.charAt(0).toUpperCase() + pageName.slice(1);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-1">Manage your website {pageName}</p>
      </div>
      <div className="bg-card rounded-xl shadow-subtle border border-border p-16 text-center">
        <h3 className="text-xl font-semibold text-foreground">{title} Management</h3>
        <p className="text-muted-foreground mt-2">Configure and manage your website {pageName}.</p>
      </div>
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
