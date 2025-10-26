'use client';
import { useState, useEffect } from 'react';
import { Users, Globe, BookOpen, TrendingUp, Download, Activity, Clock, Eye, BarChart3, PieChart, Calendar, Award } from 'lucide-react';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadAnalytics, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/cron/inactivity?getData=true');
      const data = await response.json();
      
      const users = data.users || [];
      const sites = data.sites || [];
      const courses = data.courses || [];
      const lessons = data.lessons || [];

      const now = new Date();
      const daysBack = parseInt(dateRange);
      const dateThreshold = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const userAnalytics = users.map(user => {
        const userSites = sites.filter(s => s.user_id === user.id);
        const userCourses = courses.filter(c => c.user_id === user.id);
        return {
          id: user.id,
          name: user.user_metadata?.full_name || 'N/A',
          email: user.email || 'N/A',
          registrationDate: user.created_at,
          lastSignIn: user.last_sign_in_at,
          accountStatus: user.last_sign_in_at ? 'active' : 'inactive',
          websitesCreated: userSites.length,
          coursesCreated: userCourses.length,
          publishedSites: userSites.filter(s => s.status === 'published').length,
          totalActivity: userSites.length + userCourses.length
        };
      });

      const websiteAnalytics = sites.map(site => ({
        name: site.name || 'Untitled',
        url: site.url || 'N/A',
        createdDate: site.created_at,
        status: site.status || 'draft',
        owner: users.find(u => u.id === site.user_id)?.email || 'Unknown',
        lastModified: site.updated_at
      }));

      const newUsersLast30Days = users.filter(u => new Date(u.created_at) > last30Days).length;
      const newUsersLast7Days = users.filter(u => new Date(u.created_at) > last7Days).length;
      const activeUsers = users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > last7Days).length;
      const topUsers = userAnalytics.sort((a, b) => b.totalActivity - a.totalActivity).slice(0, 10);

      setAnalytics({
        summary: {
          totalUsers: users.length,
          totalWebsites: sites.length,
          totalCourses: courses.length,
          totalLessons: lessons.length,
          activeWebsites: sites.filter(s => s.status === 'published').length,
          draftWebsites: sites.filter(s => s.status === 'draft').length,
          publishedCourses: courses.filter(c => c.status === 'published').length,
          newUsersLast30Days,
          newUsersLast7Days,
          activeUsers,
          avgCoursesPerSite: sites.length > 0 ? (courses.length / sites.length).toFixed(1) : 0,
          avgLessonsPerCourse: courses.length > 0 ? (lessons.length / courses.length).toFixed(1) : 0
        },
        users: userAnalytics,
        topUsers,
        websites: websiteAnalytics,
        growth: {
          usersGrowth: newUsersLast30Days,
          sitesGrowth: sites.filter(s => new Date(s.created_at) > last30Days).length,
          coursesGrowth: courses.filter(c => new Date(c.created_at) > last30Days).length
        }
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
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

  if (loading || !analytics) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Comprehensive platform analytics and insights</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white">
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
          <button onClick={loadAnalytics} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
            <Activity className="h-4 w-4" /> Refresh
          </button>
          <button onClick={() => setAutoRefresh(!autoRefresh)} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${autoRefresh ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
            <Clock className="h-4 w-4" /> Auto {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button onClick={exportToJSON} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="h-4 w-4" /> JSON
          </button>
          <button onClick={exportToCSV} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Download className="h-4 w-4" /> CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.totalUsers}</p>
              <p className="text-xs text-gray-500 mt-1">+{analytics.summary.newUsersLast30Days} this month</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Websites</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.totalWebsites}</p>
              <p className="text-xs text-gray-500 mt-1">{analytics.summary.activeWebsites} published</p>
            </div>
            <Globe className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.totalCourses}</p>
              <p className="text-xs text-gray-500 mt-1">{analytics.summary.publishedCourses} published</p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Lessons</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.totalLessons}</p>
              <p className="text-xs text-gray-500 mt-1">Avg {analytics.summary.avgLessonsPerCourse} per course</p>
            </div>
            <Activity className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Users (7d)</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.activeUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">New Users (30d)</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.newUsersLast30Days}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Courses/Site</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.avgCoursesPerSite}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <PieChart className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Draft Sites</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.draftWebsites}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Eye className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Inactive Users</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.totalUsers - analytics.summary.activeUsers}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Growth (30 Days)</h3>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">New Users</span>
                <span className="font-semibold text-blue-600">+{analytics.growth.usersGrowth} ({analytics.summary.totalUsers > 0 ? Math.round((analytics.growth.usersGrowth / analytics.summary.totalUsers) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: `${Math.min((analytics.growth.usersGrowth / analytics.summary.totalUsers) * 100, 100)}%`}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">New Websites</span>
                <span className="font-semibold text-green-600">+{analytics.growth.sitesGrowth} ({analytics.summary.totalWebsites > 0 ? Math.round((analytics.growth.sitesGrowth / analytics.summary.totalWebsites) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: `${Math.min((analytics.growth.sitesGrowth / analytics.summary.totalWebsites) * 100, 100)}%`}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">New Courses</span>
                <span className="font-semibold text-purple-600">+{analytics.growth.coursesGrowth} ({analytics.summary.totalCourses > 0 ? Math.round((analytics.growth.coursesGrowth / analytics.summary.totalCourses) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{width: `${Math.min((analytics.growth.coursesGrowth / analytics.summary.totalCourses) * 100, 100)}%`}}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Platform Health</h3>
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">User Engagement</span>
              <span className="font-semibold text-green-600">{analytics.summary.totalUsers > 0 ? Math.round((analytics.summary.activeUsers / analytics.summary.totalUsers) * 100) : 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Site Publish Rate</span>
              <span className="font-semibold text-blue-600">{analytics.summary.totalWebsites > 0 ? Math.round((analytics.summary.activeWebsites / analytics.summary.totalWebsites) * 100) : 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Course Publish Rate</span>
              <span className="font-semibold text-purple-600">{analytics.summary.totalCourses > 0 ? Math.round((analytics.summary.publishedCourses / analytics.summary.totalCourses) * 100) : 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Lessons/Course</span>
              <span className="font-semibold text-orange-600">{analytics.summary.avgLessonsPerCourse}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Users (7d)</span>
              <span className="font-semibold text-green-600">+{analytics.summary.newUsersLast7Days}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Contributors</h3>
            <Award className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Rank</th>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Websites</th>
                  <th className="text-left py-2">Courses</th>
                  <th className="text-left py-2">Published</th>
                  <th className="text-left py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topUsers.map((user, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="py-2">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        i === 0 ? 'bg-yellow-100 text-yellow-800' : 
                        i === 1 ? 'bg-gray-100 text-gray-800' : 
                        i === 2 ? 'bg-orange-100 text-orange-800' : 'bg-blue-50 text-blue-800'
                      }`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-2 font-medium">{user.name}</td>
                    <td className="py-2 text-gray-600">{user.email}</td>
                    <td className="py-2">{user.websitesCreated}</td>
                    <td className="py-2">{user.coursesCreated}</td>
                    <td className="py-2">{user.publishedSites}</td>
                    <td className="py-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {user.totalActivity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Joined</th>
                </tr>
              </thead>
              <tbody>
                {analytics.users.slice(0, 8).map((user, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="py-2">{user.name}</td>
                    <td className="py-2 text-gray-600">{user.email}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.accountStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.accountStatus}
                      </span>
                    </td>
                    <td className="py-2 text-gray-600">{new Date(user.registrationDate).toLocaleDateString()}</td>
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
                  <th className="text-left py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {analytics.websites.slice(0, 8).map((site, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{site.name}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${site.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {site.status}
                      </span>
                    </td>
                    <td className="py-2 text-gray-600">{site.owner}</td>
                    <td className="py-2 text-gray-600">{new Date(site.createdDate).toLocaleDateString()}</td>
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
