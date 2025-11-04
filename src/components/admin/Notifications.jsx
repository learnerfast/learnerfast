'use client';
import { useState, useEffect } from 'react';
import { X, UserPlus, TrendingUp, Globe, BookOpen, CheckCircle, Clock } from 'lucide-react';
import useSWR from 'swr';

const fetchNotificationData = async () => {
  const response = await fetch('/api/cron/inactivity?getData=true');
  const data = await response.json();
  
  const users = data.users || [];
  const sites = data.sites || [];
  const courses = data.courses || [];
  
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const newUsers = users.filter(u => new Date(u.created_at) > last7Days);
  const recentUsers = users.filter(u => new Date(u.created_at) > last24Hours);
  const newSites = sites.filter(s => new Date(s.created_at) > last7Days);
  const newCourses = courses.filter(c => new Date(c.created_at) > last7Days);
  const publishedSites = sites.filter(s => s.status === 'published' && new Date(s.updated_at) > last7Days);
  
  const notifications = [];
  
  recentUsers.forEach(user => {
    notifications.push({
      id: `user-${user.id}`,
      type: 'enrollment',
      icon: UserPlus,
      color: 'blue',
      title: 'New Student Enrollment',
      message: `${user.user_metadata?.full_name || user.email} joined the platform`,
      time: new Date(user.created_at),
      data: { email: user.email, name: user.user_metadata?.full_name || 'N/A' }
    });
  });
  
  publishedSites.forEach(site => {
    const owner = users.find(u => u.id === site.user_id);
    notifications.push({
      id: `site-${site.id}`,
      type: 'website',
      icon: Globe,
      color: 'green',
      title: 'Website Published',
      message: `${owner?.user_metadata?.full_name || owner?.email || 'User'} published "${site.name}"`,
      time: new Date(site.updated_at),
      data: { siteName: site.name, owner: owner?.email }
    });
  });
  
  newCourses.slice(0, 5).forEach(course => {
    const owner = users.find(u => u.id === course.user_id);
    notifications.push({
      id: `course-${course.id}`,
      type: 'course',
      icon: BookOpen,
      color: 'purple',
      title: 'New Course Created',
      message: `${owner?.user_metadata?.full_name || owner?.email || 'User'} created "${course.title}"`,
      time: new Date(course.created_at),
      data: { courseTitle: course.title, owner: owner?.email }
    });
  });
  
  const weeklyStats = {
    newUsers: newUsers.length,
    newSites: newSites.length,
    newCourses: newCourses.length,
    publishedSites: publishedSites.length,
    activeUsers: users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > last7Days).length
  };
  
  notifications.push({
    id: 'weekly-analytics',
    type: 'analytics',
    icon: TrendingUp,
    color: 'orange',
    title: 'Weekly Analytics Summary',
    message: `${weeklyStats.newUsers} new users, ${weeklyStats.newSites} websites, ${weeklyStats.newCourses} courses created`,
    time: now,
    data: weeklyStats
  });
  
  return notifications.sort((a, b) => b.time - a.time);
};

const Notifications = ({ isOpen, onClose }) => {
  const { data: notifications, error, isLoading } = useSWR(
    isOpen ? '/api/notifications' : null,
    fetchNotificationData,
    { revalidateOnFocus: false, refreshInterval: 60000 }
  );
  
  const [filter, setFilter] = useState('all');
  
  if (!isOpen) return null;
  
  const filteredNotifications = notifications?.filter(n => 
    filter === 'all' || n.type === filter
  ) || [];
  
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };
  
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-600">{filteredNotifications.length} notifications</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('enrollment')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                filter === 'enrollment' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Enrollments
            </button>
            <button
              onClick={() => setFilter('analytics')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                filter === 'analytics' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setFilter('website')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                filter === 'website' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Websites
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <CheckCircle className="h-12 w-12 mb-2 text-gray-300" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClasses[notification.color]}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 text-sm">{notification.title}</h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getTimeAgo(notification.time)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        
                        {notification.type === 'analytics' && notification.data && (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="bg-blue-50 rounded-lg p-2">
                              <p className="text-xs text-gray-600">New Users</p>
                              <p className="text-lg font-bold text-blue-600">{notification.data.newUsers}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-2">
                              <p className="text-xs text-gray-600">Active Users</p>
                              <p className="text-lg font-bold text-green-600">{notification.data.activeUsers}</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-2">
                              <p className="text-xs text-gray-600">New Courses</p>
                              <p className="text-lg font-bold text-purple-600">{notification.data.newCourses}</p>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-2">
                              <p className="text-xs text-gray-600">Published Sites</p>
                              <p className="text-lg font-bold text-orange-600">{notification.data.publishedSites}</p>
                            </div>
                          </div>
                        )}
                        
                        {notification.data?.email && (
                          <p className="text-xs text-gray-500 mt-2">{notification.data.email}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
