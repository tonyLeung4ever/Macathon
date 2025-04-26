import sidequests from '../services/data/SideQuests.json';

export function matchSideQuests(userTraits, topN = 5) {
  return sidequests
    .map((quest, index) => {
      const score = quest.tags.reduce((acc, tag) => acc + (userTraits[tag] || 0), 0);
      // Add a unique ID to each quest if it doesn't have one
      return { 
        ...quest, 
        id: quest.id || `sidequest-${index}`,
        matchScore: score 
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, topN);
}
