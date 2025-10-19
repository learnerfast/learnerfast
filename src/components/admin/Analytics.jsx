'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Globe, BookOpen, TrendingUp } from 'lucide-react';

const Analytics = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWebsites: 0,
    totalCourses: 0,
    publishedWebsites: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [usersRes, sitesRes, coursesRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('sites').select('id, status', { count: 'exact' }),
        supabase.from('courses').select('id', { count: 'exact', head: true })
      ]);

      const publishedCount = sitesRes.data?.filter(s => s.status === 'published').length || 0;

      setStats({
        totalUsers: usersRes.count || 0,
        totalWebsites: sitesRes.count || 0,
        totalCourses: coursesRes.count || 0,
        publishedWebsites: publishedCount
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
    { label: 'Total Websites', value: stats.totalWebsites, icon: Globe, color: 'green' },
    { label: 'Published Websites', value: stats.publishedWebsites, icon: TrendingUp, color: 'purple' },
    { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'orange' }
  ];

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-600 mt-1">Platform overview and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Health</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Website Creation Rate</span>
              <span className="font-medium text-gray-900">
                {stats.totalWebsites > 0 ? Math.round((stats.publishedWebsites / stats.totalWebsites) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${stats.totalWebsites > 0 ? (stats.publishedWebsites / stats.totalWebsites) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
