import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { findMatchingQuests, joinQuest } from '../../services/matchingService';

export default function QuestList() {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joiningQuest, setJoiningQuest] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    loadQuests();
  }, [user]);

  const loadQuests = async () => {
    try {
      setLoading(true);
      setError('');
      const matchedQuests = await findMatchingQuests(user.uid);
      setQuests(matchedQuests);
    } catch (error) {
      console.error('Error loading quests:', error);
      setError('Failed to load quests');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinQuest = async (questId) => {
    try {
      setJoiningQuest(questId);
      setError('');
      await joinQuest(questId, user.uid);
      // Reload quests to update status
      await loadQuests();
    } catch (error) {
      console.error('Error joining quest:', error);
      setError(error.message || 'Failed to join quest');
    } finally {
      setJoiningQuest(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-emerald-800">Available Quests</h2>
      {quests.length === 0 ? (
        <p className="text-center text-gray-600">No matching quests found</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-emerald-100"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-emerald-800">
                    {quest.title}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    {Math.round(quest.matchScore)}% Match
                  </span>
                </div>
                <p className="mt-2 text-gray-600">{quest.description}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Team Size:</span>
                    <span className="ml-2">{quest.currentTeamSize || 0}/{quest.maxTeamSize}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Duration:</span>
                    <span className="ml-2">{quest.duration}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Location:</span>
                    <span className="ml-2">{quest.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Status:</span>
                    <span className="ml-2 capitalize">{quest.status || 'open'}</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {quest.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => handleJoinQuest(quest.id)}
                  disabled={quest.status === 'active' || quest.status === 'completed' || joiningQuest === quest.id || user.activeQuestId}
                  className={`mt-4 w-full py-2 px-4 rounded-md text-sm font-medium transition-colors
                    ${quest.status === 'active' || quest.status === 'completed' || user.activeQuestId
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-emerald-800 text-amber-100 hover:bg-emerald-700'}`}
                >
                  {joiningQuest === quest.id
                    ? 'Joining...'
                    : quest.status === 'completed'
                    ? 'Completed'
                    : quest.status === 'active'
                    ? 'In Progress'
                    : user.activeQuestId
                    ? 'Complete Current Quest First'
                    : 'Join Quest'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 