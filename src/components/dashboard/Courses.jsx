import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { Plus, Play, Users, Clock, Video, Upload, BookOpen, Edit, Trash2 } from 'lucide-react';
import AddCourseModal from '../modals/AddCourseModal';
import CourseBuilder from './CourseBuilder';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { validateVideoUrl, generateEmbedUrl, getVideoTypeFromUrl } from '../../utils/videoUtils';

// Create context for course builder state
const CourseBuilderContext = createContext();

export const useCourseBuilder = () => {
  const context = useContext(CourseBuilderContext);
  if (!context) {
    throw new Error('useCourseBuilder must be used within a CourseBuilderProvider');
  }
  return context;
};

const initialCourses = [
  {
    id: 1,
    title: 'Complete Web Development Bootcamp',
    description: 'Master HTML, CSS, JavaScript, React, Node.js, and deploy full-stack applications.',
    students: 12450,
    duration: '12 weeks',
    status: 'published',
    level: 'Beginner',
    price: '$299',
    rating: '4.8 (2,340 reviews)',
    category: 'Development'
  },
  {
    id: 2,
    title: 'Data Science with Python',
    description: 'Learn Python, pandas, numpy, matplotlib, and machine learning fundamentals.',
    students: 8920,
    duration: '10 weeks',
    status: 'published',
    level: 'Intermediate',
    price: '$249',
    rating: '4.7 (1,890 reviews)',
    category: 'Data Science'
  },
  {
    id: 3,
    title: 'UX/UI Design Masterclass',
    description: 'Create stunning user experiences with design thinking and modern tools.',
    students: 15670,
    duration: '8 weeks',
    status: 'published',
    level: 'Beginner',
    price: '$199',
    rating: '4.9 (3,120 reviews)',
    category: 'Design'
  },
  {
    id: 4,
    title: 'Digital Marketing Strategy',
    description: 'Build comprehensive marketing campaigns across all digital channels.',
    students: 7890,
    duration: '6 weeks',
    status: 'published',
    level: 'Beginner',
    price: '$179',
    rating: '4.6 (1,560 reviews)',
    category: 'Business'
  },
  {
    id: 5,
    title: 'React Native Development',
    description: 'Build cross-platform mobile apps with React Native and JavaScript.',
    students: 4560,
    duration: '14 weeks',
    status: 'published',
    level: 'Advanced',
    price: '$349',
    rating: '4.8 (980 reviews)',
    category: 'Development'
  },
  {
    id: 6,
    title: 'Machine Learning & AI',
    description: 'Deep dive into machine learning algorithms and artificial intelligence.',
    students: 6780,
    duration: '16 weeks',
    status: 'published',
    level: 'Advanced',
    price: '$399',
    rating: '4.9 (1,240 reviews)',
    category: 'Data Science'
  }
];

