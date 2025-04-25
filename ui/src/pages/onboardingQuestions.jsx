import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { auth } from '../config/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import { soundManager } from '../utils/sound';
import Mascot from '../components/Mascot';
import { COLLECTIONS } from '../config/firebase';

export default function PersonalityQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [tagTally, setTagTally] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mascotMessage, setMascotMessage] = useState("Welcome adventurer! Let's discover your path together! 🌟");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const questionsRef = collection(db, COLLECTIONS.ONBOARDING_QUESTIONS);
        const snapshot = await getDocs(questionsRef);
        const loadedQuestions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setQuestions(loadedQuestions);
        setLoading(false);
      } catch (error) {
        console.error("Error loading questions:", error);
        setLoading(false);
      }
    };

    loadQuestions();
    soundManager.playBackgroundMusic();
    return () => soundManager.stopBackgroundMusic();
  }, []);

  const handleAnswer = async (optionKey) => {
    if (!questions[currentQuestion]) return;
    
    setIsTransitioning(true);
    soundManager.playSound('click');
    
    const selected = questions[currentQuestion].answers[optionKey];
    const updatedTally = { ...tagTally };
    selected.tags.forEach((tag) => {
      updatedTally[tag] = (updatedTally[tag] || 0) + 1;
    });

    setTagTally(updatedTally);
    
    // Update mascot message based on progress
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    if (progress >= 75) {
      setMascotMessage("Almost there! Your destiny awaits! ✨");
    } else if (progress >= 50) {
      setMascotMessage("You're doing great! Keep going! 🌟");
    } else if (progress >= 25) {
      setMascotMessage("Interesting choice! Let's continue our quest! 🎯");
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    setCurrentQuestion(currentQuestion + 1);
    setIsTransitioning(false);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    soundManager.toggleSound();
  };

  useEffect(() => {
    const saveProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        soundManager.playSound('success');
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

    if (currentQuestion >= questions.length && questions.length > 0) {
      setMascotMessage("Congratulations! Your journey begins now! 🎉");
      saveProfile();
    }
  }, [currentQuestion, tagTally, navigate, questions.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-emerald-700">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (currentQuestion >= questions.length && questions.length > 0) {
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
        <Mascot emotion="success" message={mascotMessage} />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center p-8 rounded-lg bg-white/80 backdrop-blur-sm shadow-xl">
          <h2 className="text-2xl font-bold text-emerald-900 mb-2">Oops!</h2>
          <p className="text-emerald-700">No questions available at the moment. Please try again later.</p>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];
  const progress = (currentQuestion / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-emerald-50">
      {/* Ambient Background with Particles */}
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

      {/* Sound Toggle */}
      <button
        onClick={toggleSound}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white/80 shadow-lg hover:bg-white transition-colors"
      >
        {soundEnabled ? (
          <SpeakerWaveIcon className="w-6 h-6 text-emerald-600" />
        ) : (
          <SpeakerXMarkIcon className="w-6 h-6 text-emerald-600" />
        )}
      </button>

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
            <motion.h2 
              className="text-2xl font-bold text-emerald-900 mb-6 leading-relaxed"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {q.question}
            </motion.h2>

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
                    onMouseEnter={() => soundManager.playSound('hover')}
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

      {/* Mascot */}
      <Mascot emotion={isTransitioning ? "thinking" : "happy"} message={mascotMessage} />
    </div>
  );
}
