import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, arrayUnion, getDoc } from 'firebase/firestore';

// Calculate match score between user and quest
const calculateMatchScore = (userPreferences, quest) => {
  let score = 0;
  let totalFactors = 0;

  // Match interests (40% weight)
  const interestMatch = userPreferences.interests.filter(interest => 
    quest.tags.includes(interest)
  ).length;
  score += (interestMatch / Math.max(userPreferences.interests.length, quest.tags.length)) * 40;
  totalFactors += 40;

  // Match skill level (30% weight)
  const skillDiff = Math.abs(userPreferences.skillLevel - quest.requiredSkillLevel);
  score += (1 - skillDiff / 4) * 30; // Assuming skill levels are 1-5
  totalFactors += 30;

  // Match team size preference (20% weight)
  const teamSizeDiff = Math.abs(userPreferences.preferredTeamSize - quest.maxTeamSize);
  score += (1 - teamSizeDiff / 3) * 20; // Normalize by max possible difference
  totalFactors += 20;

  // Time commitment match (10% weight)
  const timeMatch = userPreferences.availableHoursPerWeek >= quest.estimatedHours ? 10 : 5;
  score += timeMatch;
  totalFactors += 10;

  return (score / totalFactors) * 100;
};

// Find matching quests for a user
export const findMatchingQuests = async (userId) => {
  try {
    // Get user preferences
    const userPrefsDoc = await getDoc(doc(db, 'userPreferences', userId));
    
    // Default preferences if none exist
    const userPreferences = userPrefsDoc.exists() ? userPrefsDoc.data() : {
      interests: [],
      skillLevel: 1,
      preferredTeamSize: 2,
      availableHoursPerWeek: 5
    };

    // Get all available quests
    const questsSnapshot = await getDocs(collection(db, 'quests'));
    const quests = [];

    for (const questDoc of questsSnapshot.docs) {
      const quest = { id: questDoc.id, ...questDoc.data() };
      
      // If no user preferences exist, return all quests with a default score
      const matchScore = userPrefsDoc.exists() 
        ? calculateMatchScore(userPreferences, quest)
        : 75; // Default match score for new users

      // Include all quests for new users, or quests with good match for existing users
      if (!userPrefsDoc.exists() || matchScore > 70) {
        quests.push({
          ...quest,
          matchScore
        });
      }
    }

    // Sort by match score
    return quests.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error('Error finding matching quests:', error);
    throw error;
  }
};

// Find potential teammates for a quest
export const findPotentialTeammates = async (questId, userId) => {
  try {
    // Get quest details
    const questDoc = await getDoc(doc(db, 'quests', questId));
    const quest = questDoc.data();

    // Get all user preferences
    const userPrefsSnapshot = await getDocs(collection(db, 'userPreferences'));
    const potentialTeammates = [];

    for (const userPrefDoc of userPrefsSnapshot.docs) {
      if (userPrefDoc.id === userId) continue; // Skip current user

      const userPreferences = userPrefDoc.data();
      const matchScore = calculateMatchScore(userPreferences, quest);

      if (matchScore > 70) {
        potentialTeammates.push({
          userId: userPrefDoc.id,
          preferences: userPreferences,
          matchScore
        });
      }
    }

    return potentialTeammates.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error('Error finding potential teammates:', error);
    throw error;
  }
};

// Join a quest
export const joinQuest = async (questId, userId) => {
  try {
    const questRef = doc(db, 'quests', questId);
    const questDoc = await getDoc(questRef);
    const quest = questDoc.data();

    if (quest.currentTeamSize >= quest.maxTeamSize) {
      throw new Error('Quest team is already full');
    }

    // Add user to quest's interested users
    await updateDoc(questRef, {
      interestedUsers: arrayUnion(userId),
      currentTeamSize: (quest.currentTeamSize || 0) + 1
    });

    // Check if quest can be activated
    if ((quest.currentTeamSize || 0) + 1 >= quest.minTeamSize) {
      // Create active quest
      await addDoc(collection(db, 'activeQuests'), {
        questId,
        teamMembers: [...(quest.interestedUsers || []), userId],
        startDate: new Date().toISOString(),
        status: 'active'
      });

      // Update original quest status
      await updateDoc(questRef, { status: 'active' });
    }

    return true;
  } catch (error) {
    console.error('Error joining quest:', error);
    throw error;
  }
};

// Initialize dummy data
export const initializeDummyData = async () => {
  try {
    // Dummy quests
    const dummyQuests = [
      {
        title: "Urban Photography Adventure",
        description: "Explore the city through your lens",
        tags: ["photography", "art", "urban"],
        requiredSkillLevel: 2,
        maxTeamSize: 3,
        minTeamSize: 2,
        estimatedHours: 4,
        status: "open",
        currentTeamSize: 0,
        interestedUsers: [],
        location: "City Center",
        duration: "1 week"
      },
      {
        title: "Community Garden Project",
        description: "Create a sustainable garden space",
        tags: ["gardening", "environment", "community"],
        requiredSkillLevel: 1,
        maxTeamSize: 4,
        minTeamSize: 2,
        estimatedHours: 6,
        status: "open",
        currentTeamSize: 0,
        interestedUsers: [],
        location: "Local Park",
        duration: "2 weeks"
      },
      {
        title: "Game Development Workshop",
        description: "Build a simple game together",
        tags: ["coding", "gaming", "creativity"],
        requiredSkillLevel: 3,
        maxTeamSize: 3,
        minTeamSize: 2,
        estimatedHours: 8,
        status: "open",
        currentTeamSize: 0,
        interestedUsers: [],
        location: "Online",
        duration: "3 weeks"
      }
    ];

    // Add quests to Firestore
    for (const quest of dummyQuests) {
      await addDoc(collection(db, 'quests'), quest);
    }

    // Dummy user preferences
    const dummyPreferences = [
      {
        userId: "user1",
        interests: ["photography", "art", "urban"],
        skillLevel: 2,
        preferredTeamSize: 3,
        availableHoursPerWeek: 5,
        personalityTraits: ["creative", "outgoing"],
        location: "City Center"
      },
      {
        userId: "user2",
        interests: ["gardening", "environment"],
        skillLevel: 1,
        preferredTeamSize: 4,
        availableHoursPerWeek: 8,
        personalityTraits: ["patient", "organized"],
        location: "Suburbs"
      },
      {
        userId: "user3",
        interests: ["coding", "gaming"],
        skillLevel: 3,
        preferredTeamSize: 3,
        availableHoursPerWeek: 10,
        personalityTraits: ["analytical", "creative"],
        location: "Online"
      }
    ];

    // Add user preferences to Firestore
    for (const prefs of dummyPreferences) {
      await addDoc(collection(db, 'userPreferences'), prefs);
    }

    console.log('Dummy data initialized successfully');
  } catch (error) {
    console.error('Error initializing dummy data:', error);
    throw error;
  }
}; 