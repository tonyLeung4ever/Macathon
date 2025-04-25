import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, where, setDoc, enableIndexedDbPersistence, deleteDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCgpJ0DLi9c4I7pt0suAkydQxmmOrf3dhM",
  authDomain: "sidequest-319b2.firebaseapp.com",
  projectId: "sidequest-319b2",
  storageBucket: "sidequest-319b2.firebasestorage.app",
  messagingSenderId: "609485675638",
  appId: "1:609485675638:web:49d0433391350224251357",
  measurementId: "G-RJ5G2JQKTG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics conditionally
const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null).catch(() => null);

// Initialize Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support persistence.');
  }
});

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  QUESTS: 'quests',
  TEAMS: 'teams',
  ONBOARDING_QUESTIONS: 'onboardingQuestions'
};

// Authentication operations
export const authOperations = {
  async signUp(email, password, userData) {
    try {
      // First create the auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      try {
        // Then try to create the user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          ...userData,
          email: user.email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } catch (firestoreError) {
        console.error('Error creating user document:', firestoreError);
        // If Firestore fails, we should still return the user since auth succeeded
      }
      
      return user;
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  },

  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error in signIn:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    }
  },

  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
};

// Firestore operations
export const firestoreOperations = {
  // User operations
  async createUser(userData) {
    try {
      const userRef = await addDoc(collection(db, 'users'), {
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return userRef.id;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  },

  async updateUser(userId, userData) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  },

  async getUser(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDocs(userRef);
      return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null;
    } catch (error) {
      console.error('Error in getUser:', error);
      throw error;
    }
  },

  // Quest operations
  async createQuest(questData) {
    try {
      const questRef = await addDoc(collection(db, COLLECTIONS.QUESTS), questData);
      return questRef.id;
    } catch (error) {
      console.error('Error creating quest:', error);
      throw error;
    }
  },

  async getQuests() {
    try {
      const questsSnap = await getDocs(collection(db, COLLECTIONS.QUESTS));
      return questsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting quests:', error);
      throw error;
    }
  },

  async getQuestById(questId) {
    try {
      const questRef = doc(db, COLLECTIONS.QUESTS, questId);
      const questSnap = await getDocs(questRef);
      return questSnap.exists() ? { id: questSnap.id, ...questSnap.data() } : null;
    } catch (error) {
      console.error('Error getting quest:', error);
      throw error;
    }
  },

  // Team operations
  async createTeam(teamData) {
    try {
      const teamRef = await addDoc(collection(db, COLLECTIONS.TEAMS), teamData);
      return teamRef.id;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  },

  async getTeamsForUser(userId) {
    try {
      const teamsQuery = query(
        collection(db, COLLECTIONS.TEAMS),
        where('members', 'array-contains', userId)
      );
      const teamsSnap = await getDocs(teamsQuery);
      return teamsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting teams:', error);
      throw error;
    }
  },

  async updateTeam(teamId, teamData) {
    try {
      const teamRef = doc(db, COLLECTIONS.TEAMS, teamId);
      await updateDoc(teamRef, teamData);
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  }
};

// Initialize onboarding questions
export const initializeOnboardingQuestions = async () => {
  try {
    const questionsRef = collection(db, COLLECTIONS.ONBOARDING_QUESTIONS);
    
    // First, clear any existing questions
    const snapshot = await getDocs(questionsRef);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Then add all questions
    const onboardingQuestions = [
      {
        question: "It's your day off from university, you just woke up, and the sun is shining. Would you rather:",
        answers: {
          A: { text: "Go for a run outside", tags: ["outdoorsy", "active", "motivated"] },
          B: { text: "Cook yourself a big, hearty meal", tags: ["cozy", "self-care", "creative"] },
          C: { text: "Clean up and organize your room", tags: ["productive", "planner", "solo"] },
          D: { text: "Do something online (watch tiktoks or reels or something)", tags: ["introvert", "chill", "digital-native"] }
        }
      },
      {
        question: "It's Friday evening. Would you rather:",
        answers: {
          A: { text: "Go to a games night", tags: ["social", "fun", "light-hearted"] },
          B: { text: "Go out dancing with your friends to a party", tags: ["extrovert", "adventurous", "chaotic"] },
          C: { text: "Watch a good movie alone", tags: ["introvert", "cozy", "reflective"] },
          D: { text: "Work on assignments", tags: ["driven", "independent", "focused"] }
        }
      },
      {
        question: "You bump into an acquaintance at a café. Do you:",
        answers: {
          A: { text: "Invite them to sit with you", tags: ["friendly", "social", "warm"] },
          B: { text: "Panic slightly but say hi", tags: ["awkward", "aware", "introvert"] },
          C: { text: "Pretend you didn't see them", tags: ["shy", "anxious", "private"] },
          D: { text: "Compliment their outfit and bounce", tags: ["funny", "confident", "casual"] }
        }
      },
      {
        question: "It's the night before an assignment is due. Would you rather:",
        answers: {
          A: { text: "Pull an all-nighter with friends", tags: ["chaotic", "collaborative", "gritty"] },
          B: { text: "Cry a little, then start working", tags: ["relatable", "resilient", "emotional"] },
          C: { text: "Email for an extension", tags: ["realistic", "resourceful", "academic"] },
          D: { text: "Start a new project instead (oops)", tags: ["creative", "chaotic", "drifty"] }
        }
      },
      {
        question: "It's mental recharge time. Would you rather:",
        answers: {
          A: { text: "Bake something experimental", tags: ["creative", "cozy", "tactile"] },
          B: { text: "Rewatch comfort shows", tags: ["introvert", "cozy", "escapist"] },
          C: { text: "Go for a nature walk", tags: ["outdoorsy", "reflective", "recharging"] },
          D: { text: "Workout!", tags: ["motivated", "disciplined", "active"] }
        }
      },
      {
        question: "You're stuck on a group assignment. Do you:",
        answers: {
          A: { text: "Take charge and delegate tasks", tags: ["leadership", "organized", "confident"] },
          B: { text: "Quietly do all the work", tags: ["responsible", "introvert", "hardworking"] },
          C: { text: "Distract the group with memes", tags: ["funny", "chaotic", "icebreaker"] },
          D: { text: "Convince everyone to pivot ideas", tags: ["creative", "visionary", "influencer"] }
        }
      },
      {
        question: "Your tutorial got cancelled last minute. Would you rather:",
        answers: {
          A: { text: "Head straight to the nearest bubble tea", tags: ["spontaneous", "social", "sweet tooth"] },
          B: { text: "Catch up on readings (finally)", tags: ["academic", "structured", "ambitious"] },
          C: { text: "Call a friend for a spontaneous hang", tags: ["social", "connected", "present"] },
          D: { text: "Wander campus aimlessly for vibes", tags: ["adventurous", "free-spirited", "chill"] }
        }
      },
      {
        question: "You go viral on campus confessions. Would you rather it be for:",
        answers: {
          A: { text: "A wholesome act", tags: ["empathetic", "soft", "kind"] },
          B: { text: "A chaotic group project story", tags: ["funny", "chaotic", "storyteller"] },
          C: { text: "A meme-worthy outfit", tags: ["bold", "confident", "goofy"] },
          D: { text: "Your secret campus crush", tags: ["romantic", "sentimental", "honest"] }
        }
      },
      {
        question: "You get dared to try something you've never done. Would you rather:",
        answers: {
          A: { text: "Join a dance flash mob", tags: ["bold", "social", "movement"] },
          B: { text: "Try stand-up comedy at open mic", tags: ["funny", "creative", "confident"] },
          C: { text: "Speed-date at a themed event", tags: ["outgoing", "open-minded", "curious"] },
          D: { text: "Paint in front of strangers", tags: ["artsy", "vulnerable", "creative"] }
        }
      },
      {
        question: "You're offered free classes for a week. Would you rather take:",
        answers: {
          A: { text: "Pottery", tags: ["tactile", "calm", "creative"] },
          B: { text: "Lock-picking", tags: ["clever", "mischievous", "problem-solver"] },
          C: { text: "Improv theater", tags: ["spontaneous", "social", "quick-thinker"] },
          D: { text: "Street photography", tags: ["visual", "observant", "solo"] }
        }
      },
      {
        question: "You're forced to delete all apps except one. Which do you keep?",
        answers: {
          A: { text: "Instagram for aesthetics", tags: ["aesthetic", "creative", "social"] },
          B: { text: "Reddit for rabbit holes", tags: ["curious", "nerdy", "deep-thinker"] },
          C: { text: "TikTok for chaos", tags: ["chaotic", "fun", "trendy"] },
          D: { text: "Spotify for sanity", tags: ["introspective", "emotional", "music-lover"] }
        }
      }
    ];

    const addPromises = onboardingQuestions.map(question => 
      addDoc(questionsRef, {
        ...question,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    );

    await Promise.all(addPromises);
    console.log('Onboarding questions initialized in Firestore');
  } catch (error) {
    console.error('Error initializing onboarding questions:', error);
  }
};

// Initialize dummy data function
export const initializeDummyData = async () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      // Clear existing quests
      const questsRef = collection(db, COLLECTIONS.QUESTS);
      const snapshot = await getDocs(questsRef);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Add new dummy quests
      const addPromises = dummyQuests.map(quest => {
        const { id, ...questData } = quest;
        return setDoc(doc(db, COLLECTIONS.QUESTS, id), {
          ...questData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
      await Promise.all(addPromises);

      console.log('Dummy data initialized in Firestore');
    } catch (error) {
      console.error('Error initializing dummy data:', error);
    }
  }
};

// Enhanced dummy data
export const dummyQuests = [
  {
    id: "q1",
    title: "Coding Workshop",
    description: "Learn basic web development in a collaborative environment",
    maxTeamSize: 3,
    status: "open",
    currentTeams: [],
    category: "coding",
    duration: "3 hours",
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    location: "Learning and Teaching Building (LTB)",
    tags: ["coding", "technology", "learning"],
    matchScore: 75
  },
  {
    id: "q2",
    title: "Community Garden Setup",
    description: "Help set up a community garden on campus",
    maxTeamSize: 4,
    status: "open",
    currentTeams: [],
    category: "gardening",
    duration: "4 hours",
    startTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
    location: "Campus Green",
    tags: ["gardening", "community", "outdoor"],
    matchScore: 75
  },
  {
    id: "q3",
    title: "Board Game Night",
    description: "Organize and host a board game night",
    maxTeamSize: 6,
    status: "open",
    currentTeams: [],
    category: "games",
    duration: "3 hours",
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    location: "Campus Centre",
    tags: ["games", "social", "indoor"],
    matchScore: 75
  },
  {
    id: "q4",
    title: "Campus Art Tour",
    description: "Discover and document campus art installations",
    maxTeamSize: 4,
    status: "open",
    currentTeams: [],
    category: "art",
    duration: "2.5 hours",
    startTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
    location: "Monash Gallery",
    tags: ["art", "exploration", "culture"],
    matchScore: 75
  },
  {
    id: "q5",
    title: "Campus Photography Walk",
    description: "Explore the campus and capture unique moments with your camera",
    maxTeamSize: 3,
    status: "open",
    currentTeams: [],
    category: "photography",
    duration: "2 hours",
    startTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
    location: "Sir Louis Matheson Library",
    tags: ["photography", "exploration", "campus"],
    matchScore: 75
  },
  {
    id: "q6",
    title: "Food Festival Planning",
    description: "Help organize and plan the upcoming campus food festival",
    maxTeamSize: 5,
    status: "open",
    currentTeams: [],
    category: "community",
    duration: "5 hours",
    startTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
    location: "Campus Centre Food Court",
    tags: ["food", "community", "planning"],
    matchScore: 75
  }
];

export const dummyUsers = [
  {
    uid: "u1",
    displayName: "Alex",
    tasteProfile: {
      interests: ["photography", "art", "exploration"],
      skillLevel: 2,
      preferredTeamSize: 3,
      personalityTraits: ["creative", "adventurous", "social"]
    },
    matchedQuests: [],
    currentTeam: null,
    completedQuests: []
  },
  {
    uid: "u2",
    displayName: "Sam",
    tasteProfile: {
      interests: ["gardening", "community", "outdoor"],
      skillLevel: 1,
      preferredTeamSize: 4,
      personalityTraits: ["organized", "friendly", "patient"]
    },
    matchedQuests: [],
    currentTeam: null,
    completedQuests: []
  },
  {
    uid: "u3",
    displayName: "Jordan",
    tasteProfile: {
      interests: ["coding", "technology", "learning"],
      skillLevel: 3,
      preferredTeamSize: 3,
      personalityTraits: ["analytical", "curious", "focused"]
    },
    matchedQuests: [],
    currentTeam: null,
    completedQuests: []
  },
  {
    uid: "u4",
    displayName: "Taylor",
    tasteProfile: {
      interests: ["art", "photography", "exploration"],
      skillLevel: 2,
      preferredTeamSize: 3,
      personalityTraits: ["creative", "observant", "social"]
    },
    matchedQuests: [],
    currentTeam: null,
    completedQuests: []
  },
  {
    uid: "u5",
    displayName: "Casey",
    tasteProfile: {
      interests: ["games", "social", "technology"],
      skillLevel: 2,
      preferredTeamSize: 4,
      personalityTraits: ["friendly", "strategic", "adaptable"]
    },
    matchedQuests: [],
    currentTeam: null,
    completedQuests: []
  }
]; 