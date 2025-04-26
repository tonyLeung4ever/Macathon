import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [animationStep, setAnimationStep] = useState(0);
  const [transitionToMain, setTransitionToMain] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timers = [
      // Show first line
      setTimeout(() => setAnimationStep(1), 800),
      // Hide first line
      setTimeout(() => setAnimationStep(2), 2000),
      // Show second line
      setTimeout(() => setAnimationStep(3), 2200),
      // Hide second line
      setTimeout(() => setAnimationStep(4), 3400),
      // Show right?
      setTimeout(() => setAnimationStep(5), 3600),
      // Transition out
      setTimeout(() => setTransitionToMain(true), 5000),
      // Navigate away
      setTimeout(() => navigate('/dashboard'), 5400)
    ];

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-emerald-900 flex items-center justify-center overflow-hidden">
      <AnimatePresence>
        {!transitionToMain && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AnimatePresence mode="wait">
              {animationStep === 1 && (
              <motion.p
                  key="first-line"
                className="text-amber-100 text-4xl mb-4 font-serif tracking-wider"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                Clubs require commitment.
              </motion.p>
            )}
              
              {animationStep === 3 && (
              <motion.p
                  key="second-line"
                className="text-amber-100 text-4xl mb-4 font-serif tracking-wider"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                In this generation, who commits?
              </motion.p>
            )}
              
              {animationStep === 5 && (
              <motion.div
                  key="question-mark"
                  className="text-amber-100 text-5xl font-serif"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: [0, 1, 1, 0],
                    scale: [0.8, 1.2, 1.2, 1.5]
                }}
                transition={{ 
                  duration: 1.5,
                  times: [0, 0.3, 0.7, 1],
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                  right?
              </motion.div>
            )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage; 