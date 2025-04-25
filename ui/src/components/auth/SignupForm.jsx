import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      
      const userData = {
        displayName,
        tasteProfile: {
          interests: [],
          skillLevel: 1,
          preferredTeamSize: 2,
          personalityTraits: []
        }
      };
      const user = await signUp(email, password, userData);
      
      await setDoc(doc(db, 'userPreferences', user.uid), {
        interests: [],
        skillLevel: 1,
        preferredTeamSize: 2,
        availableHoursPerWeek: 5,
        personalityTraits: []
      });

      navigate('/onboarding');
    } catch (error) {
      setError('Failed to create an account: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-display font-bold text-gradient"
        >
          Join the Adventure
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-app text-emerald-700"
        >
          Create your account and start your journey
        </motion.p>
      </div>

      <motion.form 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-6" 
        onSubmit={handleSubmit}
      >
        <div className="space-y-5">
          <div>
            <label htmlFor="display-name" className="block text-sm font-display font-medium text-emerald-800">
              Display Name
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              id="display-name"
              name="displayName"
              type="text"
              required
              className="font-app mt-1 block w-full px-4 py-3 bg-white/80 border-2 border-emerald-100 rounded-lg text-emerald-900 placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
              placeholder="Choose your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email-address" className="block text-sm font-display font-medium text-emerald-800">
              Email
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="font-app mt-1 block w-full px-4 py-3 bg-white/80 border-2 border-emerald-100 rounded-lg text-emerald-900 placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-display font-medium text-emerald-800">
              Password
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="font-app mt-1 block w-full px-4 py-3 bg-white/80 border-2 border-emerald-100 rounded-lg text-emerald-900 placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-display font-medium text-emerald-800">
              Confirm Password
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="font-app mt-1 block w-full px-4 py-3 bg-white/80 border-2 border-emerald-100 rounded-lg text-emerald-900 placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm font-app text-center bg-red-50 p-3 rounded-lg border border-red-100"
          >
            {error}
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-3 px-4 border-2 border-emerald-700 rounded-lg text-base font-display font-semibold text-amber-50 bg-emerald-800 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 ${
            loading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-amber-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Create Account'
          )}
        </motion.button>
      </motion.form>
    </div>
  );
} 