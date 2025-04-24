import { useState, useEffect } from 'react';
import { matchUserToQuests, findTeammates, createTeam } from '../../services/matchingSystem';

const QuestDashboard = ({ userId }) => {
  const [matchedQuests, setMatchedQuests] = useState([]);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [teammates, setTeammates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get matched quests for the user
    const quests = matchUserToQuests(userId);
    setMatchedQuests(quests);
    setLoading(false);
  }, [userId]);

  const handleQuestSelect = async (questId) => {
    setSelectedQuest(questId);
    setLoading(true);
    // Find potential teammates for this quest
    const matchedTeammates = findTeammates(userId, questId);
    setTeammates(matchedTeammates);
    setLoading(false);
  };

  const handleCreateTeam = async () => {
    if (!selectedQuest || teammates.length < 2) return;
    
    const teammateIds = teammates.map(t => t.uid);
    const team = createTeam(userId, selectedQuest, teammateIds);
    console.log('Team created successfully:', team);
    
    // Show success message
    alert(`Team created successfully! Match score: ${team.matchScore}%`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Recommended Quests</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matchedQuests.map(quest => (
          <div 
            key={quest.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all
              ${selectedQuest === quest.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'}`}
            onClick={() => handleQuestSelect(quest.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold">{quest.title}</h3>
              <span className="text-sm font-medium text-emerald-600">
                {quest.matchScore}% match
              </span>
            </div>
            <p className="text-gray-600 mb-2">{quest.description}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Skill Level: {quest.requiredSkillLevel}</span>
                <span>Team Size: {quest.maxTeamSize}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Duration: {quest.duration}</span>
                <span>Location: {quest.location}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {quest.tags.map(tag => (
                  <span 
                    key={tag}
                    className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedQuest && (
        <div className="mt-8 p-6 border rounded-lg bg-white shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Potential Teammates</h3>
          {teammates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teammates.map(teammate => (
                <div key={teammate.uid} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{teammate.displayName}</h4>
                    <div className="text-sm">
                      <span className="text-emerald-600 font-medium">
                        {teammate.compatibilityScore}% compatible
                      </span>
                      <span className="mx-2">•</span>
                      <span className="text-emerald-600 font-medium">
                        {teammate.questMatchScore}% quest match
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Skill Level: {teammate.tasteProfile.skillLevel}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {teammate.tasteProfile.interests.map(interest => (
                        <span 
                          key={interest}
                          className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {teammate.tasteProfile.personalityTraits.map(trait => (
                        <span 
                          key={trait}
                          className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No potential teammates found for this quest.</p>
          )}
          
          {teammates.length >= 2 && (
            <button
              onClick={handleCreateTeam}
              className="mt-6 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
            >
              Create Team with Selected Teammates
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestDashboard; 