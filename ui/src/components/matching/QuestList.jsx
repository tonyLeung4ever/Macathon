import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, getDocs, deleteDoc, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import QuestCard from './QuestCard';

export const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-amber-100 text-amber-800';
  }
};

export const getStatusDisplay = (status) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'completed':
      return 'Completed';
    default:
      return 'Available';
  }
};

export default function QuestList({ quests = null }) {
  const [spots, setSpots] = useState(quests ? quests.filter(quest => 
    quest.status !== 'completed' && 
    quest.status !== 'expired'
  ) : []);
  const [loading, setLoading] = useState(quests === null);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAndCleanSpots = async () => {
      try {
        setLoading(true);
        const spotsRef = collection(db, 'quests');
        const q = query(
          spotsRef, 
          where('status', 'not-in', ['completed', 'expired'])
        );
        const querySnapshot = await getDocs(q);
        
        const now = new Date();
        const fetchedSpots = [];
        const deletePromises = [];

        querySnapshot.forEach((doc) => {
          const spot = { 
            id: doc.id, 
            ...doc.data(),
            teamMembers: doc.data().teamMembers || [],
            tags: doc.data().tags || []
          };
          
          // Make sure startTime exists
          if (!spot.startTime) {
            // Set a random start time in the next 24 hours
            const randomHours = 1 + Math.floor(Math.random() * 23);
            spot.startTime = new Date(now.getTime() + randomHours * 60 * 60 * 1000).toISOString();
          }

          const startTime = new Date(spot.startTime);
          
          // If the spot has started more than 2 hours ago, mark for deletion
          if (now - startTime > 2 * 60 * 60 * 1000) {
            deletePromises.push(deleteDoc(doc.ref));
          } else {
            // Check if all spots are taken
            const teamMembers = spot.teamMembers || [];
            const maxTeamSize = spot.maxTeamSize || 1;
            
            if (teamMembers.length >= maxTeamSize) {
              // If team is full, only show if the current user is a member
              const isMember = teamMembers.some(member => 
                member.userId === user?.uid || member.id === user?.uid
              );
              
              if (isMember) {
                fetchedSpots.push(spot);
              }
            } else {
              // Team has open spots
              fetchedSpots.push(spot);
            }
          }
        });

        // Delete expired or completed spots
        if (deletePromises.length > 0) {
          await Promise.all(deletePromises);
          console.log(`Cleaned up ${deletePromises.length} expired or completed quests`);
        }

        // Sort spots by start time (closest first)
        fetchedSpots.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        
        setSpots(fetchedSpots);
        setError(null);
      } catch (err) {
        console.error('Error fetching spots:', err);
        setError('Failed to load spots. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (!quests) {
      fetchAndCleanSpots();
      
      // Set up periodic cleanup
      const cleanup = setInterval(fetchAndCleanSpots, 60 * 1000); // Check every minute
      
      return () => clearInterval(cleanup);
    } else {
      // Filter out completed quests from passed-in quests
      const filteredQuests = quests.filter(quest => 
        quest.status !== 'completed' && 
        quest.status !== 'expired'
      );
      setSpots(filteredQuests);
      setLoading(false);
    }
  }, [quests, user?.uid]);

  // Handler for quest completion/removal
  const handleQuestComplete = (questId) => {
    setSpots(prev => prev.filter(quest => quest.id !== questId));
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-4">
        <div className="text-center text-red-600 bg-red-50 rounded-lg p-4 w-full max-w-md shadow-sm">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Use spots state for display
  const displayQuests = spots;

  if (displayQuests.length === 0) {
    return (
      <div className="flex justify-center p-6">
        <div className="text-center text-gray-600 bg-gray-50 rounded-lg p-6 w-full max-w-md shadow-sm">
          <p className="text-lg font-medium">No quests available</p>
          <p className="mt-2 text-sm text-gray-500">Check back later for new adventures!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        {displayQuests.map((quest) => (
          <AnimatePresence key={quest.id || `quest-${Math.random().toString(36).substring(2)}`} mode="popLayout">
            <QuestCard 
              key={quest.id || `quest-${Math.random().toString(36).substring(2)}`} 
              quest={{
                ...quest,
                teamMembers: quest.teamMembers || [],
                tags: quest.tags || []
              }}
              onQuestComplete={handleQuestComplete}
            />
          </AnimatePresence>
        ))}
      </motion.div>
    </div>
  );
} 