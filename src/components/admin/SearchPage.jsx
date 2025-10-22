'use client';
import { useState } from 'react';
import { supabaseAdmin } from '../../lib/supabase';
import { Search, Users, Globe, BookOpen, Mail, ExternalLink, Eye, Filter, TrendingUp, Calendar, CheckCircle } from 'lucide-react';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], sites: [], courses: [] });
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleSearch = async (searchQuery) => {
    const searchTerm = searchQuery || query;
    if (!searchTerm.trim()) {
      setResults({ users: [], sites: [], courses: [] });
      return;
    }
    
    setLoading(true);
    try {
      const searchLower = searchTerm.toLowerCase();
      
      // Search users
      const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers();
      const filteredUsers = (authUsers || []).filter(u => 
        u.email?.toLowerCase().includes(searchLower) ||
        u.user_metadata?.full_name?.toLowerCase().includes(searchLower)
      );

      // Search sites
      const { data: sitesData } = await supabaseAdmin.from('sites').select('*');
      let filteredSites = (sitesData || []).filter(s =>
        s.name?.toLowerCase().includes(searchLower) ||
        s.url?.toLowerCase().includes(searchLower)
      );
      if (statusFilter !== 'all') {
        filteredSites = filteredSites.filter(s => s.status === statusFilter);
      }

      // Search courses
      const { data: coursesData } = await supabaseAdmin.from('courses').select('*');
      let filteredCourses = (coursesData || []).filter(c =>
        c.title?.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower)
      );
      if (statusFilter !== 'all') {
        filteredCourses = filteredCourses.filter(c => c.status === statusFilter);
      }

      // Enrich with owner data
      const sitesWithOwners = filteredSites.map(site => ({
        ...site,
        owner: authUsers?.find(u => u.id === site.user_id)
      }));

      const coursesWithOwners = filteredCourses.map(course => ({
        ...course,
        owner: authUsers?.find(u => u.id === course.user_id)
      }));

      setResults({
        users: filteredUsers,
        sites: sitesWithOwners,
        courses: coursesWithOwners
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalResults = results.users.length + results.sites.length + results.courses.length;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Global Search</h2>
        <p className="text-gray-600 mt-1">Search across all platform data in real-time</p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-sm border border-blue-200 p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="Search by name, email, title, URL, description..."
                className="w-full pl-12 pr-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg bg-white"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={!query.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
            >
              <Search className="h-5 w-5" />
              Search
            </button>
          </div>
          <div className="flex gap-3 items-center">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Filters:</span>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="users">Users Only</option>
              <option value="sites">Websites Only</option>
              <option value="courses">Courses Only</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {totalResults > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">
                Found <span className="font-bold text-blue-600 text-lg">{totalResults}</span> result{totalResults !== 1 ? 's' : ''} for <span className="font-semibold">"{query}"</span>
              </span>
            </div>
            <div className="flex gap-4 text-sm">
              {results.users.length > 0 && <span className="text-gray-600"><span className="font-semibold text-blue-600">{results.users.length}</span> Users</span>}
              {results.sites.length > 0 && <span className="text-gray-600"><span className="font-semibold text-green-600">{results.sites.length}</span> Websites</span>}
              {results.courses.length > 0 && <span className="text-gray-600"><span className="font-semibold text-purple-600">{results.courses.length}</span> Courses</span>}
            </div>
          </div>
        </div>
      )}

      {(searchType === 'all' || searchType === 'users') && results.users.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Users</h3>
                <p className="text-sm text-gray-500">{results.users.length} result{results.users.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {results.users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all">
                <div>
                  <p className="font-semibold text-gray-900">{user.user_metadata?.full_name || 'N/A'}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                    {user.last_sign_in_at && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Last active: {new Date(user.last_sign_in_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.email_confirmed_at ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.email_confirmed_at ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(searchType === 'all' || searchType === 'sites') && results.sites.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Websites</h3>
                <p className="text-sm text-gray-500">{results.sites.length} result{results.sites.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {results.sites.map((site) => (
              <div key={site.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all">
                <div>
                  <p className="font-semibold text-gray-900">{site.name}</p>
                  <a
                    href={`https://${site.url}.learnerfast.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Globe className="h-3 w-3" />
                    {site.url}.learnerfast.com
                  </a>
                  <p className="text-xs text-gray-500 mt-1">
                    Owner: {site.owner?.email || 'Unknown'}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    site.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {site.status}
                  </span>
                  <button
                    onClick={() => window.open(`https://${site.url}.learnerfast.com`, '_blank')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(searchType === 'all' || searchType === 'courses') && results.courses.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Courses</h3>
                <p className="text-sm text-gray-500">{results.courses.length} result{results.courses.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {results.courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{course.title}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{course.description || 'No description'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Owner: {course.owner?.email || 'Unknown'}
                  </p>
                </div>
                <div className="flex gap-2 items-center ml-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {course.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && totalResults === 0 && query && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-10 w-10 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900 mb-2">No results found</p>
          <p className="text-gray-600 mb-1">No matches for "{query}"</p>
          <p className="text-sm text-gray-500 mt-3">Try different keywords, check spelling, or adjust filters</p>
        </div>
      )}

      {!query && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-12 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Search className="h-10 w-10 text-blue-600" />
          </div>
          <p className="text-lg font-semibold text-gray-900 mb-2">Start Searching</p>
          <p className="text-gray-600">Enter keywords to search across users, websites, and courses</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
