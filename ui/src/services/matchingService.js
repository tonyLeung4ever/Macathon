import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, arrayUnion, getDoc, deleteDoc } from 'firebase/firestore';

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

// Clean up all existing data
export const cleanupDatabase = async () => {
  try {
    // Delete all quests
    const questsSnapshot = await getDocs(collection(db, 'quests'));
    for (const doc of questsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Delete all user preferences
    const prefsSnapshot = await getDocs(collection(db, 'userPreferences'));
    for (const doc of prefsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    console.log('Database cleaned successfully');
  } catch (error) {
    console.error('Error cleaning database:', error);
    throw error;
  }
};

// Quest templates for initialization
const questTemplates = [
  {
    title: "Macalester History Hunt",
    description: "Explore the rich history of Macalester College by finding and documenting historical landmarks on campus.",
    tags: ["exploration", "history", "photography"],
    requiredSkillLevel: 1,
    minTeamSize: 2,
    maxTeamSize: 4,
    location: "Macalester Campus",
    durationHours: 2
  },
  {
    title: "Campus Sustainability Project",
    description: "Work together to identify and implement eco-friendly initiatives around campus.",
    tags: ["environment", "teamwork", "planning"],
    requiredSkillLevel: 2,
    minTeamSize: 3,
    maxTeamSize: 5,
    location: "Campus Grounds",
    durationHours: 3
  },
  {
    title: "Local Business Connection",
    description: "Visit and interview local business owners in the neighborhood to strengthen community ties.",
    tags: ["community", "communication", "research"],
    requiredSkillLevel: 2,
    minTeamSize: 2,
    maxTeamSize: 3,
    location: "Grand Avenue",
    durationHours: 2
  },
  {
    title: "Art Installation Challenge",
    description: "Create a temporary art installation using sustainable materials found on campus.",
    tags: ["creativity", "art", "sustainability"],
    requiredSkillLevel: 1,
    minTeamSize: 2,
    maxTeamSize: 4,
    location: "Janet Wallace Fine Arts Center",
    durationHours: 4
  },
  {
    title: "Cultural Exchange Fair",
    description: "Organize a mini cultural exchange event showcasing different traditions and customs.",
    tags: ["culture", "organization", "social"],
    requiredSkillLevel: 2,
    minTeamSize: 3,
    maxTeamSize: 6,
    location: "Campus Center",
    durationHours: 3
  },
  {
    title: "Tech Support Workshop",
    description: "Help fellow students with basic tech issues and share digital literacy tips.",
    tags: ["technology", "teaching", "helping"],
    requiredSkillLevel: 3,
    minTeamSize: 2,
    maxTeamSize: 4,
    location: "Library",
    durationHours: 2
  }
];

// Function to initialize quests
export async function initializeQuests() {
  await cleanupDatabase();
  
  const now = new Date();
  const timeSlots = [9, 11, 13, 15, 17, 19]; // 9 AM, 11 AM, 1 PM, 3 PM, 5 PM, 7 PM
  
  const createPromises = questTemplates.map((template, index) => {
    const eventTime = new Date(now);
    eventTime.setHours(timeSlots[index], 0, 0, 0);
    
    // If the time has passed today, schedule for tomorrow
    if (eventTime < now) {
      eventTime.setDate(eventTime.getDate() + 1);
    }
    
    const quest = {
      ...template,
      status: 'forming',
      currentTeamSize: 0,
      teamMembers: [],
      eventTime: eventTime.toISOString(),
      createdAt: new Date().toISOString()
    };
    
    return addDoc(collection(db, 'quests'), quest);
  });
  
  await Promise.all(createPromises);
}

// Clean up expired quests
export const cleanupExpiredQuests = async () => {
  try {
    const now = new Date();
    const questsSnapshot = await getDocs(collection(db, 'quests'));
    
    for (const questDoc of questsSnapshot.docs) {
      const quest = questDoc.data();
      const startTime = quest.startTime?.toDate();
      const endTime = quest.endTime?.toDate();
      
      // Check if quest has expired (24 hours after end time or start time if no end time)
      const expiryTime = endTime || startTime;
      if (expiryTime && (now - expiryTime) > (24 * 60 * 60 * 1000)) {
        // Get all users who have this as their active quest
        const usersSnapshot = await getDocs(
          query(collection(db, 'users'), where('activeQuestId', '==', questDoc.id))
        );
        
        // Clean up user states
        for (const userDoc of usersSnapshot.docs) {
          await updateDoc(doc(db, 'users', userDoc.id), {
            activeQuestId: null,
            activeQuestStartDate: null
          });
        }
        
        // Delete the quest
        await deleteDoc(questDoc.ref);
      }
    }
  } catch (error) {
    console.error('Error cleaning up expired quests:', error);
    throw error;
  }
};

// Join a quest
export const joinQuest = async (questId, userId, startSolo = false) => {
  try {
    if (!questId || !userId) {
      throw new Error('Quest ID and User ID are required');
    }

    const questRef = doc(db, 'quests', questId);
    const questDoc = await getDoc(questRef);
    
    if (!questDoc.exists()) {
      throw new Error('Quest not found');
    }
    
    const quest = questDoc.data();
    const now = new Date();
    let eventDateTime = quest.startTime || quest.eventDateTime;
    
    // If eventDateTime is not set or invalid, set it to a default time
    if (!eventDateTime || isNaN(new Date(eventDateTime).getTime())) {
      eventDateTime = now.toISOString();
    }

    // Check if the quest has already started
    if (eventDateTime && new Date(eventDateTime) < now) {
      throw new Error('This quest has already started');
    }

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const user = userDoc.data();

    if (quest.status === 'completed' || quest.status === 'expired') {
      throw new Error('This quest is no longer available');
    }

    const teamMembers = quest.teamMembers || [];
    const currentTeamSize = teamMembers.length;
    const maxTeamSize = quest.maxTeamSize || 4;

    if (currentTeamSize >= maxTeamSize) {
      throw new Error('Quest team is already full');
    }

    if (user.activeQuestId) {
      throw new Error('You already have an active quest');
    }

    // Check if user is already on the team
    if (teamMembers.some(member => member.userId === userId)) {
      throw new Error('You have already joined this quest');
    }

    const teamMember = {
      userId: userId,
      displayName: user.displayName || 'Anonymous Explorer',
      joinedAt: now.toISOString(),
      status: 'active'
    };

    const minTeamSize = quest.minTeamSize || 1;
    const newStatus = (currentTeamSize + 1) >= minTeamSize ? 'active' : 'forming';
    const durationHours = quest.durationHours || parseInt(quest.duration) || 2;
    const endTime = new Date(now.getTime() + (durationHours * 60 * 60 * 1000));

    // Update quest with new team member and timing information
    await updateDoc(questRef, {
      teamMembers: arrayUnion(teamMember),
      currentTeamSize: currentTeamSize + 1,
      status: newStatus,
      startDate: now.toISOString(),
      endTime: endTime.toISOString(),
      lastUpdated: now.toISOString(),
      eventDateTime: eventDateTime
    });

    // Update user with active quest
    await updateDoc(userRef, {
      activeQuestId: questId,
      activeQuestStartDate: now.toISOString(),
      updatedAt: now.toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error joining quest:', error);
    throw error;
  }
};

// Get quest team members
export const getQuestTeamMembers = async (questId) => {
  try {
    const questDoc = await getDoc(doc(db, 'quests', questId));
    if (!questDoc.exists()) {
      throw new Error('Quest not found');
    }
    return questDoc.data().teamMembers || [];
  } catch (error) {
    console.error('Error getting team members:', error);
    throw error;
  }
};

// Complete a quest
export const completeQuest = async (questId, userId) => {
  try {
    if (!questId || !userId) {
      throw new Error('Quest ID and User ID are required');
    }

    const questRef = doc(db, 'quests', questId);
    const questDoc = await getDoc(questRef);
    
    if (!questDoc.exists()) {
      throw new Error('Quest not found');
    }
    
    const quest = questDoc.data();
    
    // Get all team members
    const usersSnapshot = await getDocs(
      query(collection(db, 'users'), where('activeQuestId', '==', questId))
    );
    
    // Update all team members' states
    const updatePromises = usersSnapshot.docs.map(userDoc => {
      const completedQuest = {
        questId,
        completedAt: new Date(),
        title: quest.title || 'Unnamed Quest',
        teamSize: usersSnapshot.size || 1
      };

      return updateDoc(doc(db, 'users', userDoc.id), {
        activeQuestId: null,
        activeQuestStartDate: null,
        completedQuests: arrayUnion(completedQuest)
      });
    });
    
    await Promise.all(updatePromises);
    
    // Update the quest status instead of deleting it
    await updateDoc(questRef, {
      status: 'completed',
      completedAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error completing quest:', error);
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
        duration: "4",
        eventTime: "2:00 PM"
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
        duration: "3",
        eventTime: "10:00 AM"
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
        duration: "4",
        eventTime: "3:30 PM"
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