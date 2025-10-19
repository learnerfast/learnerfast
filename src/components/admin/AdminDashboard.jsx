'use client';
import { useState } from 'react';
import { Users, Globe, BookOpen, BarChart3, LogOut, Bell, Search, User } from 'lucide-react';
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
    { id: 'users', name: 'All Users', icon: Users },
    { id: 'websites', name: 'All Websites', icon: Globe },
    { id: 'courses', name: 'All Courses', icon: BookOpen },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Image src="/learnerfast-logo.png" alt="LearnerFast" width={150} height={40} style={{height: 'auto'}} />
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors relative w-full ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {activeTab === tab.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-primary rounded-r-full"></div>}
              <tab.icon className={`mr-3 h-5 w-5 ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
              {tab.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => router.push('/')}
            className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors w-full text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <LogOut className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-foreground" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border">
          <div className="px-6 h-20 flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-10 pr-4 py-2.5 w-64 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
            <div className="flex items-center space-x-6">
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors relative rounded-full hover:bg-accent">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-card"></span>
              </button>
              <div className="h-8 w-px bg-border"></div>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
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
