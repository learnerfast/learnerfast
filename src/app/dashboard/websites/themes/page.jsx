'use client';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WebsiteProvider } from '@/contexts/WebsiteContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Toaster } from 'react-hot-toast';
import '@/dashboard.css';

function ThemeExplorer() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Theme Explorer</h1>
        <p className="text-muted-foreground mt-1">Browse and customize website themes</p>
      </div>
      <div className="bg-card rounded-xl shadow-subtle border border-border p-16 text-center">
        <h3 className="text-xl font-semibold text-foreground">Theme Management</h3>
        <p className="text-muted-foreground mt-2">Explore and customize themes for your websites.</p>
      </div>
    </div>
  );
}

export default function ThemesPage() {
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
                  <ThemeExplorer />
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