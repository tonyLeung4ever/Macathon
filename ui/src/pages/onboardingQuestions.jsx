import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { auth } from '../config/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import onboardingQuestions from '../services/data/onboardingQuestions.json';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function PersonalityQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [tagTally, setTagTally] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  const handleAnswer = async (optionKey) => {
    setIsTransitioning(true);
    const selected = onboardingQuestions[currentQuestion].answers[optionKey];

    const updatedTally = { ...tagTally };
    selected.tags.forEach((tag) => {
      updatedTally[tag] = (updatedTally[tag] || 0) + 1;
    });

    setTagTally(updatedTally);
    
    // Add delay for animation
    await new Promise(resolve => setTimeout(resolve, 500));
    setCurrentQuestion(currentQuestion + 1);
    setIsTransitioning(false);
  };

  // When quiz completes, save tally to user doc in Firestore
  useEffect(() => {
    const saveProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          'tasteProfile.personalityTraits': tagTally,
          updatedAt: new Date().toISOString()
        });
        navigate('/dashboard');
      } catch (error) {
        console.error("Failed to save personality profile:", error);
      }
    };

    if (currentQuestion >= onboardingQuestions.length) {
      saveProfile();
    }
  }, [currentQuestion, tagTally, navigate]);

  if (currentQuestion >= onboardingQuestions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-emerald-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 rounded-lg bg-white/80 backdrop-blur-sm shadow-xl"
        >
          <SparklesIcon className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-emerald-900 mb-2">Quest Complete!</h2>
          <p className="text-emerald-700 mb-4">Crafting your unique adventure profile...</p>
          <div className="w-24 h-24 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </motion.div>
      </div>
    );
  }

  const q = onboardingQuestions[currentQuestion];
  const progress = (currentQuestion / onboardingQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-emerald-50">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('/src/assets/parchment-texture.png')] opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-emerald-100/20"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative">
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
            Quest Progress: {Math.round(progress)}%
          </div>
        </div>

        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl mx-auto"
        >
          {/* Question Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-emerald-900 mb-6 leading-relaxed">
              {q.question}
            </h2>

            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {!isTransitioning && Object.entries(q.answers).map(([key, answer], index) => (
                  <motion.button
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="w-full text-left p-4 rounded-lg border-2 border-emerald-200 hover:border-emerald-500 
                             hover:bg-emerald-50 transition-all duration-300 group relative overflow-hidden"
                    onClick={() => handleAnswer(key)}
                  >
                    <div className="absolute inset-0 bg-emerald-100 transform origin-left scale-x-0 
                                  group-hover:scale-x-100 transition-transform duration-300 -z-10"/>
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 
                                     flex items-center justify-center font-semibold group-hover:bg-emerald-200">
                        {key}
                      </span>
                      <span className="text-emerald-900 font-medium">{answer.text}</span>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