// Course Builder Provider Component
export const CourseBuilderProvider = ({ children }) => {
  const [editingCourse, setEditingCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('course-outline');

  const startEditing = useCallback((course) => {
    setEditingCourse(course);
    setActiveTab('course-outline');
  }, []);

  const stopEditing = useCallback(() => {
    setEditingCourse(null);
    setActiveTab('course-outline');
  }, []);

  const value = {
    editingCourse,
    activeTab,
    setActiveTab,
    startEditing,
    stopEditing
  };

  return (
    <CourseBuilderContext.Provider value={value}>
      {children}
    </CourseBuilderContext.Provider>
  );
};

const Courses = React.memo(() => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoCount, setVideoCount] = useState({});
  const [videoModal, setVideoModal] = useState({ isOpen: false, courseId: null });
  const [videoType, setVideoType] = useState('vimeo');
  const [videoData, setVideoData] = useState({ title: '', url: '', script: '' });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseVideos, setCourseVideos] = useState([]);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, course: null });
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  
  const courseBuilder = useCourseBuilder();

  const loadCourses = async () => {
    if (user) {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_settings(course_image)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        console.log('Loaded courses with settings:', data);
        setCourses(data);
      } else {
        console.error('Error loading courses:', error);
      }
    }
  };

  useEffect(() => {
    loadCourses();
  }, [user]);

  useEffect(() => {
    // Update video counts on client side (user-specific)
    const counts = {};
    const userPrefix = user?.id || 'guest';
    courses.forEach(course => {
      if (typeof window !== 'undefined') {
        counts[course.id] = JSON.parse(localStorage.getItem(`user-${userPrefix}-course-${course.id}-videos`) || '[]').length;
      }
    });
    setVideoCount(counts);
  }, [courses, user]);

  const [createdCourse, setCreatedCourse] = useState(null);

  const handleAddCourse = useCallback(async (newCourseData) => {
    if (user) {
      const { data, error } = await supabase
        .from('courses')
        .insert([{
          user_id: user.id,
          title: newCourseData.title,
          description: newCourseData.description,
          status: newCourseData.status || 'draft'
        }])
        .select()
        .single();
      
      if (!error && data) {
        // Save course image if provided
        if (newCourseData.coverImage) {
          const reader = new FileReader();
          const imageData = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(newCourseData.coverImage);
          });
          
          await supabase
            .from('course_settings')
            .insert({
              course_id: data.id,
              course_image: imageData
            });
        }
        
        setCourses(prev => [data, ...prev]);
        loadCourses(); // Reload to get updated data with images
        setCreatedCourse(data);
        toast.success('Course created successfully!');
        return data;
      } else {
        console.error('Course creation error:', error);
        toast.error('Failed to create course');
      }
    }
    setIsModalOpen(false);
  }, [user]);

  const handleUploadVideo = useCallback((courseId) => {
    setVideoModal({ isOpen: true, courseId });
    setVideoData({ title: '', url: '', script: '' });
  }, []);

  const handleCourseClick = useCallback(async (course) => {
    if (user) {
      const { data, error } = await supabase
        .from('course_videos')
        .select('*')
        .eq('course_id', course.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setCourseVideos(data.map(v => ({
          id: v.id,
          title: v.title,
          type: v.video_type,
          embedUrl: v.embed_url,
          addedAt: v.created_at
        })));
      }
    }
    setSelectedCourse(course);
  }, [user]);

  const handleEditCourse = useCallback((course, e) => {
    e.stopPropagation();
    courseBuilder.startEditing(course);
  }, [courseBuilder]);

  const handleDeleteCourse = useCallback((course, e) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, course });
    setDeleteConfirmed(false);
  }, []);

  const confirmDeleteCourse = useCallback(async () => {
    const course = deleteModal.course;
    if (!course) return;
    
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', course.id)
      .eq('user_id', user.id);
    
    if (!error) {
      setCourses(prev => prev.filter(c => c.id !== course.id));
      toast.success('Course deleted successfully');
    } else {
      toast.error('Failed to delete course');
    }
    
    setDeleteModal({ isOpen: false, course: null });
    setDeleteConfirmed(false);
  }, [deleteModal.course, user]);

  const addVideoToCourse = useCallback(async () => {
    if (!videoData.title.trim()) {
      toast.error('Please enter a video title');
      return;
    }

    const userPrefix = user?.id || 'guest';
    const storageKey = `user-${userPrefix}-course-${videoModal.courseId}-videos`;
    const existingVideos = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    let newVideo = {
      id: Date.now(),
      title: videoData.title,
      type: videoType,
      addedAt: new Date().toISOString()
    };

    try {
      if (videoType === 'script') {
        if (!videoData.script.trim()) {
          toast.error('Please enter embed script');
          return;
        }
        newVideo.embedUrl = videoData.script;
      } else {
        if (!videoData.url.trim()) {
          toast.error('Please enter video URL');
          return;
        }
        
        const validation = validateVideoUrl(videoData.url, videoType);
        if (!validation.valid) {
          toast.error(validation.error);
          return;
        }
        
        newVideo.embedUrl = generateEmbedUrl(videoData.url, videoType);
      }
    } catch (error) {
      console.error('Video processing error:', error);
      toast.error(error.message || 'Failed to process video URL');
      return;
    }

    if (user) {
      const course = courses.find(c => c.id === videoModal.courseId);
      if (!course) {
        toast.error('Course not found');
        return;
      }
      
      const { error } = await supabase
        .from('course_videos')
        .insert([{
          user_id: user.id,
          course_id: course.id,
          title: newVideo.title,
          video_type: newVideo.type,
          embed_url: newVideo.embedUrl
        }]);
      
      if (!error) {
        existingVideos.push(newVideo);
        localStorage.setItem(storageKey, JSON.stringify(existingVideos));
        setVideoCount(prev => ({ ...prev, [videoModal.courseId]: existingVideos.length }));
        toast.success('Video added successfully!');
      } else {
        toast.error('Failed to add video');
      }
    }
    setVideoModal({ isOpen: false, courseId: null });
  }, [videoData, videoType, videoModal.courseId, user]);

  if (courseBuilder.editingCourse) {
    return (
      <CourseBuilder 
        course={courseBuilder.editingCourse} 
        onBack={() => {
          courseBuilder.stopEditing();
          loadCourses(); // Reload courses to show updated images
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Courses & Programs</h2>
          <p className="text-gray-600">Manage your educational content</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Course</span>
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
          <div className="flex justify-center items-center mx-auto w-20 h-20 bg-primary-100 rounded-full mb-6">
            <BookOpen className="h-10 w-10 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create your first course to start building your educational content and engaging with students.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Create Your First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
          <div key={course.id} onClick={() => handleCourseClick(course)} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
              {course.course_settings?.course_image ? (
                <img
                  src={course.course_settings.course_image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-primary-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <button className="bg-white bg-opacity-90 rounded-full p-3 hover:bg-opacity-100 transition-all">
                  <Play className="h-6 w-6 text-gray-900" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    course.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {course.status}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(course.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-4 h-10 line-clamp-2">{course.description || 'No description provided'}</p>
              
              <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Video className="h-4 w-4 text-primary-600" />
                  <span>{videoCount[course.id] || 0} videos</span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={(e) => handleEditCourse(course, e)}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-teal-100 text-teal-700 rounded hover:bg-teal-200"
                  >
                    <Edit className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadVideo(course.id);
                    }}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    <Upload className="h-3 w-3" />
                    <span>Upload</span>
                  </button>
                  <button 
                    onClick={(e) => handleDeleteCourse(course, e)}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          ))}
        </div>
      )}

      <AddCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddCourse={handleAddCourse}
        onCourseCreated={(course) => {
          courseBuilder.startEditing(course);
        }}
      />

      {/* Course Videos Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedCourse.title} - Videos</h3>
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              {courseVideos.length === 0 ? (
                <div className="text-center py-8">
                  <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No videos uploaded yet</p>
                  <button
                    onClick={() => {
                      setSelectedCourse(null);
                      handleUploadVideo(selectedCourse.id);
                    }}
                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Upload First Video
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {courseVideos.map((video) => (
                    <div key={video.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Video className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{video.title}</h4>
                        <p className="text-sm text-gray-500 capitalize">{video.type} • {new Date(video.addedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setPlayingVideo(video)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Play
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{playingVideo.title}</h3>
              <button
                onClick={() => setPlayingVideo(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {playingVideo.type === 'script' ? (
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: playingVideo.embedUrl }}
                  />
                ) : (
                  <iframe
                    src={playingVideo.embedUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    title={playingVideo.title}
                    onError={(e) => {
                      console.error('Video failed to load:', e);
                      toast.error('Failed to load video. Please check the video URL.');
                    }}
                    onLoad={() => {
                      console.log('Video loaded successfully');
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Upload Modal */}
      {videoModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add Video</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Video Title</label>
                <input
                  type="text"
                  value={videoData.title}
                  onChange={(e) => setVideoData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter video title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Video Source</label>
                <select
                  value={videoType}
                  onChange={(e) => setVideoType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="vimeo">Vimeo</option>
                  <option value="vdocipher">VdoCipher</option>
                  <option value="gumlet">Gumlet</option>
                  <option value="iframe">Iframe Embed</option>
                  <option value="script">Script Embed</option>
                </select>
              </div>
              
              {videoType === 'script' ? (
                <div>
                  <label className="block text-sm font-medium mb-2">Embed Script</label>
                  <textarea
                    value={videoData.script}
                    onChange={(e) => setVideoData(prev => ({ ...prev, script: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 h-24"
                    placeholder="Paste your embed script here"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {videoType === 'vimeo' ? 'Vimeo URL' : 
                     videoType === 'vdocipher' ? 'VdoCipher URL' :
                     videoType === 'gumlet' ? 'Gumlet URL' : 'Video URL'}
                  </label>
                  <input
                    type="url"
                    value={videoData.url}
                    onChange={(e) => setVideoData(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder={`Enter ${videoType} URL`}
                  />
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setVideoModal({ isOpen: false, courseId: null })}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addVideoToCourse}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Course</h3>
              <p className="text-gray-600 mb-4">This action cannot be undone</p>
              
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete "{deleteModal.course?.title}"?
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-yellow-800 text-sm font-medium">
                  Warning: All saved data, edits, and customizations will be permanently deleted.
                </p>
              </div>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteConfirmed}
                  onChange={(e) => setDeleteConfirmed(e.target.checked)}
                  className="mt-1 h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">
                  I understand that all data, saved edits, and customizations will be permanently deleted
                </span>
              </label>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setDeleteModal({ isOpen: false, course: null });
                  setDeleteConfirmed(false);
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCourse}
                disabled={!deleteConfirmed}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
});

Courses.displayName = 'Courses';
export default Courses;
