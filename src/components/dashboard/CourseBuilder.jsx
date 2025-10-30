import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Eye, 
  Rss, 
  Plus, 
  Edit3, 
  Video, 
  Upload, 
  FileText, 
  Sparkles,
  Settings,
  BarChart3,
  Users,
  Award,
  BookOpen,
  MessageSquare,
  Activity,
  GraduationCap,
  ClipboardList,
  FileCheck,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  HelpCircle,
  Globe
} from 'lucide-react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import HelpButton from './HelpButton';
import { useCourseBuilder } from './Courses';
import { useWebsite } from '../../contexts/WebsiteContext';

const CourseBuilder = ({ course, onBack }) => {
  const { sites } = useWebsite();
  const courseBuilder = useCourseBuilder();
  const activeTab = courseBuilder.activeTab;
  const setActiveTab = courseBuilder.setActiveTab;
  const [sections, setSections] = useState([]);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionForm, setSectionForm] = useState({
    title: '',
    description: ''
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [videoForm, setVideoForm] = useState({ title: '', source: 'youtube', url: '', file: null });
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, activityId: null, sectionId: null, type: null });
  const [coursePrice, setCoursePrice] = useState(0);
  const [compareAtPrice, setCompareAtPrice] = useState(0);
  const [showComparePrice, setShowComparePrice] = useState(false);
  const [courseAccess, setCourseAccess] = useState('free');
  const [priceError, setPriceError] = useState('');
  const [courseImage, setCourseImage] = useState(null);
  const [courseTitle, setCourseTitle] = useState(course?.title || '');
  const [courseDescription, setCourseDescription] = useState(course?.description || '');
  const [courseIncludes, setCourseIncludes] = useState(['', '', '', '', '']);
  const [whatYouLearn, setWhatYouLearn] = useState(['', '', '']);
  const [instructorName, setInstructorName] = useState('');
  const [instructorTitle, setInstructorTitle] = useState('');
  const [instructorBio, setInstructorBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loadedCourseImage, setLoadedCourseImage] = useState(null);
  const [accessType, setAccessType] = useState('free');
  const [navigationType, setNavigationType] = useState('global');
  const [selectedWebsites, setSelectedWebsites] = useState([]);
  const [showCourseIncludes, setShowCourseIncludes] = useState(true);
  const [showWhatYouLearn, setShowWhatYouLearn] = useState(true);
  const [showInstructor, setShowInstructor] = useState(true);

  useEffect(() => {
    if (course) {
      setCourseTitle(course.title || '');
      setCourseDescription(course.description || '');
      loadCourseSettings();
      loadAccessSettings();
      loadCourseSections();
    }
  }, [course]);

  const loadCourseSections = async () => {
    if (!course?.id) return;
    try {
      const { supabase } = await import('../../lib/supabase');
      const { data, error } = await supabase
        .from('course_sections')
        .select(`
          *,
          course_activities(
            id,
            title,
            activity_type,
            completed,
            source,
            url,
            file_url
          )
        `)
        .eq('course_id', course.id)
        .order('order_index');
      
      if (error) throw error;
      
      
      const loadedSections = data || [];
      setSections(loadedSections.map(section => ({
        id: section.id,
        title: section.title,
        description: section.description,
        activities: (section.course_activities || [])
          .map(activity => ({
            id: activity.id,
            title: activity.title,
            type: activity.activity_type,
            completed: activity.completed || false,
            source: activity.source,
            url: activity.url,
            file_url: activity.file_url
          }))
      })));
    } catch (error) {
    }
  };

  const validateVideoUrl = (source, url) => {
    if (!url) return false;
    switch (source) {
      case 'youtube':
        // More comprehensive YouTube URL validation
        const youtubeRegex = /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?$/;
        return youtubeRegex.test(url.trim());
      case 'vimeo':
        const vimeoRegex = /^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/([0-9]+)(?:\S+)?$/;
        return vimeoRegex.test(url.trim());
      default:
        return true;
    }
  };

  const showMessage = (type, text) => {
    setUploadMessage({ type, text });
    setTimeout(() => {
      setUploadMessage({ type: '', text: '' });
    }, 3000);
  };

  const handleDeleteActivity = (sectionId, activityId) => {
    setDeleteConfirm({ show: true, activityId, sectionId, type: 'activity' });
  };

  const handleDeleteSection = (sectionId) => {
    setDeleteConfirm({ show: true, sectionId, type: 'section' });
  };

  const confirmDelete = async () => {
    const { sectionId, activityId, type } = deleteConfirm;
    try {
      const { supabase } = await import('../../lib/supabase');
      
      if (type === 'activity') {
        await supabase.from('course_activities').delete().eq('id', activityId);
        
        const updatedSections = sections.map(section => 
          section.id === sectionId 
            ? { ...section, activities: section.activities.filter(activity => activity.id !== activityId) }
            : section
        );
        setSections(updatedSections);
        showMessage('success', 'Activity deleted successfully');
      } else if (type === 'section') {
        await supabase.from('course_activities').delete().eq('section_id', sectionId);
        await supabase.from('course_sections').delete().eq('id', sectionId);
        
        setSections(prev => prev.filter(section => section.id !== sectionId));
        showMessage('success', 'Section deleted successfully');
      }
      
      setDeleteConfirm({ show: false, activityId: null, sectionId: null, type: null });
    } catch (error) {
      showMessage('error', `Failed to delete ${type}`);
    }
  };

  const convertToEmbedUrl = (source, url) => {
    switch (source) {
      case 'youtube':
        const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}` : url;
      case 'vimeo':
        const vimeoMatch = url.match(/(?:vimeo\.com\/)([0-9]+)/);
        return vimeoMatch ? `https://player.vimeo.com/video/${vimeoMatch[1]}` : url;
      default:
        return url;
    }
  };

  const loadAccessSettings = async () => {
    if (!course?.id) return;
    
    try {
      const { supabase } = await import('../../lib/supabase');
      const { data, error } = await supabase
        .from('course_access')
        .select('access_type, navigation_type')
        .eq('course_id', course.id)
        .single();
      
      if (!error && data) {
        setAccessType(data.access_type || 'free');
        setNavigationType(data.navigation_type || 'global');
      }
    } catch (error) {
    }
  };

  const loadCourseSettings = async () => {
    if (!course?.id) return;
    
    try {
      const { supabase } = await import('../../lib/supabase');
      const { data, error } = await supabase
        .from('course_settings')
        .select('course_image, course_label, what_you_learn, instructor_name, instructor_title, instructor_bio, website_id, show_course_includes, show_what_you_learn, show_instructor')
        .eq('course_id', course.id)
        .single();
      
      if (!error && data) {
        setLoadedCourseImage(data.course_image);
        const includes = data.course_label ? data.course_label.split('\n').slice(0, 5) : [];
        setCourseIncludes([...includes, ...Array(5 - includes.length).fill('')]);
        const learns = data.what_you_learn ? data.what_you_learn.split('\n').slice(0, 3) : [];
        setWhatYouLearn([...learns, ...Array(3 - learns.length).fill('')]);
        setInstructorName(data.instructor_name || '');
        setInstructorTitle(data.instructor_title || '');
        setInstructorBio(data.instructor_bio || '');
        const websiteIds = data.website_id ? (typeof data.website_id === 'string' ? data.website_id.split(',') : [data.website_id]) : [];
        setSelectedWebsites(websiteIds);
        setShowCourseIncludes(data.show_course_includes !== false);
        setShowWhatYouLearn(data.show_what_you_learn !== false);
        setShowInstructor(data.show_instructor !== false);
      }
    } catch (error) {
    }
  };

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    try {
      const { supabase } = await import('../../lib/supabase');
      
      
      // Update course basic info
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .update({
          title: courseTitle,
          description: courseDescription
        })
        .eq('id', course.id)
        .select();
      
      if (courseError) {
        throw courseError;
      }
      
      
      // Handle course settings (always save to ensure settings record exists)
      let imageData = loadedCourseImage; // Keep existing image if no new one
      
      if (courseImage) {
        const reader = new FileReader();
        imageData = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(courseImage);
        });
      }
      
      // Always update or insert course settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('course_settings')
        .upsert({
          course_id: course.id,
          course_image: imageData,
          course_label: courseIncludes.filter(i => i.trim()).join('\n'),
          what_you_learn: whatYouLearn.filter(l => l.trim()).join('\n'),
          instructor_name: instructorName,
          instructor_title: instructorTitle,
          instructor_bio: instructorBio,
          website_id: selectedWebsites.length === 0 ? null : selectedWebsites.join(','),
          show_course_includes: showCourseIncludes,
          show_what_you_learn: showWhatYouLearn,
          show_instructor: showInstructor
        }, {
          onConflict: 'course_id'
        })
        .select();
      
      if (settingsError) {
        throw settingsError;
      }
      
      
      // Update loaded image state
      if (imageData) {
        setLoadedCourseImage(imageData);
        setCourseImage(null); // Clear the file input
      }
      
      // Update local course object
      if (course) {
        course.title = courseTitle;
        course.description = courseDescription;
      }
      
      showMessage('success', 'Course settings saved successfully!');
    } catch (error) {
      console.error('Error saving course settings:', error);
      showMessage('error', `Failed to save: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCourseImage(file);
      // Clear loaded image so new image shows immediately
      setLoadedCourseImage(null);
    }
  };

  const handleSaveAccess = async () => {
    setIsSaving(true);
    try {
      const { supabase } = await import('../../lib/supabase');
      
      const { error } = await supabase
        .from('course_access')
        .upsert({
          course_id: course.id,
          access_type: accessType,
          navigation_type: navigationType
        }, {
          onConflict: 'course_id'
        });
      
      if (error) throw error;
      
      showMessage('success', 'Access settings saved successfully!');
    } catch (error) {
      showMessage('error', 'Failed to save access settings');
    } finally {
      setIsSaving(false);
    }
  };

  const sidebarItems = [
    {
      category: 'Contents',
      items: [
        { id: 'course-outline', label: 'Course outline', icon: BookOpen, active: true }
      ]
    },
    {
      category: 'Course settings',
      items: [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'access', label: 'Access', icon: Users },
        { id: 'pricing', label: 'Pricing', icon: BarChart3 },
        { id: 'automations', label: 'Automations', icon: Sparkles }
      ]
    }
  ];

  const handleAddSection = () => {
    setSectionForm({ title: '', description: '' });
    setEditingSection(null);
    setShowSectionModal(true);
  };

  const handleEditSection = (section) => {
    setSectionForm({
      title: section.title,
      description: section.description
    });
    setEditingSection(section);
    setShowSectionModal(true);
  };

  const handleSaveSection = async () => {
    if (!sectionForm.title.trim()) return;

    try {
      const { supabase } = await import('../../lib/supabase');
      
      if (editingSection) {
        await supabase.from('course_sections').update({
          title: sectionForm.title,
          description: sectionForm.description
        }).eq('id', editingSection.id);
        setSections(prev => prev.map(section => 
          section.id === editingSection.id 
            ? { ...section, ...sectionForm }
            : section
        ));
      } else {
        const { data, error } = await supabase.from('course_sections').insert({
          course_id: course.id,
          title: sectionForm.title,
          description: sectionForm.description,
          order_index: sections.length
        }).select().single();
        
        if (error) throw error;
        
        const newSection = { ...data, activities: [] };
        setSections(prev => [...prev, newSection]);
      }
      
      setShowSectionModal(false);
      setSectionForm({ title: '', description: '' });
      setEditingSection(null);
      showMessage('success', editingSection ? 'Section updated' : 'Section added');
    } catch (error) {
      showMessage('error', 'Failed to save section');
    }
  };

  const getAccessBadgeClass = (access) => {
    switch (access) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'free':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const renderCourseOutline = () => (
    <div className="flex-1 p-8">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-2">
          <h2 className="text-2xl font-semibold text-gray-900">Course outline</h2>
        </div>
        <p className="text-gray-600">
          Develop your course outline and contents and set up the drip feed to schedule lesson delivery.
        </p>
      </div>

      <div className="flex items-center space-x-4 mb-8">
        <button 
          onClick={() => setShowPreview(true)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Eye className="h-4 w-4" />
          <span>Preview</span>
        </button>
      </div>

      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={section.id} className="border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleEditSection(section)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {String(index + 1).padStart(2, '0')} {section.title}
                    </h3>
                    {section.description && (
                      <p className="text-gray-600 mt-1 line-clamp-2">{section.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteSection(section.id)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all duration-200"
                  title="Delete section"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {section.activities.length > 0 && (
                <div className="mb-4 space-y-2">
                  {section.activities.map((activity) => (
                    <div key={activity.id} className="group relative">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="text-gray-400">
                          {activity.type === 'video' ? <Video className="h-4 w-4" /> : 
                           activity.type === 'pdf' ? <FileText className="h-4 w-4" /> : 
                           activity.type === 'audio' ? <Video className="h-4 w-4" /> : 
                           activity.type === 'presentation' ? <FileText className="h-4 w-4" /> : 
                           <FileText className="h-4 w-4" />}
                        </div>
                        <span className="text-sm font-medium text-gray-900 flex-1">{activity.title}</span>
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">{activity.type}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteActivity(section.id, activity.id);
                          }}
                          className="ml-2 p-1 text-white bg-red-500 hover:bg-red-600 rounded transition-all duration-200"
                          title="Delete activity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-center space-x-6 text-sm">
                <button 
                  onClick={() => { setCurrentSectionId(section.id); setShowActivityModal(true); }}
                  className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add activity</span>
                </button>
                <span className="text-gray-400">or</span>
                <button 
                  onClick={() => { setCurrentSectionId(section.id); setShowUploadModal(true); }}
                  className="flex items-center space-x-2 text-teal-600 hover:text-teal-700"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload activity</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <button 
              onClick={handleAddSection}
              className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>Add section</span>
            </button>
            <span className="text-gray-400">or</span>
            <button className="flex items-center space-x-2 text-teal-600 hover:text-teal-700">
              <Upload className="h-4 w-4" />
              <span>Upload section</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGeneral = () => (
    <div className="flex-1 p-8 bg-gray-50">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-2">
          <h2 className="text-2xl font-semibold text-gray-900">General</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>Learn more</span>
          </button>
        </div>
        <p className="text-gray-600">Adjust the generic settings of your course, like title, description, categories, and SEO.</p>
      </div>

      <div className="flex items-center space-x-4 mb-8">
        <button 
          onClick={handleSaveGeneral}
          disabled={isSaving}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isSaving && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          <span>{isSaving ? 'Saving...' : 'Save'}</span>
        </button>
        <div className="relative">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Eye className="h-4 w-4" />
            <span>Preview</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Course card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Course card</h3>
          <p className="text-gray-600 mb-6">Select the image, the title and the description of your course card. See the preview below.</p>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              {/* Preview */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                  {courseImage ? (
                    <img
                      src={URL.createObjectURL(courseImage)}
                      alt="Course preview"
                      className="w-full h-full object-cover"
                    />
                  ) : loadedCourseImage ? (
                    <img
                      src={loadedCourseImage}
                      alt="Course preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{courseTitle || 'Course Title'}</h4>
                  <p className="text-sm text-gray-600">{courseDescription || 'Course description will appear here'}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">COURSE INCLUDES</label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCourseIncludes}
                      onChange={(e) => setShowCourseIncludes(e.target.checked)}
                      className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-xs text-gray-600">Show on course page</span>
                  </label>
                </div>
                <div className="space-y-2">
                  {courseIncludes.map((item, index) => (
                    <input
                      key={index}
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newIncludes = [...courseIncludes];
                        newIncludes[index] = e.target.value;
                        setCourseIncludes(newIncludes);
                      }}
                      placeholder={index === 0 ? '20.5 hours on-demand video' : index === 1 ? '12 articles' : index === 2 ? 'Downloadable resources' : index === 3 ? 'Full lifetime access' : 'Access on mobile and TV'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">TITLE</label>
                <input 
                  type="text" 
                  value={courseTitle} 
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">DESCRIPTION</label>
                <textarea 
                  rows={3} 
                  value={courseDescription} 
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IMAGE</label>
                <div className="w-full h-20 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="course-image-upload"
                  />
                  <button 
                    onClick={() => document.getElementById('course-image-upload').click()}
                    className="px-4 py-2 bg-teal-600 text-white rounded text-sm hover:bg-teal-700"
                  >
                    Upload
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">For best results, upload a 640 X 360 image file.</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">WHAT YOU'LL LEARN</label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showWhatYouLearn}
                      onChange={(e) => setShowWhatYouLearn(e.target.checked)}
                      className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-xs text-gray-600">Show on course page</span>
                  </label>
                </div>
                <div className="space-y-2">
                  {whatYouLearn.map((item, index) => (
                    <input
                      key={index}
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newLearn = [...whatYouLearn];
                        newLearn[index] = e.target.value;
                        setWhatYouLearn(newLearn);
                      }}
                      placeholder={index === 0 ? 'Build 10+ real-world projects' : index === 1 ? 'Master front-end and back-end technologies' : 'Deploy your applications to the cloud'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructor */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Instructor</h3>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showInstructor}
                onChange={(e) => setShowInstructor(e.target.checked)}
                className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="text-sm text-gray-600">Show on course page</span>
            </label>
          </div>
          <p className="text-gray-600 mb-6">Add instructor information to display on the course page.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">INSTRUCTOR NAME</label>
              <input 
                type="text" 
                value={instructorName} 
                onChange={(e) => setInstructorName(e.target.value)}
                placeholder="e.g. Ethan Carter"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">INSTRUCTOR TITLE</label>
              <input 
                type="text" 
                value={instructorTitle} 
                onChange={(e) => setInstructorTitle(e.target.value)}
                placeholder="e.g. Full-Stack Developer & Instructor"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">INSTRUCTOR BIO</label>
              <textarea 
                rows={4} 
                value={instructorBio} 
                onChange={(e) => setInstructorBio(e.target.value)}
                placeholder="e.g. Ethan Carter is a seasoned full-stack developer with over 10 years of experience in the industry. He has worked with numerous startups and tech companies, building scalable and robust web applications."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none" 
              />
            </div>
          </div>
        </div>

        {/* Website Display */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Website Display</h3>
          <p className="text-gray-600 mb-6">Choose which website should display this course, or keep it in your dashboard only.</p>
          
          <div className="space-y-4 max-h-72 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #E5E7EB' }}>
            {sites.map((site) => (
              <label key={site.id} className="flex items-start space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  value={site.id}
                  checked={selectedWebsites.includes(site.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedWebsites([...selectedWebsites, site.id]);
                    } else {
                      setSelectedWebsites(selectedWebsites.filter(id => id !== site.id));
                    }
                  }}
                  className="mt-1 h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <div className="font-medium text-gray-900">{site.name}</div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      site.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {site.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{site.url}</div>
                </div>
              </label>
            ))}
            
            <div className="p-3 border rounded-lg bg-gray-50">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Globe className="h-4 w-4 text-gray-500" />
                <span>{selectedWebsites.length === 0 ? 'Dashboard only - Not displayed on any website' : `Displaying on ${selectedWebsites.filter(id => sites.some(site => site.id === id)).length} website(s)`}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Course notification emails */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Course notification emails</h3>
          <p className="text-gray-600 mb-4">Select the emails that will be sent to the course learners.</p>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input type="radio" name="notification" defaultChecked className="h-4 w-4 text-teal-600" />
              <span className="text-gray-700">Send the default school-wide course emails</span>
            </label>
            
            <div className="ml-7 text-sm text-gray-600">
              <p>These are the default school-wide course emails that are sent automatically for all courses. If you want to change them, go to <span className="text-blue-600">Communication {'>'}  Notification emails {'>'} Course emails</span>.</p>
            </div>
            
            <label className="flex items-center space-x-3">
              <input type="radio" name="notification" className="h-4 w-4 text-teal-600" />
              <span className="text-gray-700">Select the emails you want to send for this course</span>
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </label>
            
            <div className="ml-7 text-sm text-gray-600 mb-4">
              <p>Select which emails out of the school-wide course notification emails will be sent for this course.</p>
            </div>
            
            <div className="ml-7 space-y-3">
              {[
                'When enrolling in the course',
                'When completing the course',
                'When a certificate is awarded',
                'When an installment is paid',
                'When an installment payment fails',
                'When a payment plan is completed',
                'When a payment plan is cancelled'
              ].map((email, index) => (
                <label key={index} className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-teal-600" />
                  <span className="text-gray-700">{email}</span>
                </label>
              ))}
            </div>
          </div>
        </div>


      </div>
    </div>
  );

  const renderAccess = () => (
    <div className="flex-1 p-8 bg-gray-50">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-2">
          <h2 className="text-2xl font-semibold text-gray-900">Access</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>Learn more</span>
          </button>
        </div>
        <p className="text-gray-600">Select your course access status and identifiers and set up the course expiration date.</p>
      </div>

      <div className="flex items-center space-x-4 mb-8">
        <button 
          onClick={handleSaveAccess}
          disabled={isSaving}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isSaving && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          <span>{isSaving ? 'Saving...' : 'Save'}</span>
        </button>
        <div className="relative">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Eye className="h-4 w-4" />
            <span>Preview</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Course access */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Course access</h3>
          <p className="text-gray-600 mb-6">Choose a course status to control its availability and how learners can access it.</p>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="access" 
                  value="paid" 
                  checked={accessType === 'paid'}
                  onChange={(e) => setAccessType(e.target.value)}
                  className="mt-1 h-4 w-4 text-teal-600" 
                />
                <div>
                  <div className="font-medium text-gray-900">Paid</div>
                  <div className="text-sm text-gray-600">The course will be accessible only to users that purchased it through the site (or have been manually enrolled to it by an administrator).</div>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="access" 
                  value="draft" 
                  checked={accessType === 'draft'}
                  onChange={(e) => setAccessType(e.target.value)}
                  className="mt-1 h-4 w-4 text-teal-600" 
                />
                <div>
                  <div className="font-medium text-gray-900">Draft</div>
                  <div className="text-sm text-gray-600">The course will be in authoring mode hence not published/visible. This is the preferable mode when a course is under development.</div>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="access" 
                  value="coming-soon" 
                  checked={accessType === 'coming-soon'}
                  onChange={(e) => setAccessType(e.target.value)}
                  className="mt-1 h-4 w-4 text-teal-600" 
                />
                <div>
                  <div className="font-medium text-gray-900">Coming Soon</div>
                  <div className="text-sm text-gray-600">The course will be published in the school however it will not allow enrollments. A course card will be shown indicating that the course will become available soon.</div>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="access" 
                  value="enrollment-closed" 
                  checked={accessType === 'enrollment-closed'}
                  onChange={(e) => setAccessType(e.target.value)}
                  className="mt-1 h-4 w-4 text-teal-600" 
                />
                <div>
                  <div className="font-medium text-gray-900">Enrollment Closed</div>
                  <div className="text-sm text-gray-600">Users are not allowed to sign up for this course. The course can appear in course catalogue and its layout page is accessible by everyone. Already registered learners can still have access to its content.</div>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="access" 
                  value="free" 
                  checked={accessType === 'free'}
                  onChange={(e) => setAccessType(e.target.value)}
                  className="mt-1 h-4 w-4 text-teal-600" 
                />
                <div>
                  <div className="font-medium text-gray-900">Free</div>
                  <div className="text-sm text-gray-600">The course will be accessible to anyone for free. Users will be able to sign up and study the course.</div>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="access" 
                  value="private" 
                  checked={accessType === 'private'}
                  onChange={(e) => setAccessType(e.target.value)}
                  className="mt-1 h-4 w-4 text-teal-600" 
                />
                <div>
                  <div className="font-medium text-gray-900">Private</div>
                  <div className="text-sm text-gray-600">The course will be accessible only to users that have been manually enrolled to it. Private courses remain unpublished, hence they are not visible in the course catalogue.</div>
                </div>
              </label>
            </div>
          </div>
        </div>



        {/* After enrollment navigation */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">After enrollment navigation</h3>
          <p className="text-gray-600 mb-4">Choose where learners are redirected after enrolling in this product — with or without the cart enabled.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">OPTIONS</label>
              <div className="space-y-3">
                <label className="flex items-start space-x-3">
                  <input 
                    type="radio" 
                    name="navigation" 
                    value="global"
                    checked={navigationType === 'global'}
                    onChange={(e) => setNavigationType(e.target.value)}
                    className="mt-1 h-4 w-4 text-teal-600" 
                  />
                  <div>
                    <div className="font-medium text-gray-900">Use global navigation settings</div>
                    <div className="text-sm text-gray-600">You can adjust this in E-commerce/Purchase flow settings/Single Product settings.</div>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input 
                    type="radio" 
                    name="navigation" 
                    value="specific"
                    checked={navigationType === 'specific'}
                    onChange={(e) => setNavigationType(e.target.value)}
                    className="mt-1 h-4 w-4 text-teal-600" 
                  />
                  <div>
                    <div className="font-medium text-gray-900">Set product-specific navigation</div>
                    <div className="text-sm text-gray-600">Set a unique after-purchase flow that applies only to this product.</div>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="ml-7 space-y-3">
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">SELECT A PRODUCT-SPECIFIC OPTIONS</div>
              
              <div className="space-y-3">
                <label className="flex items-start space-x-3">
                  <input type="radio" name="specific-nav" className="mt-1 h-4 w-4 text-teal-600" />
                  <div>
                    <div className="font-medium text-gray-900">Thank you</div>
                    <div className="text-sm text-gray-600">Redirect learners to the system /thankyou page and display a thank-you message or promote additional offers. You can view and edit in Site builder/Thank you page.</div>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input type="radio" name="specific-nav" className="mt-1 h-4 w-4 text-teal-600" />
                  <div>
                    <div className="font-medium text-gray-900">Course / Program player</div>
                    <div className="text-sm text-gray-600">Redirect learners directly to the first learning activity of the purchased product to start learning.</div>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input type="radio" name="specific-nav" className="mt-1 h-4 w-4 text-teal-600" />
                  <div>
                    <div className="font-medium text-gray-900">Product description page</div>
                    <div className="text-sm text-gray-600">Take learners to the layout page of the purchased product.</div>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input type="radio" name="specific-nav" defaultChecked className="mt-1 h-4 w-4 text-teal-600" />
                  <div>
                    <div className="font-medium text-gray-900">After login page</div>
                    <div className="text-sm text-gray-600">Redirect purchasers to the after login page — your school's homepage for logged-in users.</div>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input type="radio" name="specific-nav" className="mt-1 h-4 w-4 text-teal-600" />
                  <div>
                    <div className="font-medium text-gray-900">Another page</div>
                    <div className="text-sm text-gray-600">Redirect learners to any page created with your school's site builder.</div>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3">
                  <input type="radio" name="specific-nav" className="mt-1 h-4 w-4 text-teal-600" />
                  <div>
                    <div className="font-medium text-gray-900">Specific URL</div>
                    <div className="text-sm text-gray-600">Redirect learners to an external URL after the purchase.</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );

  const handlePriceFieldClick = () => {
    if (accessType === 'free') {
      setPriceError('Cannot set pricing for free courses');
    }
  };

  const renderPricing = () => (
    <div className="flex-1 p-8">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-2">
          <h2 className="text-2xl font-semibold text-gray-900">Pricing</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm">Learn more</button>
        </div>
        <p className="text-gray-600">Set the price, choose the enroll button style, and view/create course related bundles and coupons.</p>
      </div>

      <div className="flex items-center space-x-4 mb-8">
        <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Save</button>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Eye className="h-4 w-4" />
          <span>Preview</span>
        </button>
      </div>

      {priceError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{priceError}</p>
        </div>
      )}

      <div className="space-y-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Course price</h3>
          <p className="text-gray-600 mb-4">Set the current price for this course.</p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">SET A PRICE</label>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">₹</span>
              <input 
                type="number" 
                value={coursePrice}
                onChange={(e) => {
                  if (accessType === 'free') {
                    handlePriceFieldClick();
                    return;
                  }
                  const value = parseFloat(e.target.value) || 0;
                  setCoursePrice(value);
                  if (showComparePrice && compareAtPrice > 0 && value >= compareAtPrice) {
                    setPriceError('Course price must be lower than compare-at price');
                  } else {
                    setPriceError('');
                  }
                }}
                onClick={handlePriceFieldClick}
                disabled={accessType === 'free'}
                className={`px-3 py-2 border rounded-lg ${
                  accessType === 'free' ? 'bg-gray-100 cursor-not-allowed blur-[1px]' : 'border-gray-300'
                }`}
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Compare-at price</h3>
          <p className="text-gray-600 mb-4">An optional reference price displayed alongside the course price.</p>
          <div className="mb-4">
            <input 
              type="checkbox" 
              id="show-compare" 
              checked={showComparePrice}
              onChange={(e) => {
                if (accessType === 'free') {
                  handlePriceFieldClick();
                  return;
                }
                setShowComparePrice(e.target.checked);
              }}
              onClick={handlePriceFieldClick}
              disabled={accessType === 'free'}
              className={`mr-2 ${
                accessType === 'free' ? 'cursor-not-allowed opacity-50' : ''
              }`}
            />
            <label htmlFor="show-compare" className="text-sm text-gray-700">Show a compare-at price</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SET A COMPARE-AT PRICE</label>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">₹</span>
              <input 
                type="number" 
                value={compareAtPrice}
                onChange={(e) => {
                  if (accessType === 'free') {
                    handlePriceFieldClick();
                    return;
                  }
                  const value = parseFloat(e.target.value) || 0;
                  setCompareAtPrice(value);
                  if (value > 0 && coursePrice > 0 && value <= coursePrice) {
                    setPriceError(`The compare-at price must be at least ₹${(coursePrice + 0.01).toFixed(2)}`);
                  } else {
                    setPriceError('');
                  }
                }}
                onClick={handlePriceFieldClick}
                disabled={accessType === 'free'}
                className={`px-3 py-2 border rounded-lg ${
                  accessType === 'free' ? 'bg-gray-100 cursor-not-allowed blur-[1px]' : 'border-gray-300'
                }`}
              />
            </div>
          </div>
        </div>


      </div>
    </div>
  );

  const renderAutomations = () => (
    <div className="flex-1 p-8 bg-gray-50">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-2">
          <h2 className="text-2xl font-semibold text-gray-900">Automations</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>Learn more</span>
          </button>
        </div>
        <p className="text-gray-600">Automate user-related processes, using specific triggers, actions, and conditions for seamless operations.</p>
      </div>

      <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 mb-8">Create automation</button>

      <div className="mb-6">
        <div className="flex space-x-4 border-b border-gray-200">
          <button className="px-4 py-2 border-b-2 border-teal-600 text-teal-600 font-medium">Templates</button>
          <button className="px-4 py-2 text-gray-600">My Automation Rules</button>
        </div>
      </div>

      <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <p className="text-pink-800">You discovered a higher plan feature! Unlock the potential of Automations.</p>
          <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center space-x-1">
            <span>Upgrade now</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex space-x-2">
          {['All', 'Blank', 'Course enrollment', 'Learning engagement', 'Course completion'].map((filter) => (
            <button key={filter} className={`px-3 py-1 rounded text-sm ${
              filter === 'All' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}>
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {/* Blank */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
            <FileText className="h-5 w-5 mr-2" />
            Blank
          </h3>
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-gray-700">Start new from scratch</span>
            </div>
          </div>
        </div>

        {/* Course enrollment */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
            <Users className="h-5 w-5 mr-2" />
            Course enrollment
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { when: 'a tag is added to a user', then: 'enroll the user to a specific course', icon: 'tag' },
              { when: 'a user is enrolled to a course', then: 'enroll the user to another bonus course', icon: 'user' },
              { when: 'a user is enrolled to a course', then: 'send a welcome email to the user', icon: 'mail' }
            ].map((automation, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="w-10 h-10 bg-purple-600 rounded mb-3 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm">
                  <div className="font-medium mb-1 text-gray-700">When</div>
                  <div className="text-gray-600 mb-3">{automation.when}</div>
                  <div className="font-medium mb-1 text-gray-700">Then</div>
                  <div className="text-gray-600">{automation.then}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning engagement */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
            <Activity className="h-5 w-5 mr-2" />
            Learning engagement
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { when: 'a user hasn\'t accessed a course for X days', then: 'send a reminder email to the user' },
              { when: 'a user hasn\'t accessed the school for X days', then: 'send an email to user to revisit' },
              { when: 'a user fails an assessment', then: 'send an encourage email to the user' }
            ].map((automation, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="w-10 h-10 bg-blue-600 rounded mb-3 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm">
                  <div className="font-medium mb-1 text-gray-700">When</div>
                  <div className="text-gray-600 mb-3">{automation.when}</div>
                  <div className="font-medium mb-1 text-gray-700">Then</div>
                  <div className="text-gray-600">{automation.then}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course completion */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
            <Award className="h-5 w-5 mr-2" />
            Course completion
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { when: 'a user completes a course', then: 'send an email to congratulate the user' },
              { when: 'a user completes a course', then: 'send an email with an offer to the user' },
              { when: 'a user completes a course', then: 'enroll to prerequisite courses' }
            ].map((automation, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="w-10 h-10 bg-green-600 rounded mb-3 flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm">
                  <div className="font-medium mb-1 text-gray-700">When</div>
                  <div className="text-gray-600 mb-3">{automation.when}</div>
                  <div className="font-medium mb-1 text-gray-700">Then</div>
                  <div className="text-gray-600">{automation.then}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserProgress = () => (
    <div className="flex-1 p-8">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-2">
          <h2 className="text-2xl font-semibold text-gray-900">User progress</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm">Learn more</button>
        </div>
        <p className="text-gray-600">Configure how users progress through your course and track their completion.</p>
      </div>

      <div className="flex items-center space-x-4 mb-8">
        <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Save</button>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Eye className="h-4 w-4" />
          <span>Preview</span>
        </button>
      </div>

      <div className="space-y-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Progress tracking</h3>
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input type="checkbox" defaultChecked className="h-4 w-4 text-teal-600" />
              <span className="text-gray-700">Enable progress tracking for this course</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" defaultChecked className="h-4 w-4 text-teal-600" />
              <span className="text-gray-700">Show progress bar to students</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="h-4 w-4 text-teal-600" />
              <span className="text-gray-700">Require sequential completion</span>
            </label>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Completion requirements</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum completion percentage</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>80%</option>
                <option>90%</option>
                <option>100%</option>
              </select>
            </div>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="h-4 w-4 text-teal-600" />
              <span className="text-gray-700">Require passing all quizzes</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCoursePlayer = () => (
    <div className="flex-1 p-8 bg-gray-50">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-2">
          <h2 className="text-2xl font-semibold text-gray-900">Course player</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>Learn more</span>
          </button>
        </div>
        <p className="text-gray-600">Customize the course player and set up the course navigation and course completion alert.</p>
      </div>

      <div className="flex items-center space-x-4 mb-8">
        <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Save</button>
        <div className="relative">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Eye className="h-4 w-4" />
            <span>Preview</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Course player skin */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Course player skin</h3>
          <p className="text-gray-600 mb-6">Select the feel and look of the course player.</p>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Left side - Main preview */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="bg-teal-500 text-white p-3 rounded-t-lg text-sm font-medium">
                  Create an Online Course
                </div>
                <div className="bg-white border-l-4 border-teal-500 p-4">
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                      <span>1. How to develop a course with...</span>
                    </div>
                    <div className="ml-4 space-y-1">
                      <div>What is an Online Course</div>
                      <div>Brainstorm</div>
                      <div>Uploading Learning Mat...</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                      <span>2. Sections and Learning activiti...</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                      <span>3. Creating Astonishing Ebooks...</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                      <span>4. Track your Students' perform...</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 flex items-center justify-center h-32">
                  <img src="https://images.unsplash.com/photo-1494790108755-2616c9c0e8e3?w=200&h=120&fit=crop&crop=face" alt="Course instructor" className="w-24 h-24 rounded-full object-cover" />
                </div>
                <div className="bg-white p-2 flex justify-between items-center text-xs">
                  <button className="text-gray-500">← previous</button>
                  <button className="text-gray-500">next →</button>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-2">
                <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-yellow-800">We recommend that you match your Video player skin with the Course player skin.</p>
              </div>
            </div>
            
            {/* Right side - Skin options */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Coloured Minimal */}
                <div className="text-center">
                  <div className="border-2 border-teal-500 rounded-lg overflow-hidden mb-2 relative">
                    <div className="absolute top-2 right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="bg-teal-100 p-2">
                      <div className="bg-white rounded p-2 text-xs">
                        <div className="space-y-1">
                          <div className="h-1 bg-teal-400 rounded w-3/4"></div>
                          <div className="h-1 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-2 flex items-center justify-center h-16">
                      <img src="https://images.unsplash.com/photo-1494790108755-2616c9c0e8e3?w=80&h=60&fit=crop&crop=face" alt="Instructor" className="w-12 h-12 rounded-full object-cover" />
                    </div>
                  </div>
                  <p className="text-sm font-medium">Coloured Minimal</p>
                </div>
                
                {/* Classic */}
                <div className="text-center">
                  <div className="border border-gray-300 rounded-lg overflow-hidden mb-2">
                    <div className="bg-gray-800 p-1">
                      <div className="bg-blue-500 text-white text-xs p-1 rounded">CREATING ONLINE COURSE</div>
                    </div>
                    <div className="bg-white p-2 flex items-center justify-center h-16">
                      <img src="https://images.unsplash.com/photo-1494790108755-2616c9c0e8e3?w=80&h=60&fit=crop&crop=face" alt="Instructor" className="w-12 h-12 rounded-full object-cover" />
                    </div>
                  </div>
                  <p className="text-sm font-medium">Classic</p>
                </div>
                
                {/* Minimal */}
                <div className="text-center">
                  <div className="border border-gray-300 rounded-lg overflow-hidden mb-2">
                    <div className="bg-gray-50 p-2">
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="h-1 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-1 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="bg-white p-2 flex items-center justify-center h-16">
                      <img src="https://images.unsplash.com/photo-1494790108755-2616c9c0e8e3?w=80&h=60&fit=crop&crop=face" alt="Instructor" className="w-12 h-12 rounded-full object-cover" />
                    </div>
                  </div>
                  <p className="text-sm font-medium">Minimal</p>
                </div>
              </div>
              
              {/* Bottom row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Course with one activity - Minimal */}
                <div className="text-center">
                  <div className="border border-gray-300 rounded-lg overflow-hidden mb-2">
                    <div className="bg-white p-2 flex items-center justify-center h-16">
                      <img src="https://images.unsplash.com/photo-1494790108755-2616c9c0e8e3?w=80&h=60&fit=crop&crop=face" alt="Instructor" className="w-12 h-12 rounded-full object-cover" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <p className="text-sm">Course with one activity - Minimal</p>
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                {/* Course with one activity - Dark */}
                <div className="text-center">
                  <div className="border border-gray-300 rounded-lg overflow-hidden mb-2">
                    <div className="bg-gray-800 p-1 h-4"></div>
                    <div className="bg-white p-2 flex items-center justify-center h-12">
                      <img src="https://images.unsplash.com/photo-1494790108755-2616c9c0e8e3?w=80&h=60&fit=crop&crop=face" alt="Instructor" className="w-8 h-8 rounded-full object-cover" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <p className="text-sm">Course with one activity - Dark</p>
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customize the path player */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Customize the path player</h3>
          <p className="text-gray-600 mb-6">Hide the left path player</p>
          <p className="text-sm text-gray-600 mb-6">By activating this setting, the left path player in your students course player will be removed.</p>
          <button className="text-blue-600 hover:text-blue-700 text-sm">See what you are changing</button>
          
          <div className="mt-6 space-y-4">
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="h-4 w-4 text-teal-600" />
              <span className="text-gray-700">Show the course name</span>
            </label>
            <p className="text-sm text-gray-600 ml-7">You can control the course name link at the top of your course player. This can promote student engagement by allowing them to navigate back to the learning process.</p>
            <button className="text-blue-600 hover:text-blue-700 text-sm ml-7">See what you are changing</button>
            
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="h-4 w-4 text-teal-600" />
              <span className="text-gray-700">Show progress bar</span>
            </label>
            <p className="text-sm text-gray-600 ml-7">You can provide a progress bar for students to keep track of their progress percentage in the course.</p>
            <button className="text-blue-600 hover:text-blue-700 text-sm ml-7">See what you are changing</button>
            
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="h-4 w-4 text-teal-600" />
              <span className="text-gray-700">Show all course lessons</span>
            </label>
            <p className="text-sm text-gray-600 ml-7">When enabled, all lessons will be listed by "Next" key and selecting a list of all the course lessons, which can motivate them to interact with each other. The "Lessons" list is available only if you enabled the "Course directory view" under Settings {'>'} Course Settings.</p>
            <button className="text-blue-600 hover:text-blue-700 text-sm ml-7">See what you are changing</button>
            
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="h-4 w-4 text-teal-600" />
              <span className="text-gray-700">Show the course description link</span>
            </label>
            <p className="text-sm text-gray-600 ml-7">The "Description" link enables learners to discover the course topics and each class and its description. As a result, learners understand the educational settings under Settings {'>'} Course Settings.</p>
            <button className="text-blue-600 hover:text-blue-700 text-sm ml-7">See what you are changing</button>
            
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="h-4 w-4 text-teal-600" />
              <span className="text-gray-700">Expand Course Menu by default</span>
            </label>
            <p className="text-sm text-gray-600 ml-7">You can select whether to expand the course sections when students visit the course player. Expanding all the course activities within each Section. If you disable this option, the course sections will be collapsed by default.</p>
            <button className="text-blue-600 hover:text-blue-700 text-sm ml-7">See what you are changing</button>
            
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="h-4 w-4 text-teal-600" />
              <span className="text-gray-700">Course completion</span>
            </label>
            <p className="text-sm text-gray-600 ml-7">You can select whether the course sections will be automatically completed.</p>
            <button className="text-blue-600 hover:text-blue-700 text-sm ml-7">See what you are changing</button>
          </div>
        </div>

        {/* Navigation bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Navigation bar</h3>
          <p className="text-gray-600 mb-6">Select whether to display the navigation bar at the top of the course player or not in your course.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NAVIGATION BAR POSITIONS</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input type="radio" name="nav-position" defaultChecked className="h-4 w-4 text-teal-600" />
                  <span className="text-gray-700">At the top</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="radio" name="nav-position" className="h-4 w-4 text-teal-600" />
                  <span className="text-gray-700">At the bottom</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="radio" name="nav-position" className="h-4 w-4 text-teal-600" />
                  <span className="text-gray-700">Don't show navigation buttons</span>
                </label>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm mt-2">See what you are changing</button>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Navigation buttons</h3>
          <p className="text-gray-600 mb-6">You may change the text of the navigation buttons.</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PREVIOUS</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NEXT</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Course player "back" button */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Course player "back" button</h3>
          <p className="text-gray-600 mb-6">Select where to redirect users from the course player.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">No button</label>
              <p className="text-sm text-gray-600 mb-4">No "back" button on the course player.</p>
              <button className="text-blue-600 hover:text-blue-700 text-sm">See what you are changing</button>
            </div>
            
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="h-4 w-4 text-teal-600" />
              <span className="text-gray-700">Course layout page</span>
            </label>
            <p className="text-sm text-gray-600 ml-7">An easy way for students to find their way back to the course description page.</p>
            
            <div className="ml-7 space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site logo</label>
                <p className="text-sm text-gray-600">Students can navigate back to the after login page. An image is needed. Go to "Back to course page" text via the Site language.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Another page</label>
                <p className="text-sm text-gray-600">Students can navigate to another page. An image is needed. Go to "Back to course page" text via the Site language.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specific URL</label>
                <p className="text-sm text-gray-600">"Back" URL of your choice. You can forget to change the "Back to course page" text via the Site language.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Course video auto-progress */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Course video auto-progress</h3>
          <p className="text-gray-600 mb-6">Control video lessons, the next learning activity will automatically start when the video finishes.</p>
          
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">ENABLE / DISABLE AUTO-PROGRESS</label>
            <p className="text-sm text-gray-600">Disabled</p>
          </div>
        </div>

        {/* Course navigation */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Course navigation</h3>
          <p className="text-gray-600 mb-6">Specify whether learners can navigate freely among the course learning activities without any restrictions. If you have pre-scheduled the course, learners will be able to access the learning activities according to the schedule.</p>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input type="checkbox" defaultChecked className="h-4 w-4 text-teal-600" />
              <span className="text-gray-700">Free navigation</span>
            </label>
            <p className="text-sm text-gray-600 ml-7">Students can navigate among the course learning activities without any restrictions. If you have pre-scheduled the course, learners will be able to access the learning activities according to the schedule.</p>
            
            <div className="ml-7 mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sequential navigation</label>
              <p className="text-sm text-gray-600">Students have to complete each learning activity before moving on to the next one. You can also enable "Free navigation" for specific learning activities by editing each activity and enabling "Learning activity completion".</p>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Navigation and Prerequisites</label>
                <p className="text-sm text-gray-600">Students need to complete specific prerequisite learning activities to access the following ones. You choose this option in a Prerequisite will be added to the learning activities under the "Free navigation" setting.</p>
                <button className="text-blue-600 hover:text-blue-700 text-sm mt-2">See what you are changing</button>
              </div>
            </div>
          </div>
        </div>

        {/* Course completion rule */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Course completion rule</h3>
          <p className="text-gray-600 mb-6">How should the course be marked as completed?</p>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input type="checkbox" defaultChecked className="h-4 w-4 text-teal-600" />
              <span className="text-gray-700">When the learner completes all learning activities</span>
            </label>
            <p className="text-sm text-gray-600 ml-7">When all course learning activities are completed, the course is automatically completed, such as that the learner will receive a completion certificate and the course will be marked as completed in the learner's profile.</p>
            
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="h-4 w-4 text-teal-600" />
              <span className="text-gray-700">When the learner passes all exams and certificates</span>
            </label>
            <p className="text-sm text-gray-600 ml-7">Students need to complete all exams and certificates in the course to qualify completion rules, such as that the learner will receive a completion certificate and the course will be marked as completed in the learner's profile.</p>
            
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="h-4 w-4 text-teal-600" />
              <span className="text-gray-700">When the learner passes a specific exam or certificate</span>
            </label>
            <p className="text-sm text-gray-600 ml-7">Students need to complete a specific exam or certificate in the course to qualify completion rules, such as that the learner will receive a completion certificate and the course will be marked as completed in the learner's profile.</p>
            
            <div className="ml-7 mt-4">
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Select an exam or certificate</option>
              </select>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-yellow-800">No certificate or completion found.</p>
              <p className="text-sm text-yellow-600 mt-1">You need to add at least one exam or certificate activity before you can use this option. You can add them from the course by posting a certificate of completion.</p>
            </div>
          </div>
        </div>

        {/* Apply the Course Player settings to all courses */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Apply the Course Player settings to all courses</h3>
          <p className="text-gray-600 mb-6">You can propagate this course's course player settings to all your courses.</p>
          
          <div className="space-y-2">
            <button className="block w-full text-left px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50">
              Apply the same course player skin to all courses
            </button>
            <button className="block w-full text-left px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50">
              Apply the course player appearance settings to all courses
            </button>
            <button className="block w-full text-left px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50">
              Apply the navigation settings to all courses
            </button>
            <button className="block w-full text-left px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50">
              Apply the learning activity completion rules to all courses
            </button>
            <button className="block w-full text-left px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50">
              Apply the Course Completion settings to all courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVideoLibrary = () => (
    <div className="flex-1 p-8">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-2">
          <h2 className="text-2xl font-semibold text-gray-900">Video library</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm">Learn more</button>
        </div>
        <p className="text-gray-600">Manage your video content and upload settings.</p>
      </div>

      <div className="flex items-center space-x-4 mb-8">
        <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Upload Video</button>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Upload className="h-4 w-4" />
          <span>Bulk Upload</span>
        </button>
      </div>

      <div className="space-y-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Upload settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default video quality</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Auto</option>
                <option>720p</option>
                <option>1080p</option>
                <option>4K</option>
              </select>
            </div>
            <label className="flex items-center space-x-3">
              <input type="checkbox" defaultChecked className="h-4 w-4 text-teal-600" />
              <span className="text-gray-700">Auto-generate thumbnails</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="h-4 w-4 text-teal-600" />
              <span className="text-gray-700">Enable video compression</span>
            </label>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recent uploads</h3>
          <div className="text-center py-8 text-gray-500">
            <Video className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No videos uploaded yet</p>
            <button className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              Upload Your First Video
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCoursePreview = () => {
    
    // Calculate progress based on completed activities
    const totalActivities = sections.reduce((total, section) => total + section.activities.length, 0);
    const completedActivities = sections.reduce((total, section) => 
      total + section.activities.filter(activity => activity.completed).length, 0
    );
    const progressPercentage = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

    const courseData = {
      title: course?.title || 'demon',
      progress: progressPercentage,
      sections: sections.map((section, index) => ({
        id: section.id,
        title: section.title,
        lessons: section.activities.map(activity => ({
          id: activity.id,
          title: activity.title,
          type: activity.type,
          completed: activity.completed || false,
          file: activity.file,
          source: activity.source,
          url: activity.url
        }))
      }))
    };

    const getLessonIcon = (type) => {
      switch (type) {
        case 'reading': return <BookOpen className="w-4 h-4" />;
        case 'video': return <Play className="w-4 h-4" />;
        case 'exam': return <HelpCircle className="w-4 h-4" />;
        default: return <BookOpen className="w-4 h-4" />;
      }
    };

    return (
      <div className="flex h-screen bg-gray-100">
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
          <div className="bg-orange-400 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => setShowPreview(false)}
                className="flex items-center text-white/80 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to course page
              </button>
              <button className="p-1">
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            
            <h1 className="text-2xl font-light mb-4">{courseData.title}</h1>
            
            <div className="mb-4">
              <div className="w-full bg-white/20 rounded-full h-1">
                <div className="bg-white h-1 rounded-full transition-all duration-300" style={{ width: `${courseData.progress}%` }}></div>
              </div>
              <div className="text-right text-sm mt-1 text-white/80">{courseData.progress}%</div>
            </div>

            <div className="flex space-x-8">
              {['Path', 'Learners', 'Discuss'].map((tab) => (
                <button key={tab} className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  tab === 'Path' ? 'border-white text-white' : 'border-transparent text-white/70 hover:text-white/90'
                }`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {courseData.sections.map((section) => (
              <div key={section.id} className="mb-6">
                <div className="flex items-center mb-3">
                  <ChevronRight className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-600">
                    {section.id}. {section.title}
                  </span>
                </div>
                
                {section.lessons.map((lesson) => (
                  <div 
                    key={lesson.id} 
                    onClick={() => {
                      setSelectedActivity(lesson);
                      // Mark as completed when clicked
                      if (!lesson.completed) {
                        setSections(prev => prev.map(s => 
                          s.id === section.id 
                            ? {
                                ...s, 
                                activities: s.activities.map(a => 
                                  a.id === lesson.id ? { ...a, completed: true } : a
                                )
                              }
                            : s
                        ));
                      }
                    }}
                    className={`ml-6 mb-2 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedActivity?.id === lesson.id ? 'bg-orange-50 border-l-4 border-orange-400' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`mr-3 ${lesson.completed ? 'text-green-500' : 'text-gray-400'}`}>
                        {getLessonIcon(lesson.type)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
                        {lesson.duration && (
                          <div className="text-xs text-gray-500 mt-1">{lesson.duration}</div>
                        )}
                      </div>
                      {lesson.completed && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <button className="flex items-center text-gray-600 hover:text-gray-900">
                <ChevronLeft className="w-4 h-4 mr-1" />
                previous
              </button>
              
              <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              
              <button className="flex items-center text-gray-600 hover:text-gray-900">
                next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center bg-gray-50">
            {selectedActivity ? (
              <div className="w-full h-full p-4">
                {selectedActivity.type === 'video' ? (
                  <div className="w-full h-full flex flex-col">
                    <h3 className="text-xl font-semibold mb-4">{selectedActivity.title}</h3>
                    <div className="flex-1 w-full">
                      {selectedActivity.file ? (
                        <video controls className="w-full h-full bg-black rounded-lg" key={selectedActivity.id}>
                          <source src={URL.createObjectURL(selectedActivity.file)} type={selectedActivity.file.type} />
                          Your browser does not support the video tag.
                        </video>
                      ) : selectedActivity.source === 'youtube' && selectedActivity.url ? (
                        <iframe 
                          src={selectedActivity.url.includes('embed') ? selectedActivity.url : 
                               selectedActivity.url.includes('watch?v=') ? selectedActivity.url.replace('watch?v=', 'embed/') :
                               selectedActivity.url.includes('youtu.be/') ? selectedActivity.url.replace('youtu.be/', 'youtube.com/embed/') :
                               selectedActivity.url}
                          className="w-full h-full rounded-lg"
                          frameBorder="0"
                          allowFullScreen
                          title={selectedActivity.title}
                        />
                      ) : selectedActivity.source && ['vimeo', 'vdocipher', 'gumlet', 'iframe', 'script', 'embed'].includes(selectedActivity.source) ? (
                        <div className="w-full h-full" dangerouslySetInnerHTML={{__html: selectedActivity.url}} />
                      ) : selectedActivity.url ? (
                        <video controls className="w-full h-full bg-black rounded-lg" key={selectedActivity.id} preload="metadata">
                          <source src={selectedActivity.url} />
                          Your browser does not support the video tag.
                        </video>
                      ) : null}
                    </div>
                  </div>
                ) : selectedActivity.type === 'pdf' && selectedActivity.file ? (
                  <div className="w-full h-full flex flex-col">
                    <h3 className="text-xl font-semibold mb-4">{selectedActivity.title}</h3>
                    <div className="flex-1">
                      <iframe 
                        src={URL.createObjectURL(selectedActivity.file)} 
                        className="w-full h-full border rounded-lg"
                        title={selectedActivity.title}
                      />
                    </div>
                  </div>
                ) : selectedActivity.type === 'audio' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <h3 className="text-xl font-semibold mb-8">{selectedActivity.title}</h3>
                    <div className="w-full max-w-2xl">
                      <audio controls className="w-full">
                        {selectedActivity.file ? (
                          <source src={URL.createObjectURL(selectedActivity.file)} type={selectedActivity.file.type} />
                        ) : selectedActivity.url ? (
                          <source src={selectedActivity.url} />
                        ) : null}
                        Your browser does not support the audio tag.
                      </audio>
                    </div>
                  </div>
                ) : selectedActivity.type === 'presentation' && selectedActivity.file ? (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <h3 className="text-xl font-semibold mb-8">{selectedActivity.title}</h3>
                    <div className="bg-gray-100 p-12 rounded-lg">
                      <FileText className="w-20 h-20 mx-auto mb-6 text-gray-400" />
                      <p className="text-gray-600 mb-6 text-lg">Presentation: {selectedActivity.file.name}</p>
                      <button 
                        onClick={() => {
                          const url = URL.createObjectURL(selectedActivity.file);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = selectedActivity.file.name;
                          a.click();
                        }}
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-lg"
                      >
                        Download Presentation
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-4">{selectedActivity.title}</h3>
                    <p className="text-gray-600">Content type: {selectedActivity.type}</p>
                    {selectedActivity.file && (
                      <button 
                        onClick={() => {
                          const url = URL.createObjectURL(selectedActivity.file);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = selectedActivity.file.name;
                          a.click();
                        }}
                        className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                      >
                        Download File
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 max-w-md">
                <p className="text-lg">
                  Select a lesson from the sidebar to start learning!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'course-outline':
        return renderCourseOutline();
      case 'general':
        return renderGeneral();
      case 'access':
        return renderAccess();
      case 'pricing':
        return renderPricing();
      case 'user-progress':
        return renderUserProgress();
      case 'course-player':
        return renderCoursePlayer();
      case 'video-library':
        return renderVideoLibrary();
      case 'automations':
        return renderAutomations();
      case 'course-preview':
        return renderCoursePreview();
      default:
        return (
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <Settings className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h3>
              <p className="text-gray-600">This section is under development</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-gray-50">
      {/* Success/Error Messages */}
      {uploadMessage.text && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${uploadMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'} animate-slide-in`}>
          {uploadMessage.text}
        </div>
      )}

      {/* Main Content - Sidebar is now handled by parent */}
      {renderContent()}
      
      {/* Help Button */}
      <HelpButton />

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Upload your files</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Upload multiple files to your course and convert them into learning activities. Find more information about supported file formats and useful tips here.
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <div className="mb-4">
                  <span className="text-gray-500">Drop files here, </span>
                  <button 
                    onClick={() => document.getElementById('file-upload').click()}
                    className="text-teal-600 hover:text-teal-700 underline"
                  >
                    browse files
                  </button>
                  <span className="text-gray-500"> or import from:</span>
                </div>
                
                <div className="flex justify-center space-x-8 mb-6">
                  <button 
                    onClick={() => document.getElementById('file-upload').click()}
                    className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm text-gray-700">My Device</span>
                  </button>
                  <button 
                    onClick={() => alert('Dropbox integration coming soon!')}
                    className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm text-gray-700">Dropbox</span>
                  </button>
                  <button 
                    onClick={() => alert('OneDrive integration coming soon!')}
                    className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm text-gray-700">OneDrive</span>
                  </button>
                </div>
                
                <input 
                  id="file-upload" 
                  type="file" 
                  multiple 
                  accept="video/*,audio/*,.pdf,.ppt,.pptx,.zip"
                  className="hidden" 
                  onChange={async (e) => {
                    const files = Array.from(e.target.files);
                    const newActivities = files.map(file => ({
                      id: Date.now() + Math.random(),
                      title: file.name.replace(/\.[^/.]+$/, ""),
                      type: file.type.startsWith('video/') ? 'video' : file.type === 'application/pdf' ? 'pdf' : 'file',
                      completed: false,
                      file: file
                    }));
                    
                    setSections(prev => prev.map(section => 
                      section.id === currentSectionId 
                        ? { ...section, activities: [...section.activities, ...newActivities] }
                        : section
                    ));
                    
                    // Save to database
                    if (course?.id) {
                      try {
                        const { supabase } = await import('../../lib/supabase');
                        const activitiesToInsert = newActivities.map((activity, index) => ({
                          course_id: course.id,
                          section_id: currentSectionId,
                          title: activity.title,
                          activity_type: activity.type,
                          source: 'upload',
                          file_url: null,
                          completed: false
                        }));
                        const { data, error } = await supabase.from('course_activities').insert(activitiesToInsert).select();
                        if (error) throw error;
                        
                        // Update local state with database IDs
                        if (data) {
                          setSections(prev => prev.map(section => 
                            section.id === currentSectionId 
                              ? { 
                                  ...section, 
                                  activities: [
                                    ...section.activities.filter(a => !newActivities.find(na => na.id === a.id)),
                                    ...data.map((dbActivity, index) => ({
                                      id: dbActivity.id,
                                      title: dbActivity.title,
                                      type: dbActivity.activity_type,
                                      completed: dbActivity.completed,
                                      source: dbActivity.source,
                                      url: dbActivity.url,
                                      file_url: dbActivity.file_url,
                                      file: newActivities[index]?.file // Keep the file object for preview
                                    }))
                                  ]
                                }
                              : section
                          ));
                        }
                      } catch (error) {
                      }
                    }
                    
                    setShowUploadModal(false);
                    showMessage('success', `Added ${files.length} activity(ies) to section!`);
                  }}
                />
                
                <p className="text-sm text-gray-500">Maximum ZIP file size: 5GB</p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={() => document.getElementById('file-upload').click()}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add learning activity</h3>
              <button onClick={() => setShowActivityModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">SELECT ACTIVITY TYPE</h4>
                </div>
                
                <div className="space-y-4">
                  {[
                    { icon: Video, title: 'Video (interactive)', desc: 'Upload your video, add interactivity, auto-create interactive transcripts.', color: 'bg-purple-600' },
                    { icon: FileText, title: 'PDF', desc: 'Upload and present PDFs files in the course player.', color: 'bg-red-600' },
                    { icon: Video, title: 'Presentation', desc: 'Upload presentation files in .ppt, .pptx or .odp formats (e.g. PowerPoint files).', color: 'bg-orange-600' },
                    { icon: Video, title: 'Audio', desc: 'Upload an audio file or set the URL of the related audio file.', color: 'bg-blue-600' }
                  ].map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <button 
                        key={activity.title} 
                        onClick={() => {
                          if (activity.title.includes('Video')) {
                            setVideoForm({ title: '', source: 'vimeo', url: '', file: null });
                            setShowActivityModal(false);
                            setShowVideoModal(true);
                            return;
                          }
                          
                          if (activity.title.includes('Audio')) {
                            // Handle Audio with URL option
                            const choice = confirm('Upload audio file? (Cancel for URL)');
                            if (choice) {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'audio/*';
                              input.onchange = async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  // Save to database first
                                  if (course?.id) {
                                    try {
                                      const { supabase } = await import('../../lib/supabase');
                                      const { data, error } = await supabase.from('course_activities').insert({
                                        course_id: course.id,
                                        section_id: currentSectionId,
                                        title: file.name.replace(/\.[^/.]+$/, ""),
                                        activity_type: 'audio',
                                        source: 'upload',
                                        url: null,
                                        file_url: file.name,
                                        completed: false
                                      }).select().single();
                                      
                                      if (error) throw error;
                                      
                                      // Add to local state with database ID
                                      const newActivity = {
                                        id: data.id,
                                        title: data.title,
                                        type: data.activity_type,
                                        completed: data.completed,
                                        file: file,
                                        source: data.source,
                                        url: data.url,
                                        file_url: data.file_url
                                      };
                                      
                                      setSections(prev => prev.map(section => 
                                        section.id === currentSectionId 
                                          ? { ...section, activities: [...section.activities, newActivity] }
                                          : section
                                      ));
                                      
                                      showMessage('success', 'Audio activity added successfully');
                                    } catch (error) {
                                      showMessage('error', 'Failed to save audio activity');
                                    }
                                  }
                                }
                              };
                              input.click();
                            } else {
                              const url = prompt('Enter audio URL:');
                              if (url) {
                                const title = prompt('Audio title:') || 'Audio Lesson';
                                // Save to database first
                                if (course?.id) {
                                  (async () => {
                                    try {
                                      const { supabase } = await import('../../lib/supabase');
                                      const { data, error } = await supabase.from('course_activities').insert({
                                        course_id: course.id,
                                        section_id: currentSectionId,
                                        title: title,
                                        activity_type: 'audio',
                                        source: 'url',
                                        url: url,
                                        file_url: null,
                                        completed: false
                                      }).select().single();
                                      
                                      if (error) throw error;
                                      
                                      // Add to local state with database ID
                                      const newActivity = {
                                        id: data.id,
                                        title: data.title,
                                        type: data.activity_type,
                                        completed: data.completed,
                                        source: data.source,
                                        url: data.url,
                                        file_url: data.file_url
                                      };
                                      
                                      setSections(prev => prev.map(section => 
                                        section.id === currentSectionId 
                                          ? { ...section, activities: [...section.activities, newActivity] }
                                          : section
                                      ));
                                      
                                      showMessage('success', 'Audio activity added successfully');
                                    } catch (error) {
                                      showMessage('error', 'Failed to save audio activity');
                                    }
                                  })();
                                }
                              }
                            }
                            setShowActivityModal(false);
                            return;
                          }
                          
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = activity.title.includes('PDF') ? '.pdf' :
                                        activity.title.includes('Presentation') ? '.ppt,.pptx,.odp' : '*';
                          
                          input.onchange = async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const activityType = activity.title.includes('PDF') ? 'pdf' :
                                                 activity.title.includes('Presentation') ? 'presentation' : 'file';
                              
                              // Save to database first
                              if (course?.id) {
                                try {
                                  const { supabase } = await import('../../lib/supabase');
                                  const { data, error } = await supabase.from('course_activities').insert({
                                    course_id: course.id,
                                    section_id: currentSectionId,
                                    title: file.name.replace(/\.[^/.]+$/, ""),
                                    activity_type: activityType,
                                    source: 'upload',
                                    url: null,
                                    file_url: file.name,
                                    completed: false
                                  }).select().single();
                                  
                                  if (error) throw error;
                                  
                                  // Add to local state with database ID
                                  const newActivity = {
                                    id: data.id,
                                    title: data.title,
                                    type: data.activity_type,
                                    completed: data.completed,
                                    file: file,
                                    source: data.source,
                                    url: data.url,
                                    file_url: data.file_url
                                  };
                                  
                                  setSections(prev => prev.map(section => 
                                    section.id === currentSectionId 
                                      ? { ...section, activities: [...section.activities, newActivity] }
                                      : section
                                  ));
                                  
                                  showMessage('success', 'Activity added successfully');
                                } catch (error) {
                                  showMessage('error', 'Failed to save activity');
                                }
                              }
                            }
                          };
                          
                          input.click();
                          setShowActivityModal(false);
                        }}
                        className="w-full flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                      >
                        <div className={`w-12 h-12 ${activity.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{activity.title}</h5>
                          <p className="text-sm text-gray-600 mt-1">{activity.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Video</h3>
              <button onClick={() => setShowVideoModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video Title</label>
                <input
                  type="text"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter video title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video Source</label>
                <select
                  value={videoForm.source}
                  onChange={(e) => setVideoForm(prev => ({ ...prev, source: e.target.value, url: '', file: null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 mb-3"
                >
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="vdocipher">VdoCipher</option>
                  <option value="gumlet">Gumlet</option>
                  <option value="iframe">iFrame</option>
                  <option value="script">Script</option>
                  <option value="embed">Embed Script</option>
                  <option value="upload">Upload File</option>
                </select>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {videoForm.source === 'vimeo' ? 'Vimeo URL' :
                     videoForm.source === 'youtube' ? 'YouTube URL' :
                     videoForm.source === 'vdocipher' ? 'VdoCipher URL' :
                     videoForm.source === 'gumlet' ? 'Gumlet URL' :
                     videoForm.source === 'iframe' ? 'iFrame Code' :
                     videoForm.source === 'script' ? 'Script Code' :
                     videoForm.source === 'embed' ? 'Embed Script' :
                     videoForm.source === 'upload' ? 'Video File' :
                     'Video URL'}
                  </label>
                  {videoForm.source === 'upload' ? (
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setVideoForm(prev => ({ ...prev, url: file?.name || '', file: file }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  ) : ['iframe', 'script', 'embed'].includes(videoForm.source) ? (
                    <textarea
                      value={videoForm.url || ''}
                      onChange={(e) => setVideoForm(prev => ({ ...prev, url: e.target.value }))}
                      placeholder={`Enter ${videoForm.source} code`}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={videoForm.url || ''}
                      onChange={(e) => setVideoForm(prev => ({ ...prev, url: e.target.value }))}
                      placeholder={`Enter ${videoForm.source} URL`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setShowVideoModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!videoForm.title) {
                    showMessage('error', 'Please enter a video title');
                    return;
                  }
                  
                  if (!videoForm.url && !videoForm.file) {
                    showMessage('error', 'Please provide a video URL or upload a file');
                    return;
                  }
                  
                  if (videoForm.source === 'youtube' && videoForm.url) {
                    const isValid = validateVideoUrl('youtube', videoForm.url);
                    if (!isValid) {
                      showMessage('error', 'Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...)');
                      return;
                    }
                  }
                  
                  if (videoForm.source === 'vimeo' && videoForm.url) {
                    if (!validateVideoUrl('vimeo', videoForm.url)) {
                      showMessage('error', 'Please enter a valid Vimeo URL (e.g., https://vimeo.com/...)');
                      return;
                    }
                  }
                  
                  const newActivity = {
                    id: Date.now() + Math.random(),
                    title: videoForm.title,
                    type: 'video',
                    completed: false,
                    source: videoForm.source,
                    url: videoForm.source === 'youtube' ? convertToEmbedUrl(videoForm.source, videoForm.url) : videoForm.url,
                    file: videoForm.file
                  };
                  
                  const updatedSections = sections.map(section => 
                    section.id === currentSectionId 
                      ? { ...section, activities: [...section.activities, newActivity] }
                      : section
                  );
                  setSections(updatedSections);
                  
                  if (course?.id) {
                    try {
                      const { supabase } = await import('../../lib/supabase');
                      const { data, error } = await supabase.from('course_activities').insert({
                        course_id: course.id,
                        section_id: currentSectionId,
                        title: newActivity.title,
                        activity_type: newActivity.type,
                        source: newActivity.source,
                        url: newActivity.url,
                        file_url: newActivity.file ? newActivity.file.name : null,
                        completed: false
                      }).select().single();
                      
                      if (error) throw error;
                      
                      // Update local state with database ID
                      if (data) {
                        setSections(prev => prev.map(section => 
                          section.id === currentSectionId 
                            ? { 
                                ...section, 
                                activities: section.activities.map(a => 
                                  a.id === newActivity.id 
                                    ? { ...a, id: data.id }
                                    : a
                                )
                              }
                            : section
                        ));
                      }
                    } catch (error) {
                    }
                  }
                  
                  setShowVideoModal(false);
                  setVideoForm({ title: '', source: 'youtube', url: '', file: null });
                  showMessage('success', 'Video activity added successfully');
                }}
                disabled={!videoForm.title || (!videoForm.url && !videoForm.file)}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delete {deleteConfirm.type === 'section' ? 'Section' : 'Activity'}
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this {deleteConfirm.type}? 
                {deleteConfirm.type === 'section' && ' All activities in this section will also be deleted.'} 
                This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm({ show: false, activityId: null, sectionId: null, type: null })}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-white">
          {renderCoursePreview()}
          <button 
            onClick={() => setShowPreview(false)}
            className="absolute top-4 right-4 w-8 h-8 bg-black bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {editingSection ? 'Section edit' : 'Add section'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section title
                </label>
                <input
                  type="text"
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Keep it short, informative and interesting!"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section description
                </label>
                <textarea
                  value={sectionForm.description}
                  onChange={(e) => setSectionForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide a concise description for the section. Not all content templates present this description, so you may select not to provide it. It depends on the template you have selected for presenting your course contents."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
              

            </div>
            
            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setShowSectionModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSection}
                disabled={!sectionForm.title.trim()}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseBuilder;