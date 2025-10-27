'use client';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WebsiteProvider } from '@/contexts/WebsiteContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Subscription from '@/components/dashboard/Subscription';
import { Toaster } from 'react-hot-toast';
import '@/dashboard.css';

export default function SubscriptionPage() {
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
                  <Subscription />
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
