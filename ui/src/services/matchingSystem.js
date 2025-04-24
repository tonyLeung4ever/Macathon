import { db } from '../config/firebase';
import { dummyQuests, dummyUsers } from '../config/firebase';

// Calculate match score between user and quest (0-100)
const calculateQuestMatchScore = (user, quest) => {
  let score = 0;
  
  // Skill level match (40 points)
  const skillDiff = Math.abs(quest.requiredSkillLevel - user.tasteProfile.skillLevel);
  score += Math.max(0, 40 - (skillDiff * 10));
  
  // Interest match (30 points)
  const interestMatches = user.tasteProfile.interests.filter(interest => 
    quest.tags.includes(interest)
  ).length;
  score += (interestMatches / user.tasteProfile.interests.length) * 30;
  
  // Team size preference (20 points)
  if (quest.maxTeamSize >= user.tasteProfile.preferredTeamSize) {
    score += 20;
  } else {
    score += (quest.maxTeamSize / user.tasteProfile.preferredTeamSize) * 20;
  }
  
  // Personality traits (10 points)
  const traitMatches = user.tasteProfile.personalityTraits.filter(trait => 
    quest.tags.some(tag => tag.toLowerCase().includes(trait.toLowerCase()))
  ).length;
  score += (traitMatches / user.tasteProfile.personalityTraits.length) * 10;
  
  return Math.round(score);
};

// Match a user to compatible quests
export const matchUserToQuests = (userId) => {
  const user = dummyUsers.find(u => u.uid === userId);
  if (!user) return [];

  return dummyQuests
    .map(quest => ({
      ...quest,
      matchScore: calculateQuestMatchScore(user, quest)
    }))
    .filter(quest => quest.matchScore >= 50) // Only show quests with decent match
    .sort((a, b) => b.matchScore - a.matchScore);
};

// Calculate compatibility score between two users (0-100)
const calculateUserCompatibility = (user1, user2) => {
  let score = 0;
  
  // Skill level match (30 points)
  const skillDiff = Math.abs(user1.tasteProfile.skillLevel - user2.tasteProfile.skillLevel);
  score += Math.max(0, 30 - (skillDiff * 10));
  
  // Interest overlap (30 points)
  const commonInterests = user1.tasteProfile.interests.filter(interest => 
    user2.tasteProfile.interests.includes(interest)
  ).length;
  score += (commonInterests / Math.max(
    user1.tasteProfile.interests.length,
    user2.tasteProfile.interests.length
  )) * 30;
  
  // Personality trait match (20 points)
  const commonTraits = user1.tasteProfile.personalityTraits.filter(trait => 
    user2.tasteProfile.personalityTraits.includes(trait)
  ).length;
  score += (commonTraits / Math.max(
    user1.tasteProfile.personalityTraits.length,
    user2.tasteProfile.personalityTraits.length
  )) * 20;
  
  // Team size preference (20 points)
  if (user1.tasteProfile.preferredTeamSize === user2.tasteProfile.preferredTeamSize) {
    score += 20;
  } else {
    score += (Math.min(
      user1.tasteProfile.preferredTeamSize,
      user2.tasteProfile.preferredTeamSize
    ) / Math.max(
      user1.tasteProfile.preferredTeamSize,
      user2.tasteProfile.preferredTeamSize
    )) * 20;
  }
  
  return Math.round(score);
};

// Find compatible teammates for a quest
export const findTeammates = (userId, questId) => {
  const user = dummyUsers.find(u => u.uid === userId);
  const quest = dummyQuests.find(q => q.id === questId);
  
  if (!user || !quest) return [];

  // Find users with similar skill levels who aren't in a team
  const potentialTeammates = dummyUsers
    .filter(potentialUser => {
      if (potentialUser.uid === userId) return false;
      if (potentialUser.currentTeam) return false;
      return true;
    })
    .map(potentialUser => ({
      ...potentialUser,
      compatibilityScore: calculateUserCompatibility(user, potentialUser),
      questMatchScore: calculateQuestMatchScore(potentialUser, quest)
    }))
    .filter(user => user.compatibilityScore >= 50 && user.questMatchScore >= 50)
    .sort((a, b) => {
      // Sort by combined score of compatibility and quest match
      const scoreA = (a.compatibilityScore + a.questMatchScore) / 2;
      const scoreB = (b.compatibilityScore + b.questMatchScore) / 2;
      return scoreB - scoreA;
    })
    .slice(0, 2);

  return potentialTeammates;
};

// Create a team with matched users
export const createTeam = (userId, questId, teammateIds) => {
  const team = {
    id: `team_${Date.now()}`,
    questId,
    members: [userId, ...teammateIds],
    status: 'forming',
    createdAt: new Date(),
    matchScore: calculateTeamMatchScore(userId, questId, teammateIds)
  };

  // In a real implementation, this would update Firestore
  console.log('Team created:', team);
  return team;
};

// Calculate overall team match score
const calculateTeamMatchScore = (userId, questId, teammateIds) => {
  const user = dummyUsers.find(u => u.uid === userId);
  const quest = dummyQuests.find(q => q.id === questId);
  const teammates = dummyUsers.filter(u => teammateIds.includes(u.uid));
  
  if (!user || !quest || teammates.length === 0) return 0;
  
  // Calculate average compatibility between all team members
  const compatibilityScores = [];
  for (let i = 0; i < teammates.length; i++) {
    for (let j = i + 1; j < teammates.length; j++) {
      compatibilityScores.push(calculateUserCompatibility(teammates[i], teammates[j]));
    }
  }
  
  const avgCompatibility = compatibilityScores.reduce((a, b) => a + b, 0) / compatibilityScores.length;
  
  // Calculate average quest match score for the team
  const questMatchScores = teammates.map(t => calculateQuestMatchScore(t, quest));
  const avgQuestMatch = questMatchScores.reduce((a, b) => a + b, 0) / questMatchScores.length;
  
  // Return combined score
  return Math.round((avgCompatibility + avgQuestMatch) / 2);
}; 