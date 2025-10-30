import React, { useState } from 'react';
import { Plus, Send, Users, MessageSquare, Mail, Bell, Calendar, Filter, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
// Mock data generator
const faker = {
  person: {
    fullName: () => ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown'][Math.floor(Math.random() * 5)]
  },
  internet: {
    email: () => ['user@example.com', 'student@test.com', 'instructor@demo.com'][Math.floor(Math.random() * 3)]
  },
  image: {
    avatar: () => `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 200000000000)}?w=40&h=40&fit=crop&crop=face`
  },
  lorem: {
    sentence: () => ['Welcome to our course platform', 'Learn new skills today', 'Join thousands of students'][Math.floor(Math.random() * 3)],
    paragraph: () => 'This is a sample message content that would appear in the communication system.',
    paragraphs: () => 'This is sample content for announcements and communications.',
    words: (n) => ['sample', 'content', 'text'][Math.floor(Math.random() * 3)]
  },
  date: {
    recent: () => new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    past: () => new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
  },
  datatype: {
    boolean: () => Math.random() > 0.5
  },
  number: {
    int: (opts) => Math.floor(Math.random() * (opts.max - opts.min + 1)) + opts.min
  },
  helpers: {
    arrayElement: (arr) => arr[Math.floor(Math.random() * arr.length)],
    arrayElements: (arr, opts) => {
      const count = Math.floor(Math.random() * (opts.max - opts.min + 1)) + opts.min;
      return arr.slice(0, count);
    }
  }
};

const Communication = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [newMessage, setNewMessage] = useState({ recipient: '', subject: '', content: '' });
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [websiteUsers, setWebsiteUsers] = useState([]);
  const [realMessages, setRealMessages] = useState([]);
  const { user } = useAuth();

  React.useEffect(() => {
    const loadWebsiteUsers = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('website_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      setWebsiteUsers(data || []);
    };
    
    const loadMessages = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('user_messages')
        .select('*')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });
      
      setRealMessages(data || []);
    };
    
    loadWebsiteUsers();
    loadMessages();
  }, [user]);

  const handleSendMessage = async () => {
    if (!newMessage.recipient || !newMessage.subject || !newMessage.content) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (!user?.id) {
      toast.error('Please log in to send messages');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('user_messages')
        .insert({
          sender_id: user.id,
          recipient_email: newMessage.recipient,
          subject: newMessage.subject,
          content: newMessage.content
        });
      
      if (error) throw error;
      
      toast.success('Message sent successfully!');
      setNewMessage({ recipient: '', subject: '', content: '' });
      setShowNewMessageModal(false);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const messages = realMessages.length > 0 ? realMessages.map(msg => ({
    id: msg.id,
    sender: msg.recipient_email,
    subject: msg.subject,
    content: msg.content,
    timestamp: new Date(msg.created_at),
    read: true,
    avatar: `/api/placeholder/40/40`
  })) : Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    sender: faker.person.fullName(),
    subject: faker.lorem.sentence(),
    content: faker.lorem.paragraph(),
    timestamp: faker.date.recent(),
    read: faker.datatype.boolean(),
    avatar: faker.image.avatar()
  }));

  const announcements = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(2),
    date: faker.date.recent(),
    recipients: faker.number.int({ min: 50, max: 500 }),
    status: faker.helpers.arrayElement(['published', 'draft', 'scheduled'])
  }));

  const emailCampaigns = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: faker.lorem.words(3),
    subject: faker.lorem.sentence(),
    sent: faker.number.int({ min: 100, max: 1000 }),
    opens: faker.number.int({ min: 50, max: 800 }),
    clicks: faker.number.int({ min: 10, max: 200 }),
    date: faker.date.recent(),
    status: faker.helpers.arrayElement(['sent', 'draft', 'scheduled'])
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Communication</h2>
          <p className="text-gray-600">Manage student communication and announcements</p>
        </div>
        <button 
          onClick={() => setShowNewMessageModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Message</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'messages', name: 'Messages', icon: MessageSquare },
            { id: 'announcements', name: 'Announcements', icon: Bell },
            { id: 'emails', name: 'Email Campaigns', icon: Mail },
            { id: 'schedule', name: 'Scheduled', icon: Calendar }
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
            </button>
          ))}
        </nav>
      </div>

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {messages.map((message) => (
                <div key={message.id} className={`p-4 hover:bg-gray-50 cursor-pointer ${!message.read ? 'bg-blue-50' : ''}`}>
                  <div className="flex items-start space-x-3">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={message.avatar}
                      alt={message.sender}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${!message.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {message.sender}
                        </p>
                        <p className="text-xs text-gray-500">
                          {message.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                      <p className={`text-sm ${!message.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                        {message.subject}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {message.content}
                      </p>
                    </div>
                    {!message.read && (
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      announcement.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : announcement.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {announcement.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    {announcement.date.toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{announcement.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{announcement.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>{announcement.recipients} recipients</span>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email Campaigns Tab */}
      {activeTab === 'emails' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {emailCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-500">{campaign.subject}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          campaign.status === 'sent'
                            ? 'bg-green-100 text-green-800'
                            : campaign.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.sent.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.opens.toLocaleString()} ({((campaign.opens / campaign.sent) * 100).toFixed(1)}%)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.clicks.toLocaleString()} ({((campaign.clicks / campaign.sent) * 100).toFixed(1)}%)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.date.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scheduled Tab */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Scheduled Communications</h3>
          <p className="text-gray-500 mb-4">Schedule messages, announcements, and email campaigns for future delivery.</p>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Schedule Communication
          </button>
        </div>
      )}

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">New Message</h3>
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Recipient</label>
                {websiteUsers.length > 0 ? (
                  <select
                    value={newMessage.recipient}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, recipient: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a student</option>
                    {websiteUsers.map(u => (
                      <option key={u.id} value={u.email}>{u.email} ({u.website_name})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="email"
                    value={newMessage.recipient}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, recipient: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="No students yet"
                    disabled
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter subject"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 h-24"
                  placeholder="Enter your message"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communication;
