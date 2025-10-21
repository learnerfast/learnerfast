import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Mail, MoreHorizontal, UserPlus, Shield, Crown, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const Users = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [realUsers, setRealUsers] = useState({ students: [], instructors: [], admins: [] });
  const [analytics, setAnalytics] = useState({ totalEvents: 0, recentRegistrations: 0, activeUsers: 0 });
  const { user } = useAuth();

  useEffect(() => {
    const loadRealUsers = async () => {
      if (!user) return;
      
      try {
        // Load website users from database
        const { data: websiteUsers } = await supabase
          .from('website_users')
          .select('*')
          .order('created_at', { ascending: false });
        
        // Load analytics data
        const { data: analyticsData } = await supabase
          .from('user_analytics')
          .select('*')
          .order('created_at', { ascending: false });
        
        const students = websiteUsers?.filter(u => u.role === 'student') || [];
        const instructors = websiteUsers?.filter(u => u.role === 'instructor') || [];
        
        // Calculate analytics
        const recentRegistrations = analyticsData?.filter(a => 
          a.event_type === 'registration' && 
          new Date(a.created_at) > new Date(Date.now() - 30*24*60*60*1000)
        ).length || 0;
        
        const activeUsers = analyticsData?.filter(a => 
          a.event_type === 'login' && 
          new Date(a.created_at) > new Date(Date.now() - 7*24*60*60*1000)
        ).length || 0;
        
        setAnalytics({
          totalEvents: analyticsData?.length || 0,
          recentRegistrations,
          activeUsers
        });
        
        setRealUsers({
          students: students.map(student => ({
            id: student.id,
            name: student.name || student.email.split('@')[0],
            email: student.email,
            avatar: `/api/placeholder/40/40`,
            status: student.status || 'active',
            courses: student.enrolled_courses || 0,
            progress: student.progress || 0,
            joinDate: new Date(student.created_at),
            lastActive: new Date(student.last_login || student.created_at),
            website: student.website_name
          })),
          instructors: instructors.map(instructor => ({
            id: instructor.id,
            name: instructor.name || instructor.email.split('@')[0],
            email: instructor.email,
            avatar: `/api/placeholder/40/40`,
            status: instructor.status || 'active',
            courses: instructor.created_courses || 0,
            students: instructor.total_students || 0,
            rating: instructor.rating || 4.5,
            joinDate: new Date(instructor.created_at),
            website: instructor.website_name
          })),
          admins: [{
            id: 1,
            name: user.email?.split('@')[0] || 'Admin User',
            email: user.email || 'admin@example.com',
            avatar: `/api/placeholder/40/40`,
            role: 'Super Admin',
            permissions: ['Users', 'Courses', 'Analytics', 'Settings'],
            lastActive: new Date()
          }]
        });
      } catch (error) {
      }
    };
    
    loadRealUsers();
  }, [user]);

  const students = realUsers.students;
  const instructors = realUsers.instructors;
  const admins = realUsers.admins;

  const stats = [
    { name: 'Total Students', value: students.length.toString(), icon: UserPlus, change: '+12%', changeType: 'positive' },
    { name: 'Active Instructors', value: instructors.length.toString(), icon: Shield, change: '+3', changeType: 'positive' },
    { name: 'New Registrations', value: analytics.recentRegistrations.toString(), icon: Crown, change: '+15%', changeType: 'positive' },
    { name: 'Active Users', value: analytics.activeUsers.toString(), icon: Activity, change: '+5%', changeType: 'positive' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users</h2>
          <p className="text-gray-600">Manage students, instructors, and administrators</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm font-medium text-green-600">{stat.change}</span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-2">
            <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              <Mail className="h-4 w-4" />
              <span>Send Email</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'students', name: 'Students', count: students.length },
            { id: 'instructors', name: 'Instructors', count: instructors.length },
            { id: 'admins', name: 'Administrators', count: admins.length }
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
              <span>{tab.name}</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img className="h-10 w-10 rounded-full" src={student.avatar} alt={student.name} />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                          {student.website && <div className="text-xs text-blue-600">via {student.website}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(student.status)}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.courses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{student.progress}%</div>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.joinDate.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.lastActive.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
      )}

      {/* Instructors Tab */}
      {activeTab === 'instructors' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {instructors.map((instructor) => (
                  <tr key={instructor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img className="h-10 w-10 rounded-full" src={instructor.avatar} alt={instructor.name} />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{instructor.name}</div>
                          <div className="text-sm text-gray-500">{instructor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(instructor.status)}`}>
                        {instructor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {instructor.courses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {instructor.students.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ⭐ {instructor.rating}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {instructor.joinDate.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
      )}

      {/* Admins Tab */}
      {activeTab === 'admins' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {admins.map((admin) => (
            <div key={admin.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <img className="h-12 w-12 rounded-full" src={admin.avatar} alt={admin.name} />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{admin.name}</h3>
                  <p className="text-sm text-gray-500">{admin.email}</p>
                  <span className="inline-block mt-1 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                    {admin.role}
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Permissions</h4>
                <div className="flex flex-wrap gap-1">
                  {admin.permissions.map((permission) => (
                    <span
                      key={permission}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Last active: {admin.lastActive.toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Users;
