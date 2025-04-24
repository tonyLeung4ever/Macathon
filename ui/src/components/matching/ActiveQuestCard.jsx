import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { completeQuest } from '../../services/matchingService';

export default function ActiveQuestCard({ questId }) {
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completing, setCompleting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!questId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'quests', questId),
      (doc) => {
        if (doc.exists()) {
          setQuest({ id: doc.id, ...doc.data() });
          setLoading(false);
        } else {
          setError('Quest not found');
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error fetching quest:', error);
        setError('Failed to load quest details');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [questId]);

  const handleCompleteQuest = async () => {
    try {
      setCompleting(true);
      setError(null);
      await completeQuest(questId, user.uid);
    } catch (error) {
      console.error('Error completing quest:', error);
      setError(error.message || 'Failed to complete quest');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-white rounded-lg shadow-md p-6">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !quest) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error || 'Unable to load quest'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{quest.title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Started: {new Date(quest.startDate).toLocaleDateString()}
          </p>
        </div>
        <span className="px-2 py-1 text-sm rounded-full bg-emerald-100 text-emerald-800">
          {quest.status}
        </span>
      </div>

      <p className="text-gray-600 mb-4">{quest.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <span className="font-medium mr-2">Duration:</span>
          {quest.duration}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span className="font-medium mr-2">Location:</span>
          {quest.location}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span className="font-medium mr-2">Team Size:</span>
          {quest.currentTeamSize}/{quest.maxTeamSize}
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleCompleteQuest}
          disabled={completing || quest.status === 'completed'}
          className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
            completing || quest.status === 'completed'
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-emerald-800 text-amber-100 hover:bg-emerald-700'
          }`}
        >
          {completing
            ? 'Completing...'
            : quest.status === 'completed'
            ? 'Quest Completed'
            : 'Complete Quest'}
        </button>
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-600 text-center">
          {error}
        </div>
      )}
    </div>
  );
} 