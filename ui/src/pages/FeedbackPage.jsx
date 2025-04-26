import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast'; 
import { submitFeedback } from './feedbackService';
import { SparklesIcon } from '@heroicons/react/24/outline';

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    enjoyment: '',
    difficulty: '',
    socialFit: '',
    wouldRepeat: '',
    comments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sections = [
    {
      name: 'enjoyment',
      title: 'How would you rate your enjoyment?',
      component: (
        <div className="py-6">
          <input
            type="number"
            name="enjoyment"
            placeholder="Rate from 1-5"
            min="1"
            max="5"
            value={form.enjoyment}
            onChange={handleChange}
            className="border-2 border-emerald-200 rounded-lg w-full p-4 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white/80 backdrop-blur-sm shadow-md"
            required
          />
          <div className="mt-4 text-emerald-700 text-center italic">
            (1 being lowest, 5 being highest)
          </div>
        </div>
      )
    },
    {
      name: 'difficulty',
      title: 'How was the difficulty level?',
      component: (
        <div className="space-y-4 py-6">
          {['too_easy', 'just_right', 'too_hard'].map((value, index) => (
            <motion.div 
              key={value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                type="button"
                onClick={() => {
                  setForm({...form, difficulty: value});
                  setTimeout(() => setCurrentSection(prevState => prevState + 1), 500);
                }}
                className={`w-full p-4 rounded-lg text-left transition-all duration-300 ${
                  form.difficulty === value 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-white/80 backdrop-blur-sm hover:bg-emerald-100 shadow-sm'
                }`}
              >
                {value === 'too_easy' ? '😴 Too Easy' : 
                 value === 'just_right' ? '😊 Just Right' : 
                 '😰 Too Hard'}
              </button>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      name: 'socialFit',
      title: 'How did you like the social experience?',
      component: (
        <div className="space-y-4 py-6">
          {['loved_group', 'prefer_solo'].map((value, index) => (
            <motion.div 
              key={value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                type="button"
                onClick={() => {
                  setForm({...form, socialFit: value});
                  setTimeout(() => setCurrentSection(prevState => prevState + 1), 500);
                }}
                className={`w-full p-4 rounded-lg text-left transition-all duration-300 ${
                  form.socialFit === value 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-white/80 backdrop-blur-sm hover:bg-emerald-100 shadow-sm'
                }`}
              >
                {value === 'loved_group' ? '👥 Loved the Group Experience' : '🧘 Would Prefer Going Solo'}
              </button>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      name: 'wouldRepeat',
      title: 'Would you do this quest again?',
      component: (
        <div className="space-y-4 py-6">
          {['yes', 'no'].map((value, index) => (
            <motion.div 
              key={value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                type="button"
                onClick={() => {
                  setForm({...form, wouldRepeat: value});
                  setTimeout(() => setCurrentSection(prevState => prevState + 1), 500);
                }}
                className={`w-full p-4 rounded-lg text-left transition-all duration-300 ${
                  form.wouldRepeat === value 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-white/80 backdrop-blur-sm hover:bg-emerald-100 shadow-sm'
                }`}
              >
                {value === 'yes' ? '✨ Absolutely!' : '❌ I\'d Rather Try Something Else'}
              </button>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      name: 'comments',
      title: 'Any additional thoughts?',
      component: (
        <div className="py-6">
          <textarea
            name="comments"
            placeholder="Share your experience..."
            value={form.comments}
            onChange={handleChange}
            className="border-2 border-emerald-200 rounded-lg w-full p-4 min-h-[150px] text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white/80 backdrop-blur-sm shadow-md"
          />
        </div>
      )
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitFeedback(form);
    } catch (error) {
      console.error('❌ Error submitting feedback (ignored):', error);
    } finally {
      toast.success('🌱 Thanks for your feedback!', {
        style: {
          background: '#D1FAE5',
          color: '#065F46',
          fontWeight: 'bold',
        },
        iconTheme: {
          primary: '#065F46',
          secondary: '#D1FAE5',
        },
      });

      setTimeout(() => navigate('/dashboard'), 2000);
    }
  };

  // If we're beyond the available sections, show success state
  if (currentSection >= sections.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-emerald-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 rounded-lg bg-white/80 backdrop-blur-sm shadow-xl"
        >
          <SparklesIcon className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-emerald-900 mb-2">Quest Feedback Complete!</h2>
          <p className="text-emerald-700 mb-6">Thank you for helping improve future quests!</p>
          {isSubmitting ? (
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-emerald-700 text-amber-50 rounded-lg hover:bg-emerald-800 transition-colors shadow-md hover:shadow-lg"
            >
              Submit Feedback 🌱
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  const progress = ((currentSection + 1) / sections.length) * 100;
  const currentSectionData = sections[currentSection];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-emerald-50">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('/src/assets/parchment-texture.png')] opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-emerald-100/20"></div>
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3] 
          }} 
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-200 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2] 
          }} 
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="absolute bottom-1/3 right-1/3 w-40 h-40 bg-amber-200 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 py-12 relative">
        {/* Progress Bar */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="mt-2 text-right text-sm text-emerald-700">
            Feedback Progress: {Math.round(progress)}%
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl mx-auto"
          >
            {/* Question Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8">
              <motion.h2 
                className="text-2xl font-bold text-emerald-900 mb-6 leading-relaxed"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {currentSectionData.title}
              </motion.h2>

              {currentSectionData.component}

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentSection === 0 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                  disabled={currentSection === 0}
                >
                  Previous
                </button>

                {/* Only show next button if the current field has a value */}
                {currentSection < sections.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentSection(prev => prev + 1)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      !form[currentSectionData.name] && currentSectionData.name !== 'comments' 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                    disabled={!form[currentSectionData.name] && currentSectionData.name !== 'comments'}
                  >
                    Next
                  </button>
                )}

                {currentSection === sections.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentSection(prev => prev + 1)}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    Finish
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FeedbackPage;