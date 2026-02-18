'use client';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WebsiteProvider } from '@/contexts/WebsiteContext';
import DynamicSidebar from '@/components/layout/DynamicSidebar';
import Header from '@/components/layout/Header';
import UserPurchases from '@/components/dashboard/UserPurchases';
import { Toaster } from 'react-hot-toast';
import '@/dashboard.css';

export default function PurchasesPage() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <WebsiteProvider>
          <div className="flex h-screen bg-background">
            <DynamicSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
                <div className="container mx-auto px-6 py-8">
                  <UserPurchases />
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
