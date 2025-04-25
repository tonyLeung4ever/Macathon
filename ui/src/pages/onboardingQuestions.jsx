import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { auth } from '../config/firebase';
import onboardingQuestions from '../services/data/onboardingQuestions.json';

export default function PersonalityQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [tagTally, setTagTally] = useState({});
  const navigate = useNavigate();

  const handleAnswer = (optionKey) => {
    const selected = onboardingQuestions[currentQuestion].answers[optionKey];

    const updatedTally = { ...tagTally };
    selected.tags.forEach((tag) => {
      updatedTally[tag] = (updatedTally[tag] || 0) + 1;
    });

    setTagTally(updatedTally);
    setCurrentQuestion(currentQuestion + 1);
  };

  // When quiz completes, save tally to user doc in Firestore
  useEffect(() => {
    const saveProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          'tasteProfile.personalityTraits': tagTally,
          updatedAt: new Date().toISOString()
        });
        navigate('/dashboard');
      } catch (error) {
        console.error("Failed to save personality profile:", error);
      }
    };

    if (currentQuestion >= onboardingQuestions.length) {
      saveProfile();
    }
  }, [currentQuestion, tagTally, navigate]);

  if (currentQuestion >= onboardingQuestions.length) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold">Saving your profile...</h2>
      </div>
    );
  }

  const q = onboardingQuestions[currentQuestion];

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">{q.question}</h2>
      <div className="grid gap-2">
        {Object.entries(q.answers).map(([key, answer]) => (
          <button
            key={key}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            onClick={() => handleAnswer(key)}
          >
            {key}. {answer.text}
          </button>
        ))}
      </div>
    </div>
  );
}
