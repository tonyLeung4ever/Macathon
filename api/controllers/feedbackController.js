
// const { db } = require('../firebase');

// const submitFeedback = async (req, res) => {
//   try {
//     const {
//       userId,
//       questId,
//       enjoyment,
//       difficulty,
//       socialFit,
//       wouldRepeat,
//       comments
//     } = req.body;

//     if (!enjoyment || !difficulty || !socialFit || !wouldRepeat) {
//       return res.status(400).json({ message: 'Missing required feedback fields' });
//     }

//     const feedbackData = {
//       userId,
//       questId,
//       enjoyment,
//       difficulty,
//       socialFit,
//       wouldRepeat,
//       comments,
//       timestamp: new Date()
//     };

//     await db.collection('feedbacks').add(feedbackData);

//     console.log('✅ Feedback saved to Firestore:', feedbackData);

//     res.status(200).json({ message: 'Feedback saved to Firebase' });
//   } catch (error) {
//     console.error('❌ Error saving feedback:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// module.exports = {
//   submitFeedback,
// };
