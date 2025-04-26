function updateProfile(profile, feedback, questTraits) {
    const updatedProfile = { ...profile };
  
    const enjoymentScore = parseInt(feedback.enjoyment);
    const liked = enjoymentScore >= 4;
    const disliked = enjoymentScore <= 2;
  
    Object.keys(questTraits).forEach((trait) => {
      if (liked) {
        updatedProfile[trait] = (updatedProfile[trait] || 0) + questTraits[trait] * 0.2;
      } else if (disliked) {
        updatedProfile[trait] = (updatedProfile[trait] || 0) - questTraits[trait] * 0.2;
      }
    });
  
    return updatedProfile;
  }
  
  module.exports = { updateProfile };
  