import { motion } from 'framer-motion';
import { getStatusColor, getStatusDisplay } from './QuestList';
import { useAuth } from '../../contexts/AuthContext';
import { joinQuest } from '../../services/matchingService';
import { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const QuestCard = ({ quest: initialQuest }) => {
  const [joining, setJoining] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [quest, setQuest] = useState(initialQuest);
  const { user } = useAuth();
  
  // Set up real-time listener for quest updates
  useEffect(() => {
    if (!initialQuest.id) return;
  
    const questRef = doc(db, 'quests', initialQuest.id);
    const unsubscribe = onSnapshot(questRef, (doc) => {
      if (doc.exists()) {
        setQuest({ id: doc.id, ...doc.data() });
      }
    });
  
    return () => unsubscribe();
  }, [initialQuest.id]);
  

  const getQuestIcon = (category) => {
    switch (category) {
      case 'photography':
        return '📸';
      case 'gardening':
        return '🌱';
      case 'coding':
        return '💻';
      case 'art':
        return '🎨';
      case 'games':
        return '🎮';
      default:
        return '⚔️';
    }
  };

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      const start = new Date(quest.startTime);
      const diff = start - now;

      if (diff <= 0) {
        setTimeLeft('Started');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        setTimeLeft(`${Math.floor(hours / 24)} days`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [quest.startTime]);

  const handleJoinQuest = async () => {
    if (!isQuestJoinable()) return;
    
    try {
      setJoining(true);
      await joinQuest(quest.id, user.uid);
    } catch (error) {
      console.error('Error joining quest:', error);
      alert(error.message);
    } finally {
      setJoining(false);
    }
  };

  const isQuestJoinable = () => {
    const now = new Date();
    const start = new Date(quest.startTime);
    const currentTeamSize = quest.teamMembers?.length || 0;
    
    return !(
      now >= start ||
      quest.status === 'active' || 
      quest.status === 'completed' || 
      joining || 
      user?.activeQuestId ||
      currentTeamSize >= quest.maxTeamSize ||
      quest.teamMembers?.some(member => member.userId === user.uid)
    );
  };

  const formatStartTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTeamSizeDisplay = () => {
    const currentSize = quest.teamMembers?.length || 0;
    const maxSize = quest.maxTeamSize;
    const isFull = currentSize >= maxSize;
    
    return (
      <div className="flex items-center text-gray-600">
        <span className="mr-1.5">👥</span>
        <span className={isFull ? 'text-red-600 font-medium' : ''}>
          {currentSize}/{maxSize} spots
        </span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
    >
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-1">
              {quest.title}
            </h3>
            <div className="flex flex-wrap gap-2 items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quest.status)}`}>
                {getStatusDisplay(quest.status)}
              </span>
              <span className="text-sm font-medium text-emerald-600">
                {Math.round(quest.matchScore)}% Match
              </span>
            </div>
          </div>
          <span className="text-2xl opacity-75">
            {getQuestIcon(quest.category)}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {quest.description}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div className="flex items-center text-gray-600">
            <span className="mr-1.5">⏰</span>
            {timeLeft}
          </div>
          {getTeamSizeDisplay()}
          <div className="flex items-center text-gray-600">
            <span className="mr-1.5">📅</span>
            {formatStartTime(quest.startTime)}
          </div>
          <div className="flex items-center text-gray-600">
            <span className="mr-1.5">📍</span>
            <span className="truncate">{quest.location}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
        {quest.tags && Array.isArray(quest.tags) && quest.tags.map(tag => (
  <span key={tag} className="px-2 py-1 text-xs rounded-full bg-gray-50 text-gray-600 border border-gray-100">
    {tag}
  </span>
))}

        </div>

        {/* Action Button */}
        <div className="mt-auto">
          {isQuestJoinable() ? (
            <button
              onClick={handleJoinQuest}
              disabled={joining}
              className="w-full py-3 px-4 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              {joining ? 'Joining...' : 'Join Quest'}
            </button>
          ) : (
            <button
              disabled
              className="w-full py-3 px-4 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg cursor-not-allowed"
            >
              {new Date() >= new Date(quest.startTime) ? 'Started' :
               quest.status === 'completed' ? 'Completed' :
               quest.status === 'active' ? 'In Progress' :
               user?.activeQuestId ? 'Complete Current Quest First' :
               quest.teamMembers?.some(member => member.userId === user.uid) ? 'Already Joined' :
               'Team Full'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default QuestCard; 