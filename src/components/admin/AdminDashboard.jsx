'use client';
import { useState } from 'react';
import { Users, Globe, BookOpen, BarChart3, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AllUsers from './AllUsers';
import AllWebsites from './AllWebsites';
import AllCourses from './AllCourses';
import Analytics from './Analytics';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const router = useRouter();

  const handleSignOut = () => {
    router.push('/');
  };

  const tabs = [
    { id: 'users', name: 'All Users', icon: Users },
    { id: 'websites', name: 'All Websites', icon: Globe },
    { id: 'courses', name: 'All Courses', icon: BookOpen },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">LearnerFast</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {activeTab === 'users' && <AllUsers />}
        {activeTab === 'websites' && <AllWebsites />}
        {activeTab === 'courses' && <AllCourses />}
        {activeTab === 'analytics' && <Analytics />}
      </div>
    </div>
  );
};

export default AdminDashboard;
