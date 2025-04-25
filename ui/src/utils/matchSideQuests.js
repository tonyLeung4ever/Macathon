import sidequests from '../services/data/SideQuests.json';

export function matchSideQuests(userTraits, topN = 5) {
  return sidequests
    .map((quest) => {
      const score = quest.tags.reduce((acc, tag) => acc + (userTraits[tag] || 0), 0);
      return { ...quest, matchScore: score };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, topN);
}
