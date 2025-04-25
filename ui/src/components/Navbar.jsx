import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="bg-gradient-to-r from-emerald-800 to-emerald-700 relative z-50 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <Link 
              to="/" 
              className="font-display text-2xl font-bold text-amber-50 hover:text-amber-100 transition-colors duration-300 tracking-wide"
            >
              SideQuest
            </Link>
          </motion.div>
          <div className="hidden md:flex md:items-center md:space-x-6">
            {user ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link 
                    to="/dashboard" 
                    className="font-display font-medium text-amber-50 hover:bg-emerald-600/50 px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 border border-emerald-600/30"
                  >
                    <span>Dashboard</span>
                  </Link>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleSignOut}
                  className="font-display font-medium text-amber-50 hover:bg-emerald-600/50 px-4 py-2 rounded-lg transition-all duration-300 border border-emerald-600/30"
                >
                  Sign Out
                </motion.button>
              </>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link 
                  to="/auth" 
                  className="font-display font-medium text-amber-50 hover:bg-emerald-600/50 px-4 py-2 rounded-lg transition-all duration-300 border border-emerald-600/30"
                >
                  Sign In
                </Link>
              </motion.div>
            )}
          </div>
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-amber-50 hover:bg-emerald-600/50 p-2 rounded-lg transition-colors focus:outline-none border border-emerald-600/30"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-16 inset-x-0 bg-gradient-to-r from-emerald-800 to-emerald-700 border-t border-emerald-600/30 shadow-lg"
          >
            <div className="px-4 py-2 space-y-1">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="font-display font-medium block text-amber-50 hover:bg-emerald-600/50 px-3 py-2 rounded-lg transition-colors border border-emerald-600/30"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="font-display font-medium w-full text-left text-amber-50 hover:bg-emerald-600/50 px-3 py-2 rounded-lg transition-colors border border-emerald-600/30"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-display font-medium block text-amber-50 hover:bg-emerald-600/50 px-3 py-2 rounded-lg transition-colors border border-emerald-600/30"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
} 