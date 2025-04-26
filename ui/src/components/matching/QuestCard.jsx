import { motion, AnimatePresence } from 'framer-motion';
import { getStatusColor, getStatusDisplay } from './QuestList';
import { useAuth } from '../../contexts/AuthContext';
import { joinQuest } from '../../services/matchingService';
import { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { doc, onSnapshot, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';

const QuestCard = ({ quest: initialQuest, onQuestComplete }) => {
  const { user } = useAuth();
  const [quest, setQuest] = useState({
    ...initialQuest,
    id: initialQuest.id || `quest-${Math.random().toString(36).substring(2, 9)}`,
    teamMembers: initialQuest.teamMembers || [],
    tags: initialQuest.tags || []
  });
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [completed, setCompleted] = useState(initialQuest.status === 'completed');

  // Set up listener for quest updates
  useEffect(() => {
    if (!quest.id) return;

    // Check if quest exists in Firestore first
    const checkAndInitializeQuest = async () => {
      try {
        const questRef = doc(db, 'quests', quest.id);
        const questSnap = await getDoc(questRef);

        if (!questSnap.exists()) {
          // Initialize quest in Firestore if it doesn't exist
          await setDoc(questRef, {
            ...quest,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            teamMembers: quest.teamMembers || [],
            status: quest.status || "open"
          });
          console.log(`Initialized quest ${quest.id} in Firestore`);
        }

        // Now set up listener
        const unsubscribe = onSnapshot(questRef, (doc) => {
          if (doc.exists()) {
            const questData = doc.data();
            
            // If quest was completed, mark it as such
            if (questData.status === 'completed' || questData.status === 'expired') {
              setCompleted(true);
              // Notify parent component to remove this quest
              if (onQuestComplete) {
                onQuestComplete(quest.id);
              }
            }
            
            setQuest({
              ...questData,
              id: doc.id,
              teamMembers: questData.teamMembers || [],
              tags: questData.tags || []
            });
          }
        }, (error) => {
          console.error("Error listening to quest updates:", error);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error initializing quest:", error);
        return () => {};
      }
    };

    checkAndInitializeQuest();
  }, [quest.id, onQuestComplete]);

  const handleJoinQuest = async () => {
    if (!user) {
      setError("You must be logged in to join a quest");
      return;
    }
    
    if (!quest.id) {
      setError("Invalid quest ID");
      return;
    }

    try {
      setJoining(true);
      setError(null);
      
      console.log("Joining quest with ID:", quest.id);
      console.log("User ID:", user.uid);
      
      await joinQuest(quest.id, user.uid);
      setJoinSuccess(true);
      setTimeout(() => setJoinSuccess(false), 3000);
    } catch (error) {
      console.error("Error joining quest:", error);
      setError(error.message || "Failed to join quest");
    } finally {
      setJoining(false);
    }
  };

  // Mark quest as completed
  const handleCompleteQuest = async () => {
    try {
      const questRef = doc(db, 'quests', quest.id);
      await updateDoc(questRef, {
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      
      setCompleted(true);
      
      // Notify parent to remove this quest
      if (onQuestComplete) {
        onQuestComplete(quest.id);
      }
    } catch (error) {
      console.error("Error completing quest:", error);
      setError("Failed to mark quest as completed");
    }
  };

  const isQuestJoinable = () => {
    if (!user || completed) return false;
    
    // Quest has already started
    if (quest.startTime && new Date(quest.startTime) < new Date()) {
      return false;
    }
    
    // User already has an active quest
    if (user.activeQuestId) {
      return false;
    }
    
    // User is already in the team
    if (quest.teamMembers?.some(member => member.id === user.uid || member.userId === user.uid)) {
      return false;
    }
    
    // Team is full
    if (quest.teamMembers && quest.maxTeamSize && quest.teamMembers.length >= quest.maxTeamSize) {
      return false;
    }
    
    return true;
  };

  const getButtonText = () => {
    if (completed) {
      return "Completed";
    }
    
    if (!user) {
      return "Sign In to Join";
    }
    
    if (quest.startTime && new Date(quest.startTime) < new Date()) {
      return "Quest Started";
    }
    
    // Check if this is current user's active quest
    if (user.activeQuestId === quest.id) {
      return "Complete Quest";
    }
    
    if (user.activeQuestId) {
      return "Already on Quest";
    }
    
    if (quest.teamMembers?.some(member => member.id === user.uid || member.userId === user.uid)) {
      return "Already Joined";
    }
    
    if (quest.teamMembers && quest.maxTeamSize && quest.teamMembers.length >= quest.maxTeamSize) {
      return "Team Full";
    }
    
    return "Join Quest";
  };

  // Format the date to display
  const formatDate = (dateString) => {
    if (!dateString) return "Flexible date";
    try {
      return format(new Date(dateString), "EEE, MMM d, h:mm a");
    } catch (e) {
      return "Date not set";
    }
  };

  // Handle button click based on quest state
  const handleButtonClick = () => {
    if (user?.activeQuestId === quest.id) {
      // This is the user's active quest, allow completion
      handleCompleteQuest();
    } else {
      // Otherwise try to join
      handleJoinQuest();
    }
  };

  // Get current team size
  const currentTeamSize = quest.teamMembers?.length || 0;
  const maxTeamSize = quest.maxTeamSize || 1;

  if (!quest) {
    return <div>Loading quest...</div>;
  }

  // If quest is completed and we have a callback, don't render
  if (completed && onQuestComplete) {
    return null;
  }

  const buttonText = getButtonText();
  const isActiveQuest = user?.activeQuestId === quest.id;
  const isJoinable = isQuestJoinable() || isActiveQuest;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 h-[420px] flex flex-col"
    >
      {/* Card Header with Status Badge */}
      <div className="relative">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 w-full"></div>
        <div className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                {quest.title || 'Unnamed Quest'}
              </h3>
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quest.status || 'open')}`}>
                  {getStatusDisplay(quest.status || 'open')}
                </span>
                <span className="ml-2 text-xs font-medium text-emerald-600">
                  {Math.round(quest.matchScore || 0)}% Match
                </span>
              </div>
            </div>
            <button 
              className="text-gray-400 hover:text-gray-500"
              aria-label="More options"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="px-4 py-2 flex-grow flex flex-col">
        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-shrink-0">
          {quest.description || 'No description available'}
        </p>

        {/* Quest Details */}
        <div className="space-y-2 mb-3 flex-shrink-0">
          {/* Date */}
          <div className="flex items-center text-xs text-gray-500">
            <svg className="h-4 w-4 mr-1 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            {formatDate(quest.startTime)}
          </div>

          {/* Location */}
          <div className="flex items-center text-xs text-gray-500">
            <svg className="h-4 w-4 mr-1 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="truncate">{quest.location || 'Location not set'}</span>
          </div>

          {/* Team Size */}
          <div className="flex items-center text-xs text-gray-500">
            <svg className="h-4 w-4 mr-1 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <span>{currentTeamSize}/{maxTeamSize} members</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
          {quest.tags.slice(0, 4).map((tag, index) => (
            <span 
              key={`${tag}-${index}`}
              className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600"
            >
              {tag}
            </span>
          ))}
          {quest.tags.length > 4 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
              +{quest.tags.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Card Footer with Join Button */}
      <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-100 mt-auto">
        {error && (
          <p className="text-red-500 text-xs mb-2">{error}</p>
        )}
        <button
          onClick={handleButtonClick}
          disabled={joining || (!isJoinable && !isActiveQuest) || joinSuccess}
          className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 text-sm ${
            completed ? 'bg-gray-200 text-gray-500 cursor-not-allowed' :
            isActiveQuest ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm' :
            isJoinable ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm' : 
            'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {joining ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Joining...
            </span>
          ) : joinSuccess ? (
            <span className="flex items-center justify-center">
              <svg className="h-4 w-4 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Joined!
            </span>
          ) : (
            buttonText
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default QuestCard; 