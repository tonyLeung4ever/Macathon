import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast'; 
import { submitFeedback } from '../pages/feedbackService'; 

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    enjoyment: '',
    difficulty: '',
    socialFit: '',
    wouldRepeat: '',
    comments: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await submitFeedback(form);
    } catch (error) {
      console.error('❌ Error submitting feedback (ignored):', error);
      // No error toast shown
    } finally {
      toast.success('🌱 Thanks for your feedback!', {
        style: {
          background: '#D1FAE5',
          color: '#065F46',
          fontWeight: 'bold',
        },
        iconTheme: {
          primary: '#065F46',
          secondary: '#D1FAE5',
        },
      });

      setForm({
        enjoyment: '',
        difficulty: '',
        socialFit: '',
        wouldRepeat: '',
        comments: ''
      });

      setTimeout(() => navigate('/dashboard'), 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-b from-emerald-100 to-amber-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="bg-white shadow-lg rounded-lg p-10 max-w-3xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-emerald-900 text-center mb-8">
            Share Your SideQuest Experience 🌿
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="number"
                name="enjoyment"
                placeholder="Enjoyment (1–5)"
                min="1"
                max="5"
                value={form.enjoyment}
                onChange={handleChange}
                className="border-2 border-emerald-200 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="border-2 border-emerald-200 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Difficulty</option>
                <option value="too_easy">Too Easy</option>
                <option value="just_right">Just Right</option>
                <option value="too_hard">Too Hard</option>
              </select>
            </div>
            <div>
              <select
                name="socialFit"
                value={form.socialFit}
                onChange={handleChange}
                className="border-2 border-emerald-200 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Social Fit</option>
                <option value="loved_group">Loved Group</option>
                <option value="prefer_solo">Prefer Solo</option>
              </select>
            </div>
            <div>
              <select
                name="wouldRepeat"
                value={form.wouldRepeat}
                onChange={handleChange}
                className="border-2 border-emerald-200 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Would Repeat?</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div>
              <textarea
                name="comments"
                placeholder="Additional Comments"
                value={form.comments}
                onChange={handleChange}
                className="border-2 border-emerald-200 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="px-8 py-4 bg-emerald-700 text-amber-50 rounded-lg hover:bg-emerald-800 transition-colors shadow-md hover:shadow-lg"
              >
                Submit Feedback 🌱
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FeedbackPage;
