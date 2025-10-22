'use client';
import { useState, useEffect } from 'react';
import { supabaseAdmin } from '../../lib/supabase';
import { Send, Mail, Users, MessageSquare, Download, FileText, Clock, CheckCircle } from 'lucide-react';

const Communication = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipients, setSelectedRecipients] = useState('all');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const templates = [
    { id: 'update', name: 'Platform Update', subject: 'New Features Available', message: 'Hello,\n\nWe\'ve just released exciting new features on LearnerFast.\n\nCheck out what\'s new in your dashboard.\n\nBest regards,\nLearnerFast Team' },
    { id: 'congratulations', name: 'Congratulations', subject: 'Congratulations on Your Achievement!', message: 'Dear User,\n\nCongratulations! You\'ve successfully published your first course.\n\nKeep up the great work and continue creating amazing content.\n\nBest regards,\nLearnerFast Team' },
    { id: 'newsletter', name: 'Newsletter', subject: 'LearnerFast Monthly Newsletter', message: 'Hello,\n\nHere\'s what\'s new this month at LearnerFast:\n\n- New features and improvements\n- Success stories from our community\n- Tips and best practices\n\nStay tuned for more updates!\n\nBest regards,\nLearnerFast Team' },
    { id: 'feedback', name: 'Feedback Request', subject: 'We Value Your Feedback', message: 'Hi there,\n\nWe\'d love to hear your thoughts about LearnerFast.\n\nYour feedback helps us improve and serve you better.\n\nPlease take a moment to share your experience with us.\n\nBest regards,\nLearnerFast Team' },
    { id: 'tips', name: 'Tips & Tricks', subject: 'Pro Tips for Your Courses', message: 'Hello,\n\nHere are some tips to make your courses more engaging:\n\n- Use clear and concise titles\n- Add multimedia content\n- Organize lessons logically\n- Engage with your students\n\nBest regards,\nLearnerFast Team' },
    { id: 'maintenance', name: 'Maintenance Notice', subject: 'Scheduled Maintenance Notice', message: 'Dear User,\n\nWe will be performing scheduled maintenance on [DATE] at [TIME].\n\nThe platform may be temporarily unavailable during this time.\n\nWe apologize for any inconvenience.\n\nBest regards,\nLearnerFast Team' },
  ];

  const applyTemplate = (template) => {
    setSubject(template.subject);
    setMessage(template.message);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers();
      setUsers(authUsers || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecipientEmails = () => {
    if (selectedRecipients === 'all') {
      return users.map(u => u.email);
    } else if (selectedRecipients === 'verified') {
      return users.filter(u => u.email_confirmed_at).map(u => u.email);
    } else if (selectedRecipients === 'active') {
      const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > last7Days).map(u => u.email);
    }
    return [];
  };

  const handleSend = async () => {
    const emails = getRecipientEmails();
    if (!subject || !message || emails.length === 0) {
      alert('Please fill in all fields');
      return;
    }
    
    setSending(true);
    try {
      const { Resend } = await import('resend');
      const resend = new Resend('re_UY26SPxu_AksCHZNB8kJmyGEJT8HHZ1JS');
      
      await resend.emails.send({
        from: 'LearnerFast <onboarding@resend.dev>',
        to: emails,
        subject: subject,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px;"><p style="white-space: pre-wrap;">${message}</p><br/><p style="color: #666; font-size: 12px;">Best regards,<br/>LearnerFast Team</p></div>`,
      });
      
      alert(`Email sent successfully to ${emails.length} recipients!`);
      setSubject('');
      setMessage('');
    } catch (error) {
      alert('Failed to send email: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const exportEmails = () => {
    const emails = getRecipientEmails();
    const csv = ['Email'].concat(emails).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emails-${selectedRecipients}-${new Date().toISOString()}.csv`;
    a.click();
  };

  const recipientCount = getRecipientEmails().length;

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Communication Center</h2>
        <p className="text-gray-600 mt-1">Compose and send emails to your users</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Verified Users</p>
              <p className="text-2xl font-bold text-green-600">{users.filter(u => u.email_confirmed_at).length}</p>
            </div>
            <Mail className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active (7d)</p>
              <p className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Compose Message
          </h3>
          <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Recipients</label>
            <select
              value={selectedRecipients}
              onChange={(e) => setSelectedRecipients(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="all">All Users ({users.length})</option>
              <option value="verified">Verified Users ({users.filter(u => u.email_confirmed_at).length})</option>
              <option value="active">Active Users - Last 7 Days ({users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length})</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message"
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              Will send to <span className="font-semibold text-blue-600 text-lg">{recipientCount}</span> recipients
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
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
              >
                <Download className="h-4 w-4" /> Export
              </button>
              <button
                onClick={handleSend}
                disabled={!subject || !message || recipientCount === 0 || sending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
              >
                <Send className="h-4 w-4" /> {sending ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-6">
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
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
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
              <span>Target specific user groups</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

      {showPreview && subject && message && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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

      <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
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
