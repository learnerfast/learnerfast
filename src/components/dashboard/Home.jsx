import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Globe, TrendingUp, Plus, BookOpen, Video } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { name: 'Total Courses', value: '0', icon: BookOpen, change: '+0', changeType: 'positive' },
    { name: 'Total Videos', value: '0', icon: Video, change: '+0', changeType: 'positive' },
    { name: 'Websites Created', value: '0', icon: Globe, change: '+0', changeType: 'positive' },
    { name: 'This Month', value: '0', icon: TrendingUp, change: '+0', changeType: 'positive' },
  ]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;

      try {
        // Load courses count
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('id')
          .eq('user_id', user.id);

        // Load videos count
        const { data: videos, error: videosError } = await supabase
          .from('course_videos')
          .select('id')
          .eq('user_id', user.id);

        // Load websites count from database
        const { data: sites, error: sitesError } = await supabase
          .from('sites')
          .select('id')
          .eq('user_id', user.id);
        
        const websites = sites || [];

        // Update stats
        setStats([
          { name: 'Total Courses', value: courses?.length || 0, icon: BookOpen, change: '+0', changeType: 'positive' },
          { name: 'Total Videos', value: videos?.length || 0, icon: Video, change: '+0', changeType: 'positive' },
          { name: 'Websites Created', value: websites.length, icon: Globe, change: '+0', changeType: 'positive' },
          { name: 'This Month', value: '0', icon: TrendingUp, change: '+0', changeType: 'positive' },
        ]);

        // Set recent activity
        const activities = [];
        if (courses?.length > 0) activities.push({ type: 'course', count: courses.length });
        if (videos?.length > 0) activities.push({ type: 'video', count: videos.length });
        if (websites.length > 0) activities.push({ type: 'website', count: websites.length });
        setRecentActivity(activities);

      } catch (error) {
      }
    };

    loadDashboardData();
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening with your courses.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-card rounded-xl shadow-subtle border border-border p-6 transition-transform hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-muted-foreground ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-xl shadow-subtle border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/websites/design" className="group p-6 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-center">
            <Globe className="h-10 w-10 text-muted-foreground group-hover:text-primary mx-auto mb-3 transition-colors" />
            <p className="text-sm font-semibold text-foreground">Create New Website</p>
            <p className="text-xs text-muted-foreground">Start building your course site</p>
          </Link>
          
          <Link href="/dashboard/courses" className="group p-6 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-center">
            <BarChart3 className="h-10 w-10 text-muted-foreground group-hover:text-primary mx-auto mb-3 transition-colors" />
            <p className="text-sm font-semibold text-foreground">Add New Course</p>
            <p className="text-xs text-muted-foreground">Create engaging content</p>
          </Link>
          
          <Link href="/dashboard/users" className="group p-6 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-center">
            <Users className="h-10 w-10 text-muted-foreground group-hover:text-primary mx-auto mb-3 transition-colors" />
            <p className="text-sm font-semibold text-foreground">Invite Students</p>
            <p className="text-xs text-muted-foreground">Grow your community</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
