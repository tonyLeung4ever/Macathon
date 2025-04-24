import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [showFirstLine, setShowFirstLine] = useState(false);
  const [showSecondLine, setShowSecondLine] = useState(false);
  const [showQuestionMark, setShowQuestionMark] = useState(false);
  const [transitionToMain, setTransitionToMain] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer1 = setTimeout(() => setShowFirstLine(true), 1000);
    const timer2 = setTimeout(() => setShowSecondLine(true), 2500);
    const timer3 = setTimeout(() => setShowQuestionMark(true), 4000);
    const timer4 = setTimeout(() => setTransitionToMain(true), 5500);
    const timer5 = setTimeout(() => navigate('/dashboard'), 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
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
            {showFirstLine && (
              <motion.p
                className="text-amber-100 text-4xl mb-4 font-serif tracking-wider"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                Clubs require commitment.
              </motion.p>
            )}
            {showSecondLine && (
              <motion.p
                className="text-amber-100 text-4xl mb-4 font-serif tracking-wider"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                In this generation, who commits?
              </motion.p>
            )}
            {showQuestionMark && (
              <motion.div
                className="text-amber-100 text-9xl font-serif"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: [0, 1, 1, 0],
                  scale: [0.8, 1.2, 1.5, 2]
                }}
                transition={{ 
                  duration: 1.5,
                  times: [0, 0.3, 0.7, 1],
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                ?
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage; 