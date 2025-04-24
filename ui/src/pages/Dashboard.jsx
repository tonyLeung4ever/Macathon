import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import QuestList from '../components/matching/QuestList';
import ActiveQuestCard from '../components/matching/ActiveQuestCard';
import { initializeDummyData } from '../config/firebase';

export default function Dashboard() {
  const { user } = useAuth();

  useEffect(() => {
    const initData = async () => {
      if (process.env.NODE_ENV === 'development') {
        try {
          await initializeDummyData();
        } catch (error) {
          console.warn('Failed to initialize dummy data:', error);
          // Continue execution even if dummy data fails
        }
      }
    };
    
    initData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.displayName || 'Explorer'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Ready to embark on your next adventure?
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Available Quests
            </h2>
            <QuestList />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Active Quest
            </h2>
            {user?.activeQuestId ? (
              <ActiveQuestCard questId={user.activeQuestId} />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No active quest. Join one to get started!
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Progress
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Completed Quests
                </p>
                <p className="text-2xl font-bold text-emerald-600">
                  {user?.completedQuests?.length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Skills Unlocked
                </p>
                <p className="text-2xl font-bold text-emerald-600">
                  {user?.unlockedSkills?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 