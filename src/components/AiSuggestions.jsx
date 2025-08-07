import { useState } from 'react';

function AiSuggestions({ 
  player, 
  updatePlayerAiSuggestions, 
  availablePlayers, 
  draftedPlayers, 
  draftSettings,
  picksUntilNext,
  handlePlayerClick
}) {
  const [isLoading, setIsLoading] = useState(false);

    const PROMPT = `
    You are an elite fantasy-football draft assistant. 
    Based on the following inputs, recommend exactly one player that maximizes the user's chances to win their league:
        * adpRank: average draft position ranking
        * customRank: user's personal ranking
    
    • Constraints & priorities:
    DO NOT PUT ANY VALUE IN YOUR PERSONAL RANKING OR NAME. ONLY BASE THIS BASED ON THE STATS GIVEN TO YOU.
      
      2. Backup QB/TE aren't important unless there's exceptional value (falling well below ADP).
      3. Favor "stack" opportunities:  
         – If the user's starting QB has a top WR or TE available, bump that WR/TE's value.  
         – Likewise, if the user has a top WR/TE, consider their QB.
      4. Weigh both adpRank and customRank—seek value picks that the user also rates highly.
      5. Consider user's notes and starred/thumbsDown preferences (a star means this is one of their guys they love, thumbs down they aren't a big fan but will draft if they are a good value).
      6. Consider the picksUntilNext value, if their next pick is a lot later, they are more likely to reach and "get their guy"
      7. The user needs exactly one Kicker and one Defense/Special Teams—don't draft a second of either.
    
    • Task:
      Analyze the inputs and pick one player to draft now.  
      Your output should be a json object in the shape of {"longName": "<player name>", "overview": "<two sentence overview of why to pick this player>"}
      
    • Data:
      availablePlayers: ${JSON.stringify(availablePlayers)}
      draftedPlayers: ${JSON.stringify(draftedPlayers)}  
      draftSettings: ${JSON.stringify(draftSettings)}
      picksUntilNext: ${picksUntilNext}

      RETURN ONLY THE JSON OBJECT, NO OTHER TEXT, NO MARKDOWN FORMATTING
    `;

    const handleGenerateAI = async () => {
      if (!player) return;
      
      setIsLoading(true);
      console.log('AI Prompt:', PROMPT);
      
      try {
        // Copy to clipboard first
        await navigator.clipboard.writeText(PROMPT);
        console.log('Prompt copied to clipboard!');
        
        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'user',
                content: PROMPT
              }
            ],
            temperature: 0.7,
            max_tokens: 500
          })
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content;
        
                  if (aiResponse) {
            console.log('AI Response:', aiResponse);
            
            // Try to parse JSON and extract the overview
            try {
              const parsedResponse = JSON.parse(aiResponse);
              
              // Find the recommended player first
              let targetPlayer = player; // Default to current player
              if (parsedResponse.longName) {
                const recommendedPlayer = availablePlayers.find(p => 
                  p.longName.toLowerCase() === parsedResponse.longName.toLowerCase()
                );
                
                if (recommendedPlayer) {
                  targetPlayer = recommendedPlayer;
                  console.log('Auto-selecting recommended player:', recommendedPlayer.longName);
                  handlePlayerClick(recommendedPlayer);
                } else {
                  console.log('Recommended player not found in available players:', parsedResponse.longName);
                }
              }
              
              // Set the AI suggestions on the target player (recommended player if found)
              if (parsedResponse.overview) {
                updatePlayerAiSuggestions(targetPlayer.playerID, parsedResponse.overview);
              } else {
                // Fallback to raw response
                updatePlayerAiSuggestions(targetPlayer.playerID, aiResponse);
              }
              
            } catch (parseError) {
              console.log('Could not parse JSON response, displaying raw text');
              updatePlayerAiSuggestions(player.playerID, aiResponse);
            }
          }
      } catch (err) {
        console.error('Error calling OpenAI API:', err);
      } finally {
        setIsLoading(false);
      }
    };


  return (
    <div className="bg-zinc-900 rounded-lg p-4 h-fit">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-400 font-medium">AI SUGGESTIONS</div>
        <button
          onClick={handleGenerateAI}
          disabled={isLoading}
          className={`p-2 border rounded transition-all flex items-center justify-center ${
            isLoading 
              ? 'bg-zinc-600 text-gray-400 border-gray-600 cursor-not-allowed' 
              : 'bg-zinc-700 hover:bg-zinc-600 text-green-400 hover:text-green-300 border-green-400/30 hover:border-green-300/50'
          }`}
          title={isLoading ? "Generating AI recommendation..." : "Generate AI Recommendation"}
        >
          {isLoading ? (
            <div className="animate-spin">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
            </div>
          ) : (
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"/>
              <path d="M20 3v4"/>
              <path d="M22 5h-4"/>
              <path d="M4 17v2"/>
              <path d="M5 18H3"/>
            </svg>
          )}
        </button>
      </div>
      <textarea
        value={player?.aiSuggestions || ''}
        onChange={(e) => updatePlayerAiSuggestions(player.playerID, e.target.value)}
        placeholder={isLoading ? "Generating AI recommendation..." : "AI analysis and suggestions will appear here..."}
        className="w-full h-32 bg-zinc-800 text-white text-sm rounded p-3 resize-none border border-zinc-700 focus:border-blue-500 focus:outline-none transition-colors"
      />
    </div>
  );
}

export default AiSuggestions;