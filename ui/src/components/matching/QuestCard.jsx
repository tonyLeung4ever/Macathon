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
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">{quest.title}</h3>
          <div className="flex items-center mt-2 space-x-2">
            <span className="bg-emerald-100 text-emerald-800 text-sm px-2 py-1 rounded">Available</span>
            <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">{quest.matchScore}% Match</span>
          </div>
        </div>
        {quest.icon && <span className="text-2xl">{quest.icon}</span>}
      </div>

      <p className="text-gray-600 mb-4">{quest.description}</p>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <span className="mr-2">⏱️</span>
          {quest.duration}h {quest.minutes}m
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span className="mr-2">👥</span>
          {quest.currentTeamSize || 0}/{quest.maxTeamSize} spots
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span className="mr-2">📅</span>
          {new Date(quest.eventTime).toLocaleString()}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span className="mr-2">📍</span>
          {quest.location}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {quest.tags?.map((tag) => (
          <span
            key={tag}
            className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto">
        <button
          onClick={() => onJoinQuest(quest.id)}
          className="w-full bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors"
        >
          Join Quest
        </button>
      </div>
    </div>
  );
};

export default QuestCard; 