import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Mail, MoreHorizontal, UserPlus, Shield, Crown, TrendingUp, Activity, BarChart3, Users as UsersIcon, BookOpen, Clock, Calendar, Download, Eye, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const Users = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    activeThisWeek: 0,
    newThisMonth: 0,
    totalEnrollments: 0,
    avgProgress: 0,
    completionRate: 0
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      // Load websites
      const { data: sitesData } = await supabase
        .from('sites')
        .select('*')
        .eq('user_id', user.id);
      setWebsites(sitesData || []);

      // Load courses with sections and activities
      const { data: coursesData } = await supabase
        .from('courses')
        .select(`
          *,
          course_sections(id, course_activities(id))
        `)
        .eq('user_id', user.id);
      setCourses(coursesData || []);

      // Load ALL enrollments for user's courses
      const courseIds = (coursesData || []).map(c => c.id);
      let enrollmentsData = [];
      
      if (courseIds.length > 0) {
        const { data } = await supabase
          .from('course_enrollments')
          .select('*')
          .in('course_id', courseIds);
        enrollmentsData = data || [];
      }
      
      // Get unique user IDs from enrollments
      const userIds = [...new Set(enrollmentsData.map(e => e.user_id))];
      
      // Fetch user profiles
      let profilesData = [];
      if (userIds.length > 0) {
        const { data } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);
        profilesData = data || [];
      }
      
      // Create profile map
      const profileMap = new Map(profilesData.map(p => [p.id, p]));
      
      // Enrich enrollments with course and profile data
      const enrichedEnrollments = enrollmentsData.map(e => {
        const course = coursesData?.find(c => c.id === e.course_id);
        const profile = profileMap.get(e.user_id);
        return {
          ...e,
          courses: course ? { title: course.title, id: course.id } : null,
          profiles: profile || null
        };
      });
      setEnrollments(enrichedEnrollments);

      // Aggregate student data
      const studentMap = new Map();
      enrichedEnrollments.forEach(enrollment => {
        const userId = enrollment.user_id;
        if (!studentMap.has(userId)) {
          studentMap.set(userId, {
            id: userId,
            email: enrollment.profiles?.email || `user_${userId.substring(0, 8)}`,
            name: enrollment.profiles?.full_name || enrollment.profiles?.email?.split('@')[0] || `Student ${userId.substring(0, 8)}`,
            enrollments: [],
            totalProgress: 0,
            lastActive: enrollment.last_accessed_at || enrollment.enrolled_at,
            joinDate: enrollment.enrolled_at
          });
        }
        const student = studentMap.get(userId);
        student.enrollments.push({
          courseId: enrollment.course_id,
          courseName: enrollment.courses?.title || 'Unknown Course',
          progress: enrollment.progress || 0,
          enrolledAt: enrollment.enrolled_at,
          completedAt: enrollment.completed_at
        });
        student.totalProgress += enrollment.progress || 0;
        if (enrollment.last_accessed_at && new Date(enrollment.last_accessed_at) > new Date(student.lastActive)) {
          student.lastActive = enrollment.last_accessed_at;
        }
      });

      const studentsArray = Array.from(studentMap.values()).map(s => ({
        ...s,
        avgProgress: s.enrollments.length > 0 ? Math.round(s.totalProgress / s.enrollments.length) : 0,
        coursesEnrolled: s.enrollments.length,
        status: new Date(s.lastActive) > new Date(Date.now() - 7*24*60*60*1000) ? 'active' : 'inactive'
      }));
      setStudents(studentsArray);

      // Calculate analytics
      const now = Date.now();
      const weekAgo = now - 7*24*60*60*1000;
      const monthAgo = now - 30*24*60*60*1000;
      
      const activeThisWeek = studentsArray.filter(s => new Date(s.lastActive) > new Date(weekAgo)).length;
      const newThisMonth = studentsArray.filter(s => new Date(s.joinDate) > new Date(monthAgo)).length;
      const totalProgress = studentsArray.reduce((sum, s) => sum + s.avgProgress, 0);
      const avgProgress = studentsArray.length > 0 ? Math.round(totalProgress / studentsArray.length) : 0;
      const completed = enrichedEnrollments.filter(e => e.completed_at).length || 0;
      const completionRate = enrichedEnrollments.length > 0 ? Math.round((completed / enrichedEnrollments.length) * 100) : 0;

      setAnalytics({
        totalStudents: studentsArray.length,
        activeThisWeek,
        newThisMonth,
        totalEnrollments: enrichedEnrollments.length,
        avgProgress,
        completionRate
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { name: 'Total Students', value: analytics.totalStudents, icon: UsersIcon, change: `+${analytics.newThisMonth}`, changeType: 'positive', color: 'blue' },
    { name: 'Active This Week', value: analytics.activeThisWeek, icon: Activity, change: `${Math.round((analytics.activeThisWeek/analytics.totalStudents)*100) || 0}%`, changeType: 'positive', color: 'green' },
    { name: 'Total Enrollments', value: analytics.totalEnrollments, icon: BookOpen, change: `${analytics.completionRate}% completed`, changeType: 'positive', color: 'purple' },
    { name: 'Avg Progress', value: `${analytics.avgProgress}%`, icon: TrendingUp, change: 'across all courses', changeType: 'neutral', color: 'orange' }
  ];

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users & Analytics</h2>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Download className="h-4 w-4" />
          <span>Export Data</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`h-12 w-12 ${colorClasses[stat.color]} rounded-lg flex items-center justify-center`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-600">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'students', name: 'Students', icon: UsersIcon, count: students.length },
            { id: 'enrollments', name: 'Enrollments', icon: BookOpen, count: enrollments.length },
            { id: 'account', name: 'Account', icon: Shield }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
              {tab.count !== undefined && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Website Analytics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">Websites</span>
                  <UsersIcon className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-900">{websites.length}</p>
                <p className="text-xs text-blue-700 mt-1">Active platforms</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-900">Courses</span>
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-purple-900">{courses.length}</p>
                <p className="text-xs text-purple-700 mt-1">{courses.reduce((sum, c) => sum + (c.course_sections?.length || 0), 0)} modules</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-900">Activities</span>
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-900">
                  {courses.reduce((sum, c) => sum + (c.course_sections?.reduce((s, sec) => s + (sec.course_activities?.length || 0), 0) || 0), 0)}
                </p>
                <p className="text-xs text-green-700 mt-1">Learning resources</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-orange-900">Revenue</span>
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-orange-900">₹0</p>
                <p className="text-xs text-orange-700 mt-1">Total earnings</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Students</h3>
              <div className="space-y-4">
                {students.length > 0 ? students.slice(0, 5).map((student) => (
                  <div key={student.id} className="flex items-center space-x-3 pb-3 border-b border-gray-100 last:border-0">
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">{student.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.coursesEnrolled} courses • {student.avgProgress}% progress</p>
                    </div>
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <UsersIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No students enrolled yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Courses */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Courses</h3>
              <div className="space-y-4">
                {courses.length > 0 ? courses.slice(0, 5).map((course, idx) => {
                  const courseEnrollments = enrollments.filter(e => e.course_id === course.id).length;
                  return (
                    <div key={course.id} className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center font-semibold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                        <p className="text-xs text-gray-500">{courseEnrollments} students</p>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No courses created yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{analytics.completionRate}%</p>
                <p className="text-sm text-gray-600 mt-1">Course Completion Rate</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{Math.round((analytics.activeThisWeek/analytics.totalStudents)*100) || 0}%</p>
                <p className="text-sm text-gray-600 mt-1">Weekly Active Users</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">{analytics.avgProgress}%</p>
                <p className="text-sm text-gray-600 mt-1">Average Progress</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students by name or email..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Courses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">{student.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(student.status)}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.coursesEnrolled}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 mr-2">{student.avgProgress}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${student.avgProgress}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(student.joinDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(student.lastActive).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button 
                          onClick={() => setSelectedUser(student)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Enrollments Tab */}
      {activeTab === 'enrollments' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{enrollment.profiles?.full_name || enrollment.profiles?.email?.split('@')[0] || 'Student'}</div>
                      <div className="text-sm text-gray-500">{enrollment.profiles?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{enrollment.courses?.title || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-2">{enrollment.progress || 0}%</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${enrollment.progress || 0}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${enrollment.completed_at ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {enrollment.completed_at ? 'Completed' : 'In Progress'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="max-w-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Account Overview</h3>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{user.email?.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{user.email?.split('@')[0]}</h4>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Websites Created</p>
                  <p className="text-2xl font-bold text-gray-900">{websites.length}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Enrollments</p>
                  <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Account created: {new Date(user.created_at || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Student Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{selectedUser.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{selectedUser.name}</h4>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedUser.coursesEnrolled}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedUser.avgProgress}%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{selectedUser.status}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Enrolled Courses</h4>
                <div className="space-y-2">
                  {selectedUser.enrollments.map((enrollment, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">{enrollment.courseName}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{enrollment.progress}%</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${enrollment.progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
