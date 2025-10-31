import React, { useState, useEffect } from 'react';
import { Plus, Send, Users, MessageSquare, Mail, Bell, Calendar, Filter, X, Download, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const Communication = () => {
  const [activeTab, setActiveTab] = useState('compose');
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState('all');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { user } = useAuth();

  const templates = [
    { id: 'welcome', name: 'Welcome Message', subject: 'Welcome to Our Course!', message: 'Hello,\n\nWelcome to our learning platform! We\'re excited to have you here.\n\nGet started by exploring your enrolled courses.\n\nBest regards,\nYour Instructor' },
    { id: 'update', name: 'Course Update', subject: 'New Content Available', message: 'Hi there,\n\nWe\'ve just added new lessons to your course.\n\nCheck out the latest content in your dashboard.\n\nBest regards,\nYour Instructor' },
    { id: 'congratulations', name: 'Congratulations', subject: 'Congratulations on Your Progress!', message: 'Dear Student,\n\nCongratulations on completing another milestone!\n\nKeep up the great work.\n\nBest regards,\nYour Instructor' },
    { id: 'reminder', name: 'Course Reminder', subject: 'Continue Your Learning Journey', message: 'Hello,\n\nWe noticed you haven\'t visited your course in a while.\n\nCome back and continue where you left off!\n\nBest regards,\nYour Instructor' },
    { id: 'feedback', name: 'Feedback Request', subject: 'We Value Your Feedback', message: 'Hi,\n\nWe\'d love to hear your thoughts about the course.\n\nYour feedback helps us improve.\n\nBest regards,\nYour Instructor' },
  ];

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id')
        .eq('user_id', user.id);

      const courseIds = (coursesData || []).map(c => c.id);
      
      if (courseIds.length > 0) {
        const { data: enrollmentsData } = await supabase
          .from('enrollments')
          .select('*')
          .in('course_id', courseIds);
        
        setEnrollments(enrollmentsData || []);

        const userIds = [...new Set((enrollmentsData || []).map(e => e.user_id))];
        
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .in('id', userIds);
          
          const studentsArray = (profilesData || []).map(profile => {
            const userEnrollments = enrollmentsData.filter(e => e.user_id === profile.id);
            const lastActive = userEnrollments.reduce((latest, e) => {
              const date = new Date(e.last_accessed_at || e.enrolled_at);
              return date > latest ? date : latest;
            }, new Date(0));
            
            return {
              id: profile.id,
              email: profile.email,
              name: profile.full_name || profile.email?.split('@')[0] || 'Student',
              enrollments: userEnrollments.length,
              lastActive,
              isActive: lastActive > new Date(Date.now() - 7*24*60*60*1000)
            };
          });
          
          setStudents(studentsArray);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const applyTemplate = (template) => {
    setSubject(template.subject);
    setMessage(template.message);
  };

  const getRecipientEmails = () => {
    if (selectedRecipients === 'all') {
      return students.map(s => s.email);
    } else if (selectedRecipients === 'active') {
      return students.filter(s => s.isActive).map(s => s.email);
    } else if (selectedRecipients === 'inactive') {
      return students.filter(s => !s.isActive).map(s => s.email);
    }
    return [];
  };

  const handleSend = () => {
    const emails = getRecipientEmails();
    if (!subject || !message || emails.length === 0) {
      toast.error('Please fill in all fields and select recipients');
      return;
    }
    
    const mailtoLink = `mailto:?bcc=${emails.join(',')}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailtoLink;
    toast.success(`Opening email client for ${emails.length} recipients`);
  };

  const exportEmails = () => {
    const emails = getRecipientEmails();
    const csv = ['Email', 'Name', 'Enrollments', 'Last Active'].concat(
      students.filter(s => emails.includes(s.email)).map(s => 
        `${s.email},${s.name},${s.enrollments},${s.lastActive.toLocaleDateString()}`
      )
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-${selectedRecipients}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Emails exported successfully');
  };

  const recipientCount = getRecipientEmails().length;
  const activeCount = students.filter(s => s.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Communication</h2>
          <p className="text-gray-600">Send emails to your students</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active (7d)</p>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Enrollments</p>
              <p className="text-2xl font-bold text-purple-600">{enrollments.length}</p>
            </div>
            <Mail className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Section */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Compose Email
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
              <select
                value={selectedRecipients}
                onChange={(e) => setSelectedRecipients(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Students ({students.length})</option>
                <option value="active">Active Students - Last 7 Days ({activeCount})</option>
                <option value="inactive">Inactive Students ({students.length - activeCount})</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message"
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-600">
                Will send to <span className="font-semibold text-primary-600 text-lg">{recipientCount}</span> recipients
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" /> {showPreview ? 'Hide' : 'Preview'}
                </button>
                <button
                  onClick={exportEmails}
                  disabled={recipientCount === 0}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" /> Export
                </button>
                <button
                  onClick={handleSend}
                  disabled={!subject || !message || recipientCount === 0}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
                >
                  <Send className="h-4 w-4" /> Send Email
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Templates & Tips */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Email Templates
            </h3>
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 transition-colors"
                >
                  <p className="font-semibold text-gray-900 text-sm">{template.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{template.subject}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Quick Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Use templates to save time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Preview before sending</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Export emails for external tools</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Target specific student groups</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview */}
      {showPreview && subject && message && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Email Preview
          </h3>
          <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
            <div className="mb-4 pb-4 border-b border-gray-300">
              <p className="text-sm text-gray-600 mb-1">Subject:</p>
              <p className="font-semibold text-gray-900 text-lg">{subject}</p>
            </div>
            <div className="mb-4 pb-4 border-b border-gray-300">
              <p className="text-sm text-gray-600 mb-1">To:</p>
              <p className="text-gray-700">{recipientCount} recipients ({selectedRecipients})</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Message:</p>
              <div className="whitespace-pre-wrap text-gray-800 bg-white p-4 rounded border border-gray-200">{message}</div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">How it works</p>
            <p className="text-sm text-blue-800">
              Clicking "Send Email" will open your default email client with all recipients in BCC. You can review and send from there.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communication;
