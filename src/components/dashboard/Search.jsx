import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, TrendingUp, Clock, Users, FileText, Video, Image } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
// Dashboard functions and features
const dashboardFunctions = [
  { id: 'courses', title: 'Courses', description: 'Manage your courses and content', type: 'function', path: '/dashboard/courses' },
  { id: 'course-builder', title: 'Course Builder', description: 'Create and edit course content', type: 'function', path: '/dashboard/course-builder' },
  { id: 'websites', title: 'Websites', description: 'Manage your websites and domains', type: 'function', path: '/dashboard/websites' },
  { id: 'users', title: 'Users', description: 'View and manage user accounts', type: 'function', path: '/dashboard/users' },
  { id: 'settings', title: 'Settings', description: 'Configure your account and preferences', type: 'function', path: '/dashboard/settings' },
  { id: 'communication', title: 'Communication', description: 'Manage emails and notifications', type: 'function', path: '/dashboard/communication' },
  { id: 'add-course', title: 'Add New Course', description: 'Create a new course from scratch', type: 'action', path: '/dashboard/courses' },
  { id: 'create-website', title: 'Create Website', description: 'Set up a new website', type: 'action', path: '/dashboard/websites' }
];

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();

  // Perform search when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim() || !user) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = [];
        
        // Search dashboard functions
        const functionResults = dashboardFunctions.filter(func => 
          func.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          func.description.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(func => ({
          id: func.id,
          title: func.title,
          type: func.type,
          description: func.description,
          author: 'Dashboard',
          date: new Date(),
          views: 0,
          category: 'Dashboard Function',
          thumbnail: `/api/placeholder/100/100`,
          path: func.path
        }));
        results.push(...functionResults);

        // Search courses
        const { data: courses } = await supabase
          .from('courses')
          .select('*')
          .eq('user_id', user.id)
          .ilike('title', `%${searchQuery}%`);
        
        if (courses) {
          results.push(...courses.map(course => ({
            id: `course-${course.id}`,
            title: course.title,
            type: 'course',
            description: course.description || 'Course content',
            author: 'You',
            date: new Date(course.created_at),
            views: 0,
            category: 'Your Content',
            thumbnail: `/api/placeholder/100/100`
          })));
        }

        // Search websites
        const { data: websites } = await supabase
          .from('websites')
          .select('*')
          .eq('user_id', user.id)
          .ilike('name', `%${searchQuery}%`);
        
        if (websites) {
          results.push(...websites.map(website => ({
            id: `website-${website.id}`,
            title: website.name,
            type: 'website',
            description: website.description || `Website: ${website.domain}`,
            author: 'You',
            date: new Date(website.created_at),
            views: 0,
            category: 'Your Websites',
            thumbnail: `/api/placeholder/100/100`
          })));
        }

        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, user]);



  const popularSearches = [
    'courses',
    'course builder',
    'websites',
    'users',
    'settings',
    'add course',
    'create website',
    'communication'
  ];

  const categories = [
    { id: 'all', name: 'All Results', icon: SearchIcon },
    { id: 'courses', name: 'Courses', icon: Video },
    { id: 'functions', name: 'Functions', icon: FileText },
    { id: 'websites', name: 'Websites', icon: Users },
    { id: 'content', name: 'Content', icon: Image }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'course':
        return Video;
      case 'function':
        return FileText;
      case 'action':
        return FileText;
      case 'website':
        return Users;
      case 'content':
        return Image;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'course':
        return 'bg-blue-100 text-blue-800';
      case 'function':
        return 'bg-green-100 text-green-800';
      case 'action':
        return 'bg-purple-100 text-purple-800';
      case 'website':
        return 'bg-orange-100 text-orange-800';
      case 'content':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Search</h2>
        <p className="text-gray-600">Find courses, content, and users across your platform</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for courses, content, users..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-sm font-medium text-gray-600">Quick filters:</span>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-100 text-primary-700 border border-primary-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <category.icon className="h-3 w-3" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Results vs Popular Searches */}
      {searchQuery ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Search Results ({searchResults.length})
            </h3>
            <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {searchResults.map((result) => {
              const IconComponent = getTypeIcon(result.type);
              return (
                <div
                  key={result.id}
                  onClick={() => {
                    if (result.path) {
                      window.location.href = result.path;
                    } else if (result.type === 'course') {
                      window.location.href = `/dashboard/course-builder?id=${result.id.replace('course-', '')}`;
                    } else if (result.type === 'website') {
                      window.location.href = `/dashboard/websites`;
                    }
                  }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start space-x-4">
                    <img
                      className="w-16 h-16 rounded-lg object-cover"
                      src={result.thumbnail}
                      alt={result.title}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getTypeColor(result.type)}`}
                        >
                          {result.type}
                        </span>
                        <span className="text-xs text-gray-500">{result.category}</span>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-1">{result.title}</h4>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{result.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {result.type !== 'function' && result.type !== 'action' && (
                          <span>{result.date.toLocaleDateString()}</span>
                        )}
                        {result.path && (
                          <span className="text-teal-600">Click to navigate →</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Searches */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
              Popular Searches
            </h3>
            <div className="space-y-2">
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(search)}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Searches */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary-600" />
              Recent Searches
            </h3>
            <div className="space-y-2">
              <div className="text-sm text-gray-500 italic">No recent searches yet</div>
            </div>
          </div>
        </div>
      )}

      {/* Search Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Search Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use quotes for exact phrases: "web development"</li>
          <li>• Use + to require words: javascript +es6</li>
          <li>• Use - to exclude words: python -django</li>
          <li>• Use type: to filter by content type: type:course react</li>
        </ul>
      </div>
    </div>
  );
};

export default Search;
