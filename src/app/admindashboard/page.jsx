'use client';
import { useState } from 'react';
import AdminDashboard from '../../components/admin/AdminDashboard';
import Image from 'next/image';
import { Lock, Mail, Shield } from 'lucide-react';
import '@/dashboard.css';

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Temporarily bypassed
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'support@learnerfast.com' && password === 'kashyap@4241') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 mx-auto">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <Image src="/learnerfast-logo.png" alt="LearnerFast" width={180} height={48} style={{width: 'auto', height: 'auto'}} className="mb-2" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Admin Portal</h2>
            <p className="text-sm text-gray-500 mt-1">Secure access to admin dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@learnerfast.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                  required
                />
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
                <span className="font-medium">{error}</span>
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3.5 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}
