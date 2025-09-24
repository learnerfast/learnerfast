'use client';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Login from '@/dashboard-pages/Login';
import { Toaster } from 'react-hot-toast';
import '@/dashboard.css';

export default function LoginPage() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Login />
        <Toaster 
          position="top-right" 
          toastOptions={{
            className: 'bg-card text-card-foreground shadow-lg',
            style: {
              borderRadius: '0.5rem',
            },
          }}
        />
      </ThemeProvider>
    </AuthProvider>
  );
}