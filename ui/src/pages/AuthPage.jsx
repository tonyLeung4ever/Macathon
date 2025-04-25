import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-emerald-50 relative overflow-hidden">
      {/* Ambient Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('/src/assets/parchment-texture.png')] opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-emerald-100/20"></div>
      </div>

      <div className="max-w-md mx-auto pt-8 px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-100"
        >
          <div className="flex justify-center space-x-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLogin(true)}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                isLogin
                  ? 'bg-emerald-800 text-amber-100 shadow-md'
                  : 'text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLogin(false)}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                !isLogin
                  ? 'bg-emerald-800 text-amber-100 shadow-md'
                  : 'text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              Sign Up
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              {isLogin ? <LoginForm /> : <SignupForm />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      <div className="fixed top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
    </div>
  );
} 