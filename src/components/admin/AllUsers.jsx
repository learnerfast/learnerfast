'use client';
import { useState } from 'react';
import { Search, Mail, Calendar, Download, UserCheck, UserX, TrendingUp, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';
import StatsCard from './StatsCard';

const fetchUsers = async () => {
  const response = await fetch('/api/cron/inactivity?getData=true');
  const data = await response.json();
  
  const authUsers = data.users;
  const sitesData = data.sites;
  const coursesData = data.courses;
  
  const sitesMap = {};
  const coursesMap = {};
  
  sitesData?.forEach(s => {
    if (!sitesMap[s.user_id]) sitesMap[s.user_id] = { total: 0, published: 0 };
    sitesMap[s.user_id].total++;
    if (s.status === 'published') sitesMap[s.user_id].published++;
  });
  
  coursesData?.forEach(c => {
    coursesMap[c.user_id] = (coursesMap[c.user_id] || 0) + 1;
  });

  return (authUsers || []).map(user => {
    const userSites = sitesMap[user.id] || { total: 0, published: 0 };
    const userCourses = coursesMap[user.id] || 0;
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || 'N/A',
      created_at: user.created_at,
      last_sign_in: user.last_sign_in_at,
      email_confirmed: user.email_confirmed_at ? true : false,
      websitesCount: userSites.total,
      coursesCount: userCourses,
      publishedSites: userSites.published,
      totalActivity: userSites.total + userCourses
    };
  });
};

const AllUsers = () => {
  const { data: users, error, isLoading } = useSWR('/api/users', fetchUsers, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 60000
  });
  
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewUser, setViewUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  if (error) {
    toast.error('Failed to load users: ' + error.message);
  }

  let filteredUsers = (users || []).filter(user =>
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (filterStatus === 'active') {
    filteredUsers = filteredUsers.filter(u => u.totalActivity > 0);
  } else if (filterStatus === 'inactive') {
    filteredUsers = filteredUsers.filter(u => u.totalActivity === 0);
  } else if (filterStatus === 'verified') {
    filteredUsers = filteredUsers.filter(u => u.email_confirmed);
  }

  if (sortBy === 'recent') {
    filteredUsers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (sortBy === 'active') {
    filteredUsers.sort((a, b) => b.totalActivity - a.totalActivity);
  } else if (sortBy === 'websites') {
    filteredUsers.sort((a, b) => b.websitesCount - a.websitesCount);
  } else if (sortBy === 'courses') {
    filteredUsers.sort((a, b) => b.coursesCount - a.coursesCount);
  }

  const stats = {
    total: (users || []).length,
    active: (users || []).filter(u => u.totalActivity > 0).length,
    inactive: (users || []).filter(u => u.totalActivity === 0).length,
    verified: (users || []).filter(u => u.email_confirmed).length
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const exportCSV = () => {
    const csv = ['Name,Email,Websites,Courses,Published Sites,Joined,Last Sign In,Verified'];
    filteredUsers.forEach(u => {
      csv.push(`${u.name},${u.email},${u.websitesCount},${u.coursesCount},${u.publishedSites},${new Date(u.created_at).toLocaleDateString()},${u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString() : 'Never'},${u.email_confirmed ? 'Yes' : 'No'}`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString()}.csv`;
    a.click();
  };

  const sendEmail = (email) => {
    window.location.href = `mailto:${email}`;
  };



  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Users</h2>
          <p className="text-gray-600 mt-1">Manage all registered users</p>
        </div>
        <button onClick={exportCSV} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Users" value={stats.total} icon={UserCheck} color="blue" />
        <StatsCard title="Active Users" value={stats.active} icon={TrendingUp} color="green" />
        <StatsCard title="Inactive Users" value={stats.inactive} icon={UserX} color="orange" />
        <StatsCard title="Verified" value={stats.verified} icon={Mail} color="purple" />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary appearance-none bg-white">
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="verified">Verified</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary appearance-none bg-white">
              <option value="recent">Recent</option>
              <option value="active">Most Active</option>
              <option value="websites">Most Websites</option>
              <option value="courses">Most Courses</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Websites</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Courses</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Published</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Sign In</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <button onClick={() => setViewUser(user)} className="text-blue-600 hover:underline">{user.name || 'N/A'}</button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.totalActivity > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.totalActivity > 0 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {user.websitesCount}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {user.coursesCount}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      {user.publishedSites}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {user.last_sign_in ? new Date(user.last_sign_in).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => sendEmail(user.email)} className="text-blue-600 hover:text-blue-800" title="Send Email">
                        <Mail className="h-4 w-4" />
                      </button>
                      <button onClick={() => setViewUser(user)} className="text-green-600 hover:text-green-800" title="View Details">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-sm text-gray-600">
          <span>Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users</span>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            <span className="px-3 py-1">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>

      {viewUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setViewUser(null)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">User Details</h3>
              <button onClick={() => setViewUser(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">{viewUser.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{viewUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold">{viewUser.totalActivity > 0 ? 'Active' : 'Inactive'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email Verified</p>
                <p className="font-semibold">{viewUser.email_confirmed ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Websites Created</p>
                <p className="font-semibold">{viewUser.websitesCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Courses Created</p>
                <p className="font-semibold">{viewUser.coursesCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Published Sites</p>
                <p className="font-semibold">{viewUser.publishedSites}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Activity</p>
                <p className="font-semibold">{viewUser.totalActivity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Joined</p>
                <p className="font-semibold">{new Date(viewUser.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Sign In</p>
                <p className="font-semibold">{viewUser.last_sign_in ? new Date(viewUser.last_sign_in).toLocaleString() : 'Never'}</p>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={() => sendEmail(viewUser.email)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                <Mail className="h-4 w-4" /> Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
