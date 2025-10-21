'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Globe, BookOpen, TrendingUp, Download, Activity, Clock, Eye } from 'lucide-react';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [usersRes, sitesRes, coursesRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('sites').select('*'),
        supabase.from('courses').select('*')
      ]);

      const users = usersRes.data || [];
      const sites = sitesRes.data || [];
      const courses = coursesRes.data || [];

      const userAnalytics = users.map(user => ({
        id: user.id,
        name: user.full_name || 'N/A',
        email: user.email || 'N/A',
        registrationDate: user.created_at,
        accountStatus: 'active',
        websitesCreated: sites.filter(s => s.user_id === user.id).length,
        coursesCreated: courses.filter(c => c.user_id === user.id).length
      }));

      const websiteAnalytics = sites.map(site => ({
        name: site.name || 'Untitled',
        url: site.domain || site.subdomain || 'N/A',
        createdDate: site.created_at,
        status: site.status || 'draft',
        owner: users.find(u => u.id === site.user_id)?.email || 'Unknown',
        lastModified: site.updated_at
      }));

      setAnalytics({
        summary: {
          totalUsers: users.length,
          totalWebsites: sites.length,
          totalCourses: courses.length,
          activeWebsites: sites.filter(s => s.status === 'published').length
        },
        users: userAnalytics,
        websites: websiteAnalytics
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${new Date().toISOString()}.json`;
    link.click();
  };

  const exportToCSV = () => {
    const csvRows = [];
    csvRows.push('User Name,Email,Registration Date,Websites Created,Courses Created');
    analytics.users.forEach(user => {
      csvRows.push(`${user.name},${user.email},${user.registrationDate},${user.websitesCreated},${user.coursesCreated}`);
    });
    const csvStr = csvRows.join('\n');
    const dataBlob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${new Date().toISOString()}.csv`;
    link.click();
  };

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Comprehensive platform analytics and insights</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToJSON} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="h-4 w-4" /> JSON
          </button>
          <button onClick={exportToCSV} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Download className="h-4 w-4" /> CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.summary.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Websites</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.summary.totalWebsites}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Globe className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Sites</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.summary.activeWebsites}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.summary.totalCourses}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Analytics</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Websites</th>
                  <th className="text-left py-2">Courses</th>
                </tr>
              </thead>
              <tbody>
                {analytics.users.slice(0, 5).map((user, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2">{user.name}</td>
                    <td className="py-2">{user.email}</td>
                    <td className="py-2">{user.websitesCreated}</td>
                    <td className="py-2">{user.coursesCreated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Websites</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Owner</th>
                </tr>
              </thead>
              <tbody>
                {analytics.websites.slice(0, 5).map((site, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2">{site.name}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${site.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {site.status}
                      </span>
                    </td>
                    <td className="py-2">{site.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
