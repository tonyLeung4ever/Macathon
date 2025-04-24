import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, getDocs, deleteDoc } from 'firebase/firestore';
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

export default function QuestList() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAndCleanSpots = async () => {
      try {
        setLoading(true);
        const spotsRef = collection(db, 'quests');
        const q = query(spotsRef);
        const querySnapshot = await getDocs(q);
        
        const now = new Date();
        const fetchedSpots = [];
        const deletePromises = [];

        querySnapshot.forEach((doc) => {
          const spot = { id: doc.id, ...doc.data() };
          const startTime = new Date(spot.startTime);
          
          // If the spot has started more than 2 hours ago, delete it
          if (now - startTime > 2 * 60 * 60 * 1000) {
            deletePromises.push(deleteDoc(doc.ref));
          } else {
            fetchedSpots.push(spot);
          }
        });

        // Delete expired spots
        if (deletePromises.length > 0) {
          await Promise.all(deletePromises);
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

    fetchAndCleanSpots();
    
    // Set up periodic cleanup
    const cleanup = setInterval(fetchAndCleanSpots, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(cleanup);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4 py-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4 py-6">
        <div className="text-center text-red-600 bg-red-50 rounded-lg p-4 w-full max-w-sm shadow-sm">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (spots.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4 py-6">
        <div className="text-center text-gray-600 bg-gray-50 rounded-lg p-6 w-full max-w-sm shadow-sm">
          <p className="text-lg font-medium">No spots available</p>
          <p className="mt-2 text-sm text-gray-500">Check back later for new opportunities!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
      >
        {spots.map((spot) => (
          <motion.div
            key={spot.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full"
          >
            <QuestCard quest={spot} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
} 