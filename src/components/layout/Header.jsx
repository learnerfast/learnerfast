import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, LogOut, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

const Header = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title')
      .eq('user_id', user.id);
    
    if (!courses?.length) return;
    
    const courseIds = courses.map(c => c.id);
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('*, profiles(name, email)')
      .in('course_id', courseIds)
      .order('enrolled_at', { ascending: false });
    
    const { data: websiteUsers } = await supabase
      .from('website_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    const notifs = [];
    
    // Add enrollments
    enrollments?.forEach(e => {
      const enrollDate = new Date(e.enrolled_at);
      const diffMs = Date.now() - enrollDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      let timeStr;
      if (diffMins < 60) timeStr = `${diffMins}m ago`;
      else if (diffHours < 24) timeStr = `${diffHours}h ago`;
      else timeStr = `${diffDays}d ago`;
      
      const name = e.profiles?.name || e.profiles?.email?.split('@')[0] || 'Student';
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      
      notifs.push({
        initials,
        name,
        message: `Enrolled in your course`,
        time: timeStr,
        type: 'Enrollment',
        date: enrollDate
      });
    });
    
    // Add website users
    websiteUsers?.forEach(wu => {
      const joinDate = new Date(wu.created_at);
      const diffMs = Date.now() - joinDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      let timeStr;
      if (diffMins < 60) timeStr = `${diffMins}m ago`;
      else if (diffHours < 24) timeStr = `${diffHours}h ago`;
      else timeStr = `${diffDays}d ago`;
      
      const name = wu.name || wu.email?.split('@')[0] || 'User';
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      
      notifs.push({
        initials,
        name,
        message: `Joined your platform`,
        time: timeStr,
        type: 'New User',
        date: joinDate
      });
    });
    
    notifs.sort((a, b) => b.date - a.date);
    setNotifications(notifs.slice(0, 15));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <div className="relative" ref={notificationRef}>
            <motion.button 
              onClick={() => setShowNotifications(!showNotifications)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors relative rounded-full hover:bg-accent"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-card"></span>
              )}
            </motion.button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto"
                >
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notif, idx) => (
                        <div key={idx} className="p-3 hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-blue-600">{notif.initials}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 truncate">{notif.name}</p>
                                <span className="text-xs text-gray-500">{notif.time}</span>
                              </div>
                              <p className="text-sm text-gray-600 truncate">{notif.message}</p>
                              <div className="flex items-center mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">{notif.type}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="h-8 w-px bg-border"></div>

          <div className="relative" ref={dropdownRef}>
            <motion.button 
              onClick={() => setShowDropdown(!showDropdown)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-accent"
            >
              <motion.div
                animate={{ rotate: showDropdown ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md"
              >
                <User className="h-4 w-4 text-white" />
              </motion.div>
            </motion.button>
            
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                >
                  <button
                    onClick={() => {
                      window.location.href = '/dashboard/settings';
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
