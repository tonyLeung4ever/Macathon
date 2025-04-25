import { motion } from 'framer-motion';

export default function Mascot({ emotion = 'happy', message }) {
  // Mascot animations for different states
  const mascotVariants = {
    idle: {
      y: [0, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    talking: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.5,
        repeat: Infinity,
      }
    }
  };

  const speechBubbleVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  // Mascot expressions based on emotion
  const mascotEmotions = {
    happy: "🧙‍♂️",
    thinking: "🤔",
    excited: "✨",
    success: "🎉"
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-end">
      <motion.div
        variants={mascotVariants}
        animate="idle"
        className="relative"
      >
        <motion.div 
          className="text-6xl filter drop-shadow-lg cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {mascotEmotions[emotion] || mascotEmotions.happy}
        </motion.div>
      </motion.div>

      {message && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={speechBubbleVariants}
          className="ml-4 mb-4 p-4 bg-white rounded-xl shadow-lg max-w-xs relative before:content-[''] before:absolute before:left-[-10px] before:bottom-4 before:border-8 before:border-transparent before:border-r-white"
        >
          <p className="text-emerald-900 text-sm">{message}</p>
        </motion.div>
      )}
    </div>
  );
} 