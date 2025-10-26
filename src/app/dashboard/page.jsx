'use client';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WebsiteProvider } from '@/contexts/WebsiteContext';
import Dashboard from '@/dashboard-pages/Dashboard';
import { Toaster } from 'react-hot-toast';
import '@/dashboard.css';

export default function DashboardPage() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <WebsiteProvider>
          <Dashboard />
          <Toaster 
            position="top-center" 
            toastOptions={{
              className: 'bg-card text-card-foreground shadow-lg',
              style: {
                borderRadius: '0.5rem',
                zIndex: 99999,
              },
            }}
          />
        </WebsiteProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}