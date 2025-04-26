import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import QuestList from '../components/matching/QuestList';
import ActiveQuestCard from '../components/matching/ActiveQuestCard';
import { initializeDummyData } from '../config/firebase';
import { SparklesIcon as SparklesIconOutline } from '@heroicons/react/24/outline';
import { UserGroupIcon as UserGroupIconOutline } from '@heroicons/react/24/outline';
import { TrophyIcon as TrophyIconOutline } from '@heroicons/react/24/outline';
import { matchSideQuests } from '../utils/matchSideQuests';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Helper function to add start times to quests
const addStartTimesToQuests = (quests) => {
  const now = new Date();
  
  // Set start times between 1 hour and 24 hours from now
  return quests.map(quest => {
    if (!quest.startTime) {
      const randomHours = 1 + Math.floor(Math.random() * 23); // 1-24 hours
      const startTime = new Date(now.getTime() + randomHours * 60 * 60 * 1000);
      return {
        ...quest,
        startTime: startTime.toISOString(),
        teamMembers: quest.teamMembers || []
      };
    }
    return quest;
  });
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [recommendedQuests, setRecommendedQuests] = useState([]);
  const [loadingQuests, setLoadingQuests] = useState(true);
  const [initialSetupComplete, setInitialSetupComplete] = useState(false);

  // Initialize user data in Firestore if needed
  useEffect(() => {
    const initializeUserData = async () => {
      if (!user || !user.uid || initialSetupComplete) return;
      
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          // Create initial user document
          await setDoc(userRef, {
            displayName: user.displayName || 'Explorer',
            email: user.email,
            createdAt: new Date().toISOString(),
            completedQuests: [],
            unlockedSkills: [],
            teamMembers: [],
            tasteProfile: {
              personalityTraits: {
                creative: 5,
                outdoorsy: 3,
                social: 4,
                active: 4,
                reflective: 3
              }
            }
          });
          console.log("Created new user profile");
        }
        setInitialSetupComplete(true);
      } catch (error) {
        console.error("Error initializing user data:", error);
      }
    };
    
    initializeUserData();
  }, [user, initialSetupComplete]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (loading || !user || !user.uid) {
        return;
      }
  
      try {
        setLoadingQuests(true);
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        const traits = userData?.tasteProfile?.personalityTraits || {
          creative: 5,
          outdoorsy: 3,
          social: 4,
          active: 4,
          reflective: 3
        };
  
        // Get quest recommendations and add start times
        const matchedQuests = matchSideQuests(traits);
        const questsWithStartTimes = addStartTimesToQuests(matchedQuests);
        
        setRecommendedQuests(questsWithStartTimes);
      } catch (error) {
        console.error('Error loading recommended quests:', error);
      } finally {
        setLoadingQuests(false);
      }
    };
  
    fetchRecommendations();
  }, [user, loading, initialSetupComplete]);
  

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // If auth is still loading, show a loading spinner
  if (loading || loadingQuests) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-amber-50 to-emerald-50'}`}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-16 md:right-4 z-40 p-2 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-colors"
      >
        {isDarkMode ? '\u{1F31E}' : '\u{1F319}'}
      </button>

      {/* Ambient Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('/src/assets/parchment-texture.png')] opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-emerald-100/20"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-emerald-900'}`}>
                Welcome, {user?.displayName || 'Explorer'}!
              </h1>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-emerald-700'}`}>
                Ready to embark on your next adventure?
              </p>
              {user && <p className="text-xs text-gray-400">User ID: {user.uid}</p>}
            </div>
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-emerald-500 flex items-center justify-center text-white text-2xl">
                {user?.displayName?.[0]?.toUpperCase() || 'E'}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Quest List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-emerald-900'}`}>
                Available Quests
              </h2>
              <QuestList quests={recommendedQuests} />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Quest */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-emerald-900'}`}>
                Active Quest
              </h2>
              {user?.activeQuestId ? (
                <ActiveQuestCard questId={user.activeQuestId} />
              ) : (
                <div className="text-center py-8">
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No active quest. Join one to get started!
                  </p>
                </div>
              )}
            </motion.div>

            {/* Progress Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-emerald-900'}`}>
                Your Progress
              </h2>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <TrophyIconOutline className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Completed Quests
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {user?.completedQuests?.length || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <SparklesIconOutline className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Skills Unlocked
                    </p>
                    <p className="text-2xl font-bold text-amber-600">
                      {user?.unlockedSkills?.length || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserGroupIconOutline className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Team Members
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {user?.teamMembers?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 