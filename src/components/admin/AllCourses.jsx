'use client';
import { useState, useEffect } from 'react';
import { supabaseAdmin } from '../../lib/supabase';
import { Search, BookOpen, Download, Filter, TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';

const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewCourse, setViewCourse] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const { data: coursesData, error: coursesError } = await supabaseAdmin
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (coursesError) throw coursesError;

      const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers();
      const { data: lessonsData } = await supabaseAdmin.from('lessons').select('course_id');
      
      const coursesWithUsers = (coursesData || []).map(course => {
        const user = authUsers?.find(u => u.id === course.user_id);
        const lessonCount = lessonsData?.filter(l => l.course_id === course.id).length || 0;
        return {
          ...course,
          owner: {
            email: user?.email || 'N/A',
            name: user?.user_metadata?.full_name || 'N/A'
          },
          lessonCount
        };
      });

      setCourses(coursesWithUsers);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  let filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(search.toLowerCase()) ||
    course.owner?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (filterStatus === 'published') {
    filteredCourses = filteredCourses.filter(c => c.status === 'published');
  } else if (filterStatus === 'draft') {
    filteredCourses = filteredCourses.filter(c => c.status === 'draft');
  }

  if (sortBy === 'recent') {
    filteredCourses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (sortBy === 'title') {
    filteredCourses.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'lessons') {
    filteredCourses.sort((a, b) => b.lessonCount - a.lessonCount);
  }

  const stats = {
    total: courses.length,
    published: courses.filter(c => c.status === 'published').length,
    draft: courses.filter(c => c.status === 'draft').length,
    totalLessons: courses.reduce((sum, c) => sum + c.lessonCount, 0)
  };

  const exportCSV = () => {
    const csv = ['Title,Description,Status,Lessons,Owner,Created'];
    filteredCourses.forEach(c => {
      csv.push(`"${c.title}","${c.description || ''}",${c.status},${c.lessonCount},${c.owner?.email},${new Date(c.created_at).toLocaleDateString()}`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `courses-${new Date().toISOString()}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="text-center py-12">Loading courses...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Courses</h2>
          <p className="text-gray-600 mt-1">View all created courses</p>
        </div>
        <button onClick={exportCSV} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
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
              <p className="text-sm text-gray-600">Total Lessons</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalLessons}</p>
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
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary appearance-none bg-white">
              <option value="all">All Courses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary appearance-none bg-white">
              <option value="recent">Recent</option>
              <option value="title">Title</option>
              <option value="lessons">Most Lessons</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1 cursor-pointer hover:text-blue-600" onClick={() => setViewCourse(course)}>{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description || 'No description'}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {course.status}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      {course.lessonCount} lessons
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course.owner?.name || 'Unknown'}
                    </span>
                    <span>{new Date(course.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setViewCourse(course)} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">View</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12 text-gray-500">No courses found</div>
        )}

        <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
          <span>Showing {filteredCourses.length} of {courses.length} courses</span>
          <span>Avg Lessons: {courses.length > 0 ? Math.round(stats.totalLessons / stats.total) : 0}</span>
        </div>
      </div>

      {viewCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setViewCourse(null)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Course Details</h3>
              <button onClick={() => setViewCourse(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Title</p>
                <p className="font-semibold text-lg">{viewCourse.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-gray-800">{viewCourse.description || 'No description'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold">{viewCourse.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lessons</p>
                  <p className="font-semibold">{viewCourse.lessonCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Owner</p>
                  <p className="font-semibold">{viewCourse.owner?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{viewCourse.owner?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-semibold">{new Date(viewCourse.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Updated</p>
                  <p className="font-semibold">{new Date(viewCourse.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AllCourses;
