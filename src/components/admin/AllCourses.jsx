'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, BookOpen } from 'lucide-react';

const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (coursesError) throw coursesError;

      const { data: usersData } = await supabase.from('profiles').select('id, email, name');
      
      const coursesWithUsers = (coursesData || []).map(course => ({
        ...course,
        owner: usersData?.find(u => u.id === course.user_id)
      }));

      setCourses(coursesWithUsers);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-12">Loading courses...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">All Courses</h2>
        <p className="text-gray-600 mt-1">View all created courses</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{course.description || 'No description'}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {course.status}
                    </span>
                    <span className="text-xs text-gray-500">{course.owner?.name || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12 text-gray-500">No courses found</div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          Total Courses: {filteredCourses.length}
        </div>
      </div>
    </div>
  );
};

export default AllCourses;
