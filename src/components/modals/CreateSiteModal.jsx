import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, ArrowRight, Image as ImageIcon, Dumbbell, GraduationCap, DollarSign, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  onCreate
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentStep, setCurrentStep] = useState(1);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCurrentStep(2);
  };

  const handleBackToTemplates = () => {
    setCurrentStep(1);
  };

  const handleCreateClick = async () => {
    setIsCreating(true);
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
          onClick={onClose}
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
                    onClick={onClose}
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
                          onClick={handleCreateClick}
                          disabled={isCreating || !siteName.trim()}
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
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-end items-center">
              <button
                onClick={onClose}
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
