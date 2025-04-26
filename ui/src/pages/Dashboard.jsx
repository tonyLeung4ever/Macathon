// import { useEffect, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useAuth } from '../contexts/AuthContext';
// import QuestList from '../components/matching/QuestList';
// import ActiveQuestCard from '../components/matching/ActiveQuestCard';
// import { initializeDummyData } from '../config/firebase';
// import { SparklesIcon as SparklesIconOutline } from '@heroicons/react/24/outline';
// import { UserGroupIcon as UserGroupIconOutline } from '@heroicons/react/24/outline';
// import { TrophyIcon as TrophyIconOutline } from '@heroicons/react/24/outline';

// export default function Dashboard() {
//   const { user } = useAuth();
//   const [isDarkMode, setIsDarkMode] = useState(false);

//   useEffect(() => {
//     const initData = async () => {
//       if (process.env.NODE_ENV === 'development') {
//         try {
//           await initializeDummyData();
//         } catch (error) {
//           console.warn('Failed to initialize dummy data:', error);
//         }
//       }
//     };
    
//     initData();
//   }, []);

//   const toggleTheme = () => {
//     setIsDarkMode(!isDarkMode);
//     document.documentElement.classList.toggle('dark');
//   };

//   return (
//     <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-amber-50 to-emerald-50'}`}>
//       {/* Theme Toggle */}
//       <button
//         onClick={toggleTheme}
//         className="fixed top-4 right-16 md:right-4 z-40 p-2 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-colors"
//       >
//         {isDarkMode ? '\u{1F31E}' : '\u{1F319}'}
//       </button>

//       {/* Ambient Background Elements */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute inset-0 bg-[url('/src/assets/parchment-texture.png')] opacity-5"></div>
//         <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-emerald-100/20"></div>
//       </div>

//       <div className="container mx-auto px-4 py-8 relative">
//         {/* Welcome Section */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="mb-8"
//         >
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-emerald-900'}`}>
//                 Welcome, {user?.displayName || 'Explorer'}!
//               </h1>
//               <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-emerald-700'}`}>
//                 Ready to embark on your next adventure?
//               </p>
//             </div>
//             <div className="flex items-center">
//               <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-emerald-500 flex items-center justify-center text-white text-2xl">
//                 {user?.displayName?.[0]?.toUpperCase() || 'E'}
//               </div>
//             </div>
//           </div>
//         </motion.div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Main Content */}
//           <div className="lg:col-span-2">
//             {/* Quest List */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5 }}
//               className={`rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
//             >
//               <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-emerald-900'}`}>
//                 Available Quests
//               </h2>
//               <QuestList />
//             </motion.div>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Active Quest */}
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//               className={`rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
//             >
//               <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-emerald-900'}`}>
//                 Active Quest
//               </h2>
//               {user?.activeQuestId ? (
//                 <ActiveQuestCard questId={user.activeQuestId} />
//               ) : (
//                 <div className="text-center py-8">
//                   <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                     No active quest. Join one to get started!
//                   </p>
//                 </div>
//               )}
//             </motion.div>

//             {/* Progress Panel */}
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.5, delay: 0.3 }}
//               className={`rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
//             >
//               <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-emerald-900'}`}>
//                 Your Progress
//               </h2>
//               <div className="space-y-6">
//                 <div className="flex items-center space-x-4">
//                   <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
//                     <TrophyIconOutline className="w-6 h-6 text-emerald-600" />
//                   </div>
//                   <div>
//                     <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                       Completed Quests
//                     </p>
//                     <p className="text-2xl font-bold text-emerald-600">
//                       {user?.completedQuests?.length || 0}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-4">
//                   <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
//                     <SparklesIconOutline className="w-6 h-6 text-amber-600" />
//                   </div>
//                   <div>
//                     <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                       Skills Unlocked
//                     </p>
//                     <p className="text-2xl font-bold text-amber-600">
//                       {user?.unlockedSkills?.length || 0}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-4">
//                   <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
//                     <UserGroupIconOutline className="w-6 h-6 text-blue-600" />
//                   </div>
//                   <div>
//                     <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                       Team Members
//                     </p>
//                     <p className="text-2xl font-bold text-blue-600">
//                       {user?.teamMembers?.length || 0}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// } 


import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ added for redirect
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import QuestList from '../components/matching/QuestList';
import ActiveQuestCard from '../components/matching/ActiveQuestCard';
import { initializeDummyData } from '../config/firebase';
import { SparklesIcon as SparklesIconOutline } from '@heroicons/react/24/outline';
import { UserGroupIcon as UserGroupIconOutline } from '@heroicons/react/24/outline';
import { TrophyIcon as TrophyIconOutline } from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate(); // ✅ added
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const initData = async () => {
      if (process.env.NODE_ENV === 'development') {
        try {
          await initializeDummyData();
        } catch (error) {
          console.warn('Failed to initialize dummy data:', error);
        }
      }
    };
    initData();
  }, []);



  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-amber-50 to-emerald-50'}`}>
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-16 md:right-4 z-40 p-2 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-colors"
      >
        {isDarkMode ? '\u{1F31E}' : '\u{1F319}'}
      </button>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('/src/assets/parchment-texture.png')] opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-emerald-100/20"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative">
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
            </div>
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-emerald-500 flex items-center justify-center text-white text-2xl">
                {user?.displayName?.[0]?.toUpperCase() || 'E'}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-emerald-900'}`}>
                Available Quests
              </h2>
              <QuestList />
            </motion.div>
          </div>

          <div className="space-y-6">
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
