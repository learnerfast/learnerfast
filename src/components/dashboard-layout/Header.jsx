import React, { useState, useEffect } from 'react';
import { Bell, Search, User, TrendingUp, Users, BookOpen, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const Header = () => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    const notifs = [];
    
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title')
      .eq('user_id', user.id);
    
    if (courses?.length) {
      const courseIds = courses.map(c => c.id);
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*, profiles(name, email), courses(title)')
        .in('course_id', courseIds)
        .order('enrolled_at', { ascending: false })
        .limit(10);
      
      enrollments?.forEach(e => {
        const enrollDate = new Date(e.enrolled_at);
        const now = new Date();
        const diffMs = now - enrollDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        let timeStr;
        if (diffMins < 60) timeStr = `${diffMins}m ago`;
        else if (diffHours < 24) timeStr = `${diffHours}h ago`;
        else timeStr = `${diffDays}d ago`;
        
        notifs.push({
          type: 'enrollment',
          title: 'New Enrollment',
          message: `${e.profiles?.name || e.profiles?.email || 'A student'} enrolled in ${e.courses?.title || 'your course'}`,
          time: timeStr
        });
      });
    }
    
    setNotifications(notifs);
  };

  return (
    <header className="bg-card border-b border-border">
      <div className="px-6 h-20 flex items-center justify-between">
        {/* Left: Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search anything..."
            className="pl-10 pr-4 py-2.5 w-64 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>
        
        {/* Right: Actions & Profile */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors relative"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-card"></span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No recent notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notif, idx) => (
                        <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${
                              notif.type === 'enrollment' ? 'bg-blue-100' :
                              notif.type === 'course' ? 'bg-green-100' :
                              notif.type === 'revenue' ? 'bg-purple-100' :
                              'bg-orange-100'
                            }`}>
                              {notif.type === 'enrollment' ? <Users className="h-4 w-4 text-blue-600" /> :
                               notif.type === 'course' ? <BookOpen className="h-4 w-4 text-green-600" /> :
                               notif.type === 'revenue' ? <DollarSign className="h-4 w-4 text-purple-600" /> :
                               <TrendingUp className="h-4 w-4 text-orange-600" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="h-8 w-px bg-border"></div>

          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
