import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { completeQuest } from '../../services/matchingService';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const getStatusColor = (status) => {
  switch (status) {
    case 'open':
      return 'bg-emerald-100 text-emerald-800';
    case 'in_progress':
      return 'bg-amber-100 text-amber-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function ActiveQuestCard() {
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, updateUserData } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser?.activeQuestId) {
      setLoading(false);
      return;
    }

    // Set up real-time listener for the quest
    const unsubscribe = onSnapshot(
      doc(db, 'quests', currentUser.activeQuestId),
      (doc) => {
        if (doc.exists()) {
          setQuest({ id: doc.id, ...doc.data() });
        } else {
          // Quest was deleted, clean up user state
          updateUserData({
            activeQuestId: null,
            activeQuestStartDate: null
          });
          setQuest(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to quest:', error);
        setError('Failed to load quest details');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.activeQuestId, updateUserData]);

  const handleCompleteQuest = async () => {
    try {
      await completeQuest(quest.id, currentUser.uid);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing quest:', error);
      setError('Failed to complete quest');
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="animate-pulse bg-gradient-to-br from-amber-50 to-emerald-50 rounded-lg shadow-md p-6"
      >
        <div className="h-4 bg-emerald-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-emerald-200 rounded w-1/2"></div>
      </motion.div>
    );
  }

  if (!quest) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-red-50 border border-red-200 rounded-lg p-4"
      >
        <p className="text-red-600">{error || 'No active quest'}</p>
      </motion.div>
    );
  }

  const timeLeft = quest.startTime?.toDate() 
    ? formatDistanceToNow(quest.startTime.toDate(), { addSuffix: true })
    : 'Time not set';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-50 to-emerald-50 rounded-lg shadow-md p-6 border-l-4 border-emerald-500"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-emerald-800">{quest.title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Starts: {timeLeft}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className={`px-2 py-1 text-sm rounded-full ${getStatusColor(quest.status)}`}>
            {quest.status === 'open' ? '⚔️ Available' :
             quest.status === 'in_progress' ? '🔥 Hot Quest' :
             '🏆 Completed'}
          </span>
        </div>
      </div>

      <p className="text-gray-600 mb-4">{quest.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <span className="font-medium mr-2">⏱️ Duration:</span>
          {quest.duration}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span className="font-medium mr-2">📍 Location:</span>
          {quest.location}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span className="font-medium mr-2">👥 Team Size:</span>
          {quest.teamMembers?.length || 0}/{quest.maxTeamSize}
        </div>
      </div>

      {!quest.teamMembers?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Team Members:</h4>
          <div className="space-y-2">
            {quest.teamMembers?.map((member) => (
              <motion.div
                key={member.userId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between bg-white p-2 rounded shadow-sm"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-emerald-500 flex items-center justify-center text-white font-medium">
                    {member.displayName[0].toUpperCase()}
                  </div>
                  <span className="ml-2 text-sm text-gray-700">{member.displayName}</span>
                </div>
                <span className="text-xs text-gray-500">
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="flex">
        <button
          onClick={handleCompleteQuest}
          className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
        >
          Complete Quest
        </button>
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-600 text-center">
          {error}
        </div>
      )}
    </motion.div>
  );
} 