'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Globe, Eye } from 'lucide-react';

const AllWebsites = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*, profiles(email, name)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSites(data || []);
    } catch (error) {
      console.error('Error loading sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSites = sites.filter(site =>
    site.name?.toLowerCase().includes(search.toLowerCase()) ||
    site.url?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-12">Loading websites...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">All Websites</h2>
        <p className="text-gray-600 mt-1">View all created websites</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search websites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
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
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSites.map((site) => (
                <tr key={site.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{site.name}</td>
                  <td className="py-3 px-4">
                    <a 
                      href={`https://${site.url}.learnerfast.com`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center space-x-1"
                    >
                      <Globe className="h-4 w-4" />
                      <span>{site.url}</span>
                    </a>
                  </td>
                  <td className="py-3 px-4">{site.profiles?.email || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      site.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {site.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{new Date(site.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => window.open(`https://${site.url}.learnerfast.com`, '_blank')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Total Websites: {filteredSites.length}
        </div>
      </div>
    </div>
  );
};

export default AllWebsites;
