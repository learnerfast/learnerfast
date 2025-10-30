import React, { useState, useEffect } from 'react';
import { X, Upload, Sparkles, HelpCircle, Globe } from 'lucide-react';
import HelpButton from '../dashboard/HelpButton';
import { useWebsite } from '../../contexts/WebsiteContext';

const AddCourseModal = ({ isOpen, onClose, onAddCourse, onCourseCreated }) => {
  const { sites } = useWebsite();
  const [step, setStep] = useState(1);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    coverImage: null,
    access: 'draft',
    price: '',
    comparePrice: '',
    selectedWebsite: null
  });
  const [isCreating, setIsCreating] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [isCheckingTitle, setIsCheckingTitle] = useState(false);

  // Real-time duplicate checking with debounce
  useEffect(() => {
    if (!courseData.title.trim()) {
      setTitleError('');
      return;
    }

    const timeoutId = setTimeout(() => {
      checkTitleDuplicate(courseData.title);
    }, 100); // 100ms debounce

    return () => clearTimeout(timeoutId);
  }, [courseData.title]);

  const checkTitleDuplicate = async (title) => {
    if (!title.trim()) return;
    
    setIsCheckingTitle(true);
    try {
      const { supabase } = await import('../../lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setTitleError('');
        setIsCheckingTitle(false);
        return;
      }
      
      const { data } = await supabase
        .from('courses')
        .select('id')
        .eq('title', title.trim())
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setTitleError('A course with this name already exists');
      } else {
        setTitleError('');
      }
    } catch (error) {
      // No duplicate found, which is good
      setTitleError('');
    }
    setIsCheckingTitle(false);
  };

  const validateTitle = async (title) => {
    if (!title.trim()) {
      setTitleError('Course title is required');
      return false;
    }
    
    await checkTitleDuplicate(title);
    return !titleError;
  };

  const validateDescription = (description) => {
    if (!description.trim()) {
      setDescriptionError('Course description is required');
      return false;
    }
    setDescriptionError('');
    return true;
  };

  const handleNext = async () => {
    if (step === 1) {
      const titleValid = await validateTitle(courseData.title);
      const descriptionValid = validateDescription(courseData.description);
      if (!titleValid || !descriptionValid) return;
    }
    if (step === 2 && courseData.access !== 'paid') {
      setStep(sites.length > 0 ? 5 : 4); // Skip pricing, go to website selection if sites exist
    } else if (step === 3 && courseData.access === 'paid' && !courseData.price) {
      return;
    } else if (step === 3 && courseData.access === 'paid') {
      setStep(sites.length > 0 ? 5 : 4); // After pricing, go to website selection if sites exist
    } else if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 4 && courseData.access !== 'paid') {
      setStep(2); // Skip pricing step when going back for non-paid courses
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    setIsCreating(true);
    setTimeout(() => {
      const newCourse = onAddCourse({
        title: courseData.title,
        description: courseData.description,
        status: courseData.access === 'draft' ? 'draft' : 'published',
        coverImage: courseData.coverImage
      });
      
      // Reset form
      setStep(1);
      setCourseData({
        title: '',
        description: '',
        coverImage: null,
        access: 'draft',
        price: '',
        comparePrice: ''
      });
      setIsCreating(false);
    }, 1000);
  };

  const handleClose = () => {
    setStep(1);
    setCourseData({
      title: '',
      description: '',
      coverImage: null,
      access: 'draft',
      price: '',
      comparePrice: '',
      selectedWebsite: null
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-4 overflow-hidden max-h-[90vh]">
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((i) => {
                  if (i === 5 && sites.length === 0) return null;
                  if (i === 3 && courseData.access !== 'paid' && step > 2) return null;
                  
                  return (
                    <div
                      key={i}
                      className={`h-2 w-12 rounded-full transition-colors ${
                        i <= step ? 'bg-teal-500' : 'bg-gray-200'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

        <div className="flex overflow-hidden">
          {/* Left Preview Panel */}
          <div className="w-2/5 p-8 bg-gray-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden relative">
              {step > 1 && courseData.access !== 'draft' && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-2 py-1 text-xs font-medium bg-gray-800 text-white rounded">
                    {courseData.access === 'draft' ? 'Draft' : courseData.access}
                  </span>
                </div>
              )}
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                {courseData.coverImage ? (
                  <img
                    src={URL.createObjectURL(courseData.coverImage)}
                    alt="Course cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {courseData.title || 'Course name'}
                </h3>
                <p className="text-sm text-gray-600">
                  {courseData.description || 'A short description goes here to describe your course content.'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="w-3/5 p-8 overflow-y-auto">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Let's set up your course
                  </h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name your course
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={courseData.title}
                      onChange={(e) => {
                        setCourseData(prev => ({ ...prev, title: e.target.value }));
                        if (titleError) setTitleError('');
                      }}
                      onBlur={() => validateTitle(courseData.title)}
                      placeholder="e.g Intro to UX design"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                        titleError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                      }`}
                    />
                    {isCheckingTitle && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                      </div>
                    )}
                  </div>
                  {titleError && (
                    <p className="mt-1 text-sm text-red-600">{titleError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How would you describe the content?
                  </label>
                  <textarea
                    value={courseData.description}
                    onChange={(e) => {
                      setCourseData(prev => ({ ...prev, description: e.target.value }));
                      if (descriptionError) setDescriptionError('');
                    }}
                    onBlur={() => validateDescription(courseData.description)}
                    placeholder="e.g An introduction to the user experience"
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none ${
                      descriptionError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                    }`}
                  />
                  {descriptionError && (
                    <p className="mt-1 text-sm text-red-600">{descriptionError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload a cover image (optional)
                  </label>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setCourseData(prev => ({ ...prev, coverImage: e.target.files[0] }))}
                          className="hidden"
                          id="cover-upload"
                        />
                        <label htmlFor="cover-upload" className="cursor-pointer">
                          <div className="text-gray-400 mb-2">
                            <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <Upload className="h-4 w-4 mx-auto text-teal-600 mb-1" />
                        </label>
                      </div>
                    </div>
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <button className="text-teal-600 hover:text-teal-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  disabled={!courseData.title.trim() || !courseData.description.trim() || titleError || descriptionError}
                  className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Select course access
                  </h2>
                  <p className="text-gray-600 mb-6">
                    How will the users access the course?
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      id: 'draft',
                      title: 'Draft',
                      description: 'The course will be in authoring mode, not published or visible.'
                    },
                    {
                      id: 'free',
                      title: 'Free',
                      description: 'The course will be accessible to all for free.'
                    },
                    {
                      id: 'paid',
                      title: 'Paid',
                      description: 'The course will be available only to users who have purchased it.'
                    },
                    {
                      id: 'coming-soon',
                      title: 'Coming soon',
                      description: 'The course page will be published with a Coming Soon indicator.'
                    }
                  ].map((option) => (
                    <label key={option.id} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="access"
                        value={option.id}
                        checked={courseData.access === option.id}
                        onChange={(e) => setCourseData(prev => ({ ...prev, access: e.target.value }))}
                        className="mt-1 h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{option.title}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleBack}
                    className="flex-1 py-3 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Choose a price
                  </h2>
                  <p className="text-gray-600 mb-6">
                    What is the price of your course?
                  </p>
                </div>

                {courseData.access === 'paid' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          type="number"
                          value={courseData.price}
                          onChange={(e) => setCourseData(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="e.g. 45"
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                        <span>What is the compare-at price? (optional)</span>
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          type="number"
                          value={courseData.comparePrice}
                          onChange={(e) => setCourseData(prev => ({ ...prev, comparePrice: e.target.value }))}
                          placeholder="e.g. 65"
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <div className="text-yellow-600 mt-0.5">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="text-sm text-yellow-800">
                          A paid course is listed in the course catalogue and visible to your audience.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-4">
                      No pricing needed for {courseData.access} courses
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={handleBack}
                    className="flex-1 py-3 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={courseData.access === 'paid' && !courseData.price}
                    className="flex-1 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 5 && sites.length > 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Choose a website
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Select which website should display this course, or skip to keep it in your dashboard only.
                  </p>
                </div>

                <div className="space-y-4 max-h-72 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #E5E7EB' }}>
                  {sites.map((site) => (
                    <label key={site.id} className="flex items-start space-x-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="website"
                        value={site.id}
                        checked={courseData.selectedWebsite === site.id}
                        onChange={(e) => setCourseData(prev => ({ ...prev, selectedWebsite: e.target.value }))}
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
                  
                  <label className="flex items-start space-x-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="website"
                      value="none"
                      checked={courseData.selectedWebsite === 'none'}
                      onChange={(e) => setCourseData(prev => ({ ...prev, selectedWebsite: e.target.value }))}
                      className="mt-1 h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Dashboard only</div>
                      <div className="text-sm text-gray-600">Keep this course in your dashboard without displaying it on any website</div>
                    </div>
                  </label>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep(courseData.access === 'paid' ? 3 : 2)}
                    className="flex-1 py-3 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="flex-1 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Course created successfully!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Your course "{courseData.title}" has been created{sites.length > 0 && courseData.selectedWebsite && courseData.selectedWebsite !== 'none' ? ` and will be displayed on ${sites.find(s => s.id === courseData.selectedWebsite)?.name}` : ''}.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-green-800">Course Created</h3>
                      <p className="text-sm text-green-700 mt-1">
                        You can now access your course from the dashboard and start building your content.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">Next steps:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                      <span>Add course sections and lessons</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                      <span>Upload videos and learning materials</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                      <span>Configure course settings and pricing</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                      <span>Publish your course when ready</span>
                    </li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={async () => {
                      const websiteIds = courseData.selectedWebsite && courseData.selectedWebsite !== 'none' ? [courseData.selectedWebsite] : [];
                      await onAddCourse({
                        title: courseData.title,
                        description: courseData.description,
                        status: courseData.access === 'draft' ? 'draft' : 'published',
                        coverImage: courseData.coverImage,
                        websiteIds: websiteIds,
                        access_type: courseData.access,
                        price: courseData.access === 'paid' ? Number(courseData.price) : 0,
                        compare_price: courseData.access === 'paid' ? Number(courseData.comparePrice) : 0
                      });
                      
                      // Reset form
                      setStep(1);
                      setCourseData({
                        title: '',
                        description: '',
                        coverImage: null,
                        access: 'draft',
                        price: '',
                        comparePrice: '',
                        selectedWebsite: null
                      });
                      onClose();
                    }}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={async () => {
                      const websiteIds = courseData.selectedWebsite && courseData.selectedWebsite !== 'none' ? [courseData.selectedWebsite] : [];
                      const createdCourse = await onAddCourse({
                        title: courseData.title,
                        description: courseData.description,
                        status: courseData.access === 'draft' ? 'draft' : 'published',
                        coverImage: courseData.coverImage,
                        websiteIds: websiteIds,
                        access_type: courseData.access,
                        price: courseData.access === 'paid' ? Number(courseData.price) : 0,
                        compare_price: courseData.access === 'paid' ? Number(courseData.comparePrice) : 0
                      });
                      
                      if (createdCourse && onCourseCreated) {
                        onCourseCreated(createdCourse);
                      }
                      
                      // Reset form
                      setStep(1);
                      setCourseData({
                        title: '',
                        description: '',
                        coverImage: null,
                        access: 'draft',
                        price: '',
                        comparePrice: '',
                        selectedWebsite: null
                      });
                      onClose();
                    }}
                    disabled={isCreating}
                    className="flex-1 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    {isCreating && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>{isCreating ? 'Creating...' : 'Go to Course Builder'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Help Button */}
      <HelpButton />
    </div>

    {/* AI Assistant Modal */}
    {showAIAssistant && (
      <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span>AI Assistant</span>
            </h3>
            <button
              onClick={() => setShowAIAssistant(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Let our AI help you create the perfect course title and description based on your topic.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's your course about?
              </label>
              <textarea
                placeholder="e.g., Web development, Digital marketing, Photography basics..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAIAssistant(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // AI suggestion logic would go here
                  setCourseData(prev => ({
                    ...prev,
                    title: 'Complete Web Development Bootcamp',
                    description: 'Master modern web development with HTML, CSS, JavaScript, and React. Build real projects and deploy them to the web.'
                  }));
                  setShowAIAssistant(false);
                }}
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Generate</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default AddCourseModal;
