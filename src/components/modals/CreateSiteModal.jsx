import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, ArrowRight, Image as ImageIcon, Dumbbell, GraduationCap, DollarSign, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const categories = ['All', 'Fitness', 'Education', 'Financial'];

const CreateSiteModal = ({
  isOpen,
  onClose,
  templates,
  title = "Create a New Site",
  siteName,
  setSiteName,
  selectedTemplate,
  setSelectedTemplate,
  onCreate,
  onCoursesSelected
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentStep, setCurrentStep] = useState(1);
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user) {
      loadCourses();
    }
  }, [isOpen, user]);

  const loadCourses = async () => {
    const { data } = await supabase
      .from('courses')
      .select(`
        id, 
        title, 
        description,
        course_settings(course_image),
        course_access(access_type),
        course_pricing(price, compare_price, show_compare_price)
      `)
      .eq('user_id', user.id);
    setCourses(data || []);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCurrentStep(2);
  };

  const handleNextStep = () => {
    if (courses.length > 0) {
      setCurrentStep(3);
    } else {
      handleCreateClick();
    }
  };

  const handleBackToTemplates = () => {
    setCurrentStep(1);
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedCategory('All');
    setSelectedCourses([]);
    onClose();
  };

  const handleCreateClick = async () => {
    setIsCreating(true);
    if (onCoursesSelected && selectedCourses.length > 0) {
      await onCoursesSelected(selectedCourses);
    }
    const success = await onCreate();
    if (!success) {
      setIsCreating(false);
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } },
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          onClick={handleClose}
        >
          <motion.div
            className="relative w-full max-w-7xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="p-8 pb-4">
                <div className="flex items-center mb-6">
                  <button
                    onClick={handleClose}
                    className="ml-auto p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    disabled={isCreating}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {currentStep === 1 && (
                  <>
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">Pick a template for your website</h1>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            selectedCategory === category
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                
                {currentStep === 2 && selectedTemplate && (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <button
                        onClick={handleBackToTemplates}
                        className="p-2 rounded-full text-gray-900 font-bold hover:bg-gray-100 transition-colors"
                      >
                        <ArrowRight className="h-5 w-5 rotate-180" />
                      </button>
                      <h1 className="text-4xl font-bold text-gray-900">Customize your site</h1>
                    </div>
                  </>
                )}
              </div>
              
              {currentStep === 1 && (
                <div className="flex-1 px-8 overflow-y-auto">
                  <div className="grid grid-cols-3 gap-6 pb-6">
                    {templates.filter(t => selectedCategory === 'All' || t.category === selectedCategory).map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className="group relative bg-white rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg border-gray-200 hover:border-gray-300"
                        onMouseEnter={(e) => {
                          const iframe = e.currentTarget.querySelector('iframe');
                          if (iframe && iframe.contentWindow && iframe.contentWindow.document && iframe.contentWindow.document.documentElement) {
                            iframe.scrollingDown = true;
                            iframe.scrollingUp = false;
                            
                            const scrollDown = () => {
                              if (!iframe.scrollingDown || !iframe.contentWindow || !iframe.contentWindow.document || !iframe.contentWindow.document.documentElement) return;
                              const currentScroll = iframe.contentWindow.scrollY;
                              const maxScroll = iframe.contentWindow.document.documentElement.scrollHeight - iframe.contentWindow.innerHeight;
                              if (currentScroll < maxScroll) {
                                iframe.contentWindow.scrollTo(0, currentScroll + 15);
                                requestAnimationFrame(scrollDown);
                              }
                            };
                            scrollDown();
                          }
                        }}
                        onMouseLeave={(e) => {
                          const iframe = e.currentTarget.querySelector('iframe');
                          if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
                            iframe.scrollingDown = false;
                            iframe.scrollingUp = true;
                            const scrollUp = () => {
                              if (!iframe.scrollingUp || !iframe.contentWindow) return;
                              const currentScroll = iframe.contentWindow.scrollY;
                              if (currentScroll > 0) {
                                iframe.contentWindow.scrollTo(0, currentScroll - 20);
                                requestAnimationFrame(scrollUp);
                              } else {
                                iframe.scrollingUp = false;
                              }
                            };
                            scrollUp();
                          }
                        }}
                      >
                        <div className="aspect-[3/2] overflow-hidden">
                          <iframe
                            src={`${template.path}index.html`}
                            className="w-full h-full border-0 origin-top-left template-preview"
                            style={{ width: '400%', height: '400%', transform: 'scale(0.25)', minWidth: '1366px' }}
                            title={`Preview of ${template.name}`}
                            scrolling="yes"
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                          <h3 className="text-white font-medium text-sm">{template.name}</h3>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {currentStep === 2 && selectedTemplate && (
                <div className="flex-1 px-8 overflow-y-auto pt-4">
                  <div className="flex gap-8">
                    <div className="w-2/3">
                      <div className="h-96 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
                        <iframe
                          src={`${selectedTemplate.path}index.html`}
                          className="w-full h-full border-0 origin-top-left"
                          style={{ width: '200%', height: '200%', transform: 'scale(0.5)', minWidth: '1366px' }}
                          title={`Preview of ${selectedTemplate.name}`}
                          scrolling="yes"
                        />
                      </div>
                    </div>
                    
                    <div className="w-1/3 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Name your site
                        </h3>
                        <input
                          id="siteName"
                          type="text"
                          value={siteName}
                          onChange={(e) => setSiteName(e.target.value)}
                          placeholder="e.g. My Awesome Course"
                          className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={handleNextStep}
                          disabled={isCreating || !siteName.trim()}
                          className="w-full px-6 py-3 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                        >
                          {isCreating && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          )}
                          <span>{courses.length > 0 ? 'Next' : 'Create Site'}</span>
                          {!isCreating && <ArrowRight className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && courses.length > 0 && (
                <div className="flex-1 px-8 overflow-y-auto pt-4">
                  <div className="max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Select courses to display</h3>
                    <div className="grid grid-cols-3 gap-4 mb-6" style={{ maxHeight: courses.length > 6 ? '600px' : 'auto', overflowY: courses.length > 6 ? 'auto' : 'visible' }}>
                      {courses.map((course) => {
                        const accessType = course.course_access?.[0]?.access_type || 'free';
                        const price = course.course_pricing?.[0]?.price || 0;
                        const comparePrice = course.course_pricing?.[0]?.compare_price || 0;
                        const showCompare = course.course_pricing?.[0]?.show_compare_price && comparePrice > price;
                        const isSelected = selectedCourses.includes(course.id);
                        
                        return (
                          <label
                            key={course.id}
                            className="relative border-2 rounded-lg cursor-pointer hover:shadow-lg transition-all overflow-hidden"
                            style={{ borderColor: isSelected ? '#1f2937' : '#e5e7eb' }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCourses([...selectedCourses, course.id]);
                                } else {
                                  setSelectedCourses(selectedCourses.filter(id => id !== course.id));
                                }
                              }}
                              className="absolute top-3 right-3 w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900 z-10"
                            />
                            <div className="aspect-video bg-gray-100 relative">
                              {course.course_settings?.[0]?.course_image ? (
                                <img src={course.course_settings[0].course_image} alt={course.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                  <GraduationCap className="h-12 w-12 text-blue-600" />
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">{course.title}</h4>
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description || 'No description'}</p>
                              <div className="flex items-center gap-2">
                                {accessType === 'free' && (
                                  <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">FREE</span>
                                )}
                                {accessType === 'paid' && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-900">₹{price}</span>
                                    {showCompare && (
                                      <span className="text-xs text-gray-500 line-through">₹{comparePrice}</span>
                                    )}
                                  </div>
                                )}
                                {accessType === 'coming-soon' && (
                                  <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">COMING SOON</span>
                                )}
                                {accessType === 'enrollment-closed' && (
                                  <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded">CLOSED</span>
                                )}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    <button
                      onClick={handleCreateClick}
                      disabled={isCreating}
                      className="w-full px-6 py-3 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                      {isCreating && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                      <span>Create Site</span>
                      {!isCreating && <ArrowRight className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-end items-center">
              <button
                onClick={handleClose}
                disabled={isCreating}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-transparent rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default CreateSiteModal;
