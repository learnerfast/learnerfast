import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Play, Award, BookOpen } from 'lucide-react';

const CoursePlayer = ({ course, sections, onClose, courseImage }) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

  const totalActivities = sections.reduce((total, section) => total + section.activities.length, 0);
  const completedActivities = sections.reduce((total, section) => 
    total + section.activities.filter(activity => activity.completed).length, 0
  );
  const progressPercentage = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

  const allActivities = sections.flatMap(s => s.activities.map(a => ({ ...a, sectionTitle: s.title })));
  
  useEffect(() => {
    if (sections[0]?.activities?.length > 0) {
      setExpandedSections({ [sections[0].id]: true });
      setSelectedActivity(sections[0].activities[0]);
      setCurrentActivityIndex(0);
    }
  }, [sections]);

  const handleNext = () => {
    if (currentActivityIndex < allActivities.length - 1) {
      const nextActivity = allActivities[currentActivityIndex + 1];
      setSelectedActivity(nextActivity);
      setCurrentActivityIndex(currentActivityIndex + 1);
    }
  };
  
  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    const index = allActivities.findIndex(a => a.id === activity.id);
    setCurrentActivityIndex(index);
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <img src={courseImage || '/learnerfast-logo.png'} alt="Logo" className="h-12 w-12 rounded-lg object-cover" />
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{course?.title}</h2>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>{progressPercentage}% COMPLETE</span>
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="border-b border-gray-100">
              <button 
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-semibold">
                    {sectionIndex + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{section.title}</span>
                </div>
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections[section.id] ? 'rotate-90' : ''}`} />
              </button>
              {expandedSections[section.id] && section.activities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => handleActivityClick(activity)}
                  className={`px-6 py-3 pl-16 flex items-center justify-between cursor-pointer transition-colors ${
                    selectedActivity?.id === activity.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {activity.completed ? (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                    )}
                    <span className="text-sm text-gray-700">{activity.title}</span>
                  </div>
                  {activity.type === 'video' && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Play className="w-3 h-3" />
                      <span>10 min</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <h1 className="text-xl font-semibold text-amber-600">{course?.title}</h1>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ padding: '2rem' }}>
          {selectedActivity ? (
            <div className="w-full h-full">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedActivity.title}</h2>
                  <p className="text-gray-600">
                    {allActivities.find(a => a.id === selectedActivity.id)?.sectionTitle} • 
                    {selectedActivity.type === 'video' ? 'Video Lesson (10 Min)' :
                     selectedActivity.type === 'pdf' ? 'PDF Document' :
                     selectedActivity.type === 'audio' ? 'Audio Lesson' :
                     selectedActivity.type === 'presentation' ? 'Presentation' : 'Content'}
                  </p>
                </div>
                <button 
                  onClick={handleNext}
                  disabled={currentActivityIndex >= allActivities.length - 1}
                  className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{currentActivityIndex >= allActivities.length - 1 ? 'Complete' : 'Next'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-black rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 280px)', width: '100%' }}>
                {selectedActivity.type === 'video' ? (
                  selectedActivity.file ? (
                    <video controls className="w-full h-full" key={selectedActivity.id}>
                      <source src={URL.createObjectURL(selectedActivity.file)} type={selectedActivity.file.type} />
                    </video>
                  ) : selectedActivity.url ? (
                    <iframe 
                      src={selectedActivity.url.includes('embed') ? selectedActivity.url : selectedActivity.url.replace('watch?v=', 'embed/')}
                      className="w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                      title={selectedActivity.title}
                    />
                  ) : null
                ) : selectedActivity.type === 'pdf' ? (
                  <div className="bg-white w-full h-full">
                    <iframe 
                      src={selectedActivity.file ? URL.createObjectURL(selectedActivity.file) : selectedActivity.url} 
                      className="w-full h-full" 
                      title={selectedActivity.title}
                      frameBorder="0"
                    />
                  </div>
                ) : selectedActivity.type === 'presentation' ? (
                  <div className="bg-white w-full h-full">
                    <iframe 
                      src={selectedActivity.file ? URL.createObjectURL(selectedActivity.file) : selectedActivity.url} 
                      className="w-full h-full" 
                      title={selectedActivity.title}
                      frameBorder="0"
                    />
                  </div>
                ) : selectedActivity.type === 'audio' ? (
                  <div className="flex items-center justify-center h-full bg-gray-900">
                    <audio controls className="w-full max-w-2xl">
                      {selectedActivity.file ? (
                        <source src={URL.createObjectURL(selectedActivity.file)} type={selectedActivity.file.type} />
                      ) : selectedActivity.url ? (
                        <source src={selectedActivity.url} />
                      ) : null}
                    </audio>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <p className="text-gray-500">Content type: {selectedActivity.type}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-16">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Select a lesson to start learning</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
