import React, { useState } from 'react';
import { HelpCircle, X, MessageCircle, Book, Video, Mail } from 'lucide-react';

const HelpButton = () => {
  const [showHelpModal, setShowHelpModal] = useState(false);

  const helpOptions = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      action: () => {
        // Implement live chat functionality
      }
    },
    {
      icon: Book,
      title: 'Documentation',
      description: 'Browse our comprehensive guides',
      action: () => {
        window.open('https://docs.example.com', '_blank');
      }
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Watch step-by-step tutorials',
      action: () => {
        window.open('https://tutorials.example.com', '_blank');
      }
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us a detailed message',
      action: () => {
        window.location.href = 'mailto:support@example.com';
      }
    }
  ];

  return (
    <>
      <button
        onClick={() => setShowHelpModal(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-teal-600 text-white rounded-full shadow-lg hover:bg-teal-700 transition-colors flex items-center justify-center z-40 group"
      >
        <HelpCircle className="h-5 w-5" />
        <span className="sr-only">Ask for help</span>
        
        {/* Tooltip */}
        <div className="absolute right-full mr-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Ask for help
        </div>
      </button>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">How can we help?</h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {helpOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      option.action();
                      setShowHelpModal(false);
                    }}
                    className="w-full flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{option.title}</h4>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Need immediate assistance? Our support team is available 24/7
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpButton;