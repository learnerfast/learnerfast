'use client';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WebsiteProvider } from '@/contexts/WebsiteContext';
import SiteBuilder from '@/dashboard-pages/SiteBuilder';
import { Toaster } from 'react-hot-toast';
import '@/dashboard.css';

export default function BuilderPage() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <WebsiteProvider>
          <SiteBuilder />
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: 'bg-card text-card-foreground shadow-lg',
              style: {
                borderRadius: '0.5rem',
              },
            }}
          />
        </WebsiteProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}