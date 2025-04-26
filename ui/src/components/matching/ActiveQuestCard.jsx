import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
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

export default function ActiveQuestCard({ questId }) {
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!questId) {
      setLoading(false);
      return;
    }

    // Set up real-time listener for the quest
    const unsubscribe = onSnapshot(
      doc(db, 'quests', questId),
      (doc) => {
        if (doc.exists()) {
          const questData = doc.data();
          setQuest({
            id: doc.id,
            ...questData,
            teamMembers: questData.teamMembers || [],
            tags: questData.tags || [],
            title: questData.title || 'Unnamed Quest',
            description: questData.description || 'No description available',
            location: questData.location || 'No location set',
            duration: questData.duration || 'Not specified',
            status: questData.status || 'open'
          });
        } else {
          // Quest was deleted
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
  }, [questId]);

  const handleCompleteQuest = async () => {
    if (!user || !quest) {
      setError('Unable to complete quest - please try again');
      return;
    }

    try {
      setCompleting(true);
      await completeQuest(quest.id, user.uid);
      // Navigate to feedback page instead of reloading
      navigate('/feedback');
    } catch (error) {
      console.error('Error completing quest:', error);
      setError('Failed to complete quest. Please try again.');
      setCompleting(false);
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

  const timeLeft = quest.startTime 
    ? formatDistanceToNow(
        quest.startTime?.toDate?.() || new Date(quest.startTime),
        { addSuffix: true }
      )
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
          {quest.teamMembers?.length || 0}/{quest.maxTeamSize || 1}
        </div>
      </div>

      {quest.teamMembers && quest.teamMembers.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Team Members:</h4>
          <div className="space-y-2">
            {quest.teamMembers.map((member, index) => (
              <motion.div
                key={member.userId || `member-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between bg-white p-2 rounded shadow-sm"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-emerald-500 flex items-center justify-center text-white font-medium">
                    {member.displayName?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <span className="ml-2 text-sm text-gray-700">{member.displayName || 'Anonymous'}</span>
                </div>
                <span className="text-xs text-gray-500">
                  Joined {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'Unknown date'}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="flex">
        <button
          onClick={handleCompleteQuest}
          disabled={completing}
          className={`w-full px-4 py-2 ${completing 
            ? 'bg-gray-400' 
            : 'bg-amber-600 hover:bg-amber-700'} text-white rounded-lg transition-colors font-medium`}
        >
          {completing ? 'Completing...' : 'Complete Quest'}
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