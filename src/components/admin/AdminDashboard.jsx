'use client';
import { useState } from 'react';
import { Users, Globe, BookOpen, BarChart3, Settings, Bell, Search, User, MessageSquare, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AllUsers from './AllUsers';
import AllWebsites from './AllWebsites';
import AllCourses from './AllCourses';
import Analytics from './Analytics';
import Communication from './Communication';
import SearchPage from './SearchPage';
import Notifications from './Notifications';
import Purchases from './Purchases';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();

  const tabs = [
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'courses', name: 'Courses', icon: BookOpen },
    { id: 'purchases', name: 'Purchases', icon: ShoppingCart },
    { id: 'websites', name: 'Websites', icon: Globe },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'communication', name: 'Communication', icon: MessageSquare },
    { id: 'search', name: 'Search', icon: Search },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <Image src="/learnerfast-logo.png" alt="LearnerFast" width={150} height={40} style={{height: 'auto'}} />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all w-full text-left ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className={`mr-3 h-5 w-5 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
              {tab.name}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => router.push('/')}
            className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all w-full text-left text-gray-700 hover:bg-gray-50"
          >
            <Settings className="mr-3 h-5 w-5 text-gray-400" />
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 flex-shrink-0">
          <div className="px-6 h-16 flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-80 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowNotifications(true)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors relative rounded-lg hover:bg-gray-50"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {activeTab === 'users' && <AllUsers />}
            {activeTab === 'websites' && <AllWebsites />}
            {activeTab === 'courses' && <AllCourses />}
            {activeTab === 'purchases' && <Purchases />}
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'communication' && <Communication />}
            {activeTab === 'search' && <SearchPage />}
          </div>
        </main>
      </div>
      
      <Notifications isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  );
};

export default AdminDashboard;
