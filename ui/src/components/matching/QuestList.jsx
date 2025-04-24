import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { findMatchingQuests, joinQuest, initializeQuests } from '../../services/matchingService';
import { collection, query, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function QuestList() {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joiningQuest, setJoiningQuest] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize quests if none exist
    const initializeIfNeeded = async () => {
      const snapshot = await getDocs(collection(db, 'quests'));
      if (snapshot.empty) {
        await initializeQuests();
      }
    };

    initializeIfNeeded().catch(console.error);

    // Set up real-time listener for quests
    const q = query(collection(db, 'quests'));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const questsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          matchScore: 75 // Default match score for now
        }));
        setQuests(questsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading quests:', error);
        setError('Failed to load quests');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const formatEventTime = (dateTimeStr) => {
    try {
      if (!dateTimeStr) return 'Starting soon';
      
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return 'Starting soon';

      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Starting soon';
    }
  };

  const formatDuration = (hours) => {
    try {
      if (!hours && hours !== 0) return 'Duration not set';
      
      const wholeHours = Math.floor(hours);
      const minutes = Math.round((hours - wholeHours) * 60);
      
      if (minutes === 0) {
        return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''}`;
      } else if (wholeHours === 0) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      } else {
        return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
      }
    } catch (error) {
      console.error('Error formatting duration:', error);
      return 'Duration format error';
    }
  };

  const handleJoinQuest = async (questId, startSolo = false) => {
    try {
      setJoiningQuest(questId);
      setError('');
      await joinQuest(questId, user.uid, startSolo);
    } catch (error) {
      console.error('Error joining quest:', error);
      setError(error.message || 'Failed to join quest');
    } finally {
      setJoiningQuest(null);
    }
  };

  const getStatusDisplay = (quest) => {
    if (quest.status === 'completed') return 'Completed';
    if (quest.status === 'active') return 'In Progress';
    if (quest.status === 'forming') {
      return `Forming Team (${quest.teamMembers?.length || 0}/${quest.minTeamSize} needed)`;
    }
    return 'Open';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'forming':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-emerald-100 text-emerald-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isQuestJoinable = (quest) => {
    return !(
      quest.status === 'active' || 
      quest.status === 'completed' || 
      joiningQuest === quest.id || 
      user.activeQuestId ||
      (quest.teamMembers?.length || 0) >= quest.maxTeamSize
    );
  };

  const getTimeRemaining = (quest) => {
    if (!quest.startDate || !quest.endTime) return null;
    const now = new Date();
    const endTime = new Date(quest.endTime);
    const timeLeft = endTime - now;
    
    if (timeLeft <= 0) return 'Expired';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
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
      <h2 className="text-2xl font-bold text-emerald-800">Today's Quests</h2>
      {quests.length === 0 ? (
        <p className="text-center text-gray-600">No quests available at the moment</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-emerald-100 flex flex-col"
            >
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-800">
                      {quest.title}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 mt-1">
                      {Math.round(quest.matchScore)}% Match
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quest.status)}`}>
                    {getStatusDisplay(quest)}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{quest.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium w-24">Duration:</span>
                    <span>{formatDuration(quest.durationHours)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium w-24">Time:</span>
                    <span>{formatEventTime(quest.eventDateTime)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium w-24">Location:</span>
                    <span>{quest.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium w-24">Team Size:</span>
                    <span>
                      {quest.teamMembers?.length || 0}/{quest.maxTeamSize}
                      {quest.status === 'forming' && ` (${quest.minTeamSize} to start)`}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {quest.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {quest.teamMembers?.length > 0 && !quest.isSoloQuest && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Current Team:</h4>
                    <div className="flex flex-wrap gap-2">
                      {quest.teamMembers.map((member) => (
                        <div
                          key={member.userId}
                          className="flex items-center bg-gray-50 px-2 py-1 rounded"
                        >
                          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-xs font-medium">
                            {member.displayName[0].toUpperCase()}
                          </div>
                          <span className="ml-1 text-xs text-gray-600">
                            {member.displayName}
                            {member.isSolo && ' (Solo)'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-gray-50 mt-auto">
                {isQuestJoinable(quest) ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleJoinQuest(quest.id, false)}
                      className="w-full py-2 px-4 rounded-md text-sm font-medium bg-emerald-800 text-amber-100 hover:bg-emerald-700 transition-colors"
                    >
                      {joiningQuest === quest.id ? 'Joining...' : 'Join Team Quest'}
                    </button>
                  </div>
                ) : (
                  <button
                    disabled
                    className="w-full py-2 px-4 rounded-md text-sm font-medium bg-gray-300 cursor-not-allowed"
                  >
                    {quest.status === 'completed'
                      ? 'Completed'
                      : quest.status === 'expired'
                      ? 'Expired'
                      : quest.status === 'active'
                      ? 'In Progress'
                      : user.activeQuestId
                      ? 'Complete Current Quest First'
                      : 'Team Full'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 