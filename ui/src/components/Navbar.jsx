import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { SparklesIcon, HomeIcon, UserCircleIcon, BookOpenIcon, MapIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll position to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      className={`${
        scrolled 
          ? "bg-gradient-to-r from-emerald-900 to-emerald-800 shadow-xl"
          : "bg-gradient-to-r from-emerald-800 to-emerald-700"
      } sticky top-0 z-50 shadow-lg transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <Link 
              to="/" 
              className="font-display text-2xl font-bold text-amber-50 hover:text-amber-100 transition-colors duration-300 tracking-wide flex items-center gap-2"
            >
              <SparklesIcon className="h-6 w-6 text-amber-200" />
              <span className="bg-gradient-to-r from-amber-100 to-emerald-100 bg-clip-text text-transparent">SideQuest</span>
            </Link>
          </motion.div>
          
          {/* Navigation Links - Hidden on Mobile */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <Link 
                to="/" 
                className="font-medium text-amber-50 hover:text-amber-100 px-3 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
              >
                <HomeIcon className="h-5 w-5" />
                <span>Home</span>
              </Link>
              <motion.div 
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-200 origin-left"
              />
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <Link 
                to="/about" 
                className="font-medium text-amber-50 hover:text-amber-100 px-3 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
              >
                <BookOpenIcon className="h-5 w-5" />
                <span>About</span>
              </Link>
              <motion.div 
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-200 origin-left"
              />
            </motion.div>
            
            {user ? (
              <>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="relative group"
                >
                  <Link 
                    to="/dashboard" 
                    className="font-medium text-amber-50 hover:text-amber-100 px-3 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
                  >
                    <MapIcon className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-200 origin-left"
                  />
                </motion.div>
                
                <div className="h-6 w-px bg-emerald-500/50 mx-2"></div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleSignOut}
                  className="font-medium text-amber-50 bg-emerald-600/40 hover:bg-emerald-600/60 px-4 py-2 rounded-lg transition-all duration-300 border border-emerald-500/30 flex items-center gap-2"
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span>Sign Out</span>
                </motion.button>
              </>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link 
                  to="/auth" 
                  className="font-medium text-amber-50 bg-emerald-600/40 hover:bg-emerald-600/60 px-4 py-2 rounded-lg transition-all duration-300 border border-emerald-500/30 flex items-center gap-2"
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span>Sign In</span>
                </Link>
              </motion.div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
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
      
      {/* Mobile Menu */}
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
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="font-medium block text-amber-50 hover:bg-emerald-600/50 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <HomeIcon className="h-5 w-5" />
                <span>Home</span>
              </Link>
              
              <Link
                to="/about"
                onClick={() => setIsMenuOpen(false)}
                className="font-medium block text-amber-50 hover:bg-emerald-600/50 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <BookOpenIcon className="h-5 w-5" />
                <span>About</span>
              </Link>
              
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="font-medium block text-amber-50 hover:bg-emerald-600/50 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <MapIcon className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <button
                    onClick={handleSignOut}
                    className="font-medium w-full text-left text-amber-50 hover:bg-emerald-600/50 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <UserCircleIcon className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-medium block text-amber-50 hover:bg-emerald-600/50 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
} 