'use client';
import { useState, useEffect } from 'react';
import { supabaseAdmin } from '../../lib/supabase';
import { Search, Globe, Eye, Download, TrendingUp, CheckCircle, Clock, Users, ExternalLink } from 'lucide-react';

const AllWebsites = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewSite, setViewSite] = useState(null);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const { data: sitesData, error: sitesError } = await supabaseAdmin
        .from('sites')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (sitesError) throw sitesError;

      const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers();
      
      const { data: coursesData } = await supabaseAdmin.from('courses').select('id, site_id');
      
      const sitesWithUsers = (sitesData || []).map(site => {
        const user = authUsers?.find(u => u.id === site.user_id);
        const courseCount = coursesData?.filter(c => c.site_id === site.id).length || 0;
        return {
          ...site,
          owner: {
            email: user?.email || 'N/A',
            name: user?.user_metadata?.full_name || 'N/A'
          },
          courseCount
        };
      });

      setSites(sitesWithUsers);
    } catch (error) {
      // Error loading sites
    } finally {
      setLoading(false);
    }
  };

  let filteredSites = sites.filter(site =>
    site.name?.toLowerCase().includes(search.toLowerCase()) ||
    site.url?.toLowerCase().includes(search.toLowerCase()) ||
    site.owner?.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (filterStatus === 'published') {
    filteredSites = filteredSites.filter(s => s.status === 'published');
  } else if (filterStatus === 'draft') {
    filteredSites = filteredSites.filter(s => s.status === 'draft');
  }

  if (sortBy === 'recent') {
    filteredSites.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (sortBy === 'name') {
    filteredSites.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'courses') {
    filteredSites.sort((a, b) => b.courseCount - a.courseCount);
  }

  const stats = {
    total: sites.length,
    published: sites.filter(s => s.status === 'published').length,
    draft: sites.filter(s => s.status === 'draft').length,
    totalCourses: sites.reduce((sum, s) => sum + s.courseCount, 0)
  };

  const exportCSV = () => {
    const csv = ['Name,URL,Status,Courses,Owner,Created,Updated'];
    filteredSites.forEach(s => {
      csv.push(`"${s.name}",${s.url}.learnerfast.com,${s.status},${s.courseCount},${s.owner?.email},${new Date(s.created_at).toLocaleDateString()},${new Date(s.updated_at).toLocaleDateString()}`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `websites-${new Date().toISOString()}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="text-center py-12">Loading websites...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Websites</h2>
          <p className="text-gray-600 mt-1">View all created websites</p>
        </div>
        <button onClick={exportCSV} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Websites</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Globe className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-2xl font-bold text-green-600">{stats.published}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-orange-600">{stats.draft}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalCourses}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search websites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary appearance-none bg-white">
              <option value="all">All Websites</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary appearance-none bg-white">
              <option value="recent">Recent</option>
              <option value="name">Name</option>
              <option value="courses">Most Courses</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">URL</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Owner</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Courses</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Updated</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSites.map((site) => (
                <tr key={site.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <button onClick={() => setViewSite(site)} className="font-medium text-blue-600 hover:underline">{site.name}</button>
                  </td>
                  <td className="py-3 px-4">
                    <a 
                      href={`https://${site.url}.learnerfast.com`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center space-x-1 text-sm"
                    >
                      <Globe className="h-4 w-4" />
                      <span>{site.url}</span>
                    </a>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-gray-400" />
                      {site.owner?.email || 'N/A'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      site.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {site.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      {site.courseCount}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{new Date(site.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{new Date(site.updated_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => window.open(`https://${site.url}.learnerfast.com`, '_blank')} className="text-blue-600 hover:text-blue-800" title="View Website">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button onClick={() => setViewSite(site)} className="text-green-600 hover:text-green-800" title="Details">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <span>Showing {filteredSites.length} of {sites.length} websites</span>
          <span>Publish Rate: {sites.length > 0 ? Math.round((stats.published / stats.total) * 100) : 0}%</span>
        </div>
      </div>

      {viewSite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setViewSite(null)}>
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Website Details</h3>
              <button onClick={() => setViewSite(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-lg">{viewSite.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">URL</p>
                <a href={`https://${viewSite.url}.learnerfast.com`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">
                  {viewSite.url}.learnerfast.com
                </a>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold">{viewSite.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Courses</p>
                  <p className="font-semibold">{viewSite.courseCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Owner</p>
                  <p className="font-semibold">{viewSite.owner?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{viewSite.owner?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-semibold">{new Date(viewSite.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Updated</p>
                  <p className="font-semibold">{new Date(viewSite.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={() => window.open(`https://${viewSite.url}.learnerfast.com`, '_blank')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                <ExternalLink className="h-4 w-4" /> Visit Website
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllWebsites;
