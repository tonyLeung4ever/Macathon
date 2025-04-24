import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

export default function ActiveQuestCard({ questId }) {
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            Team Size: {quest.currentTeamSize}/{quest.maxTeamSize}
          </p>
        </div>
        <span className="px-2 py-1 text-sm rounded-full bg-emerald-100 text-emerald-800">
          {quest.status}
        </span>
      </div>

      <p className="text-gray-600 mb-4">{quest.description}</p>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-500">
          <span className="font-medium mr-2">Duration:</span>
          {quest.duration}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span className="font-medium mr-2">Location:</span>
          {quest.location}
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Team Members:</h4>
        <div className="space-y-2">
          {quest.teamMembers?.map((member) => (
            <div
              key={member.id}
              className="flex items-center space-x-2 text-sm text-gray-600"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                {member.displayName?.charAt(0).toUpperCase()}
              </div>
              <span>{member.displayName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 