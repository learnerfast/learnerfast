'use client';
import { useState } from 'react';
import { Users, Globe, BookOpen, BarChart3, Settings, LogOut, Bell, Search, User, Home, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AllUsers from './AllUsers';
import AllWebsites from './AllWebsites';
import AllCourses from './AllCourses';
import Analytics from './Analytics';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const router = useRouter();

  const tabs = [
    { id: 'users', name: 'Users', icon: Users },
    { id: 'websites', name: 'Websites', icon: Globe },
    { id: 'courses', name: 'Courses', icon: BookOpen },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'communication', name: 'Communication', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-[#f8f9fb]">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <Image src="/learnerfast-logo.png" alt="LearnerFast" width={150} height={40} style={{height: 'auto'}} />
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors relative w-full ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {activeTab === tab.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-blue-600 rounded-r-full"></div>}
              <tab.icon className={`mr-3 h-5 w-5 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
              {tab.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => router.push('/')}
            className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <Settings className="mr-3 h-5 w-5 text-gray-500 group-hover:text-gray-700" />
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-6 h-20 flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-10 pr-4 py-2.5 w-80 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors relative rounded-full hover:bg-gray-100">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f8f9fb]">
          <div className="container mx-auto px-6 py-8">
            {activeTab === 'users' && <AllUsers />}
            {activeTab === 'websites' && <AllWebsites />}
            {activeTab === 'courses' && <AllCourses />}
            {activeTab === 'analytics' && <Analytics />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
