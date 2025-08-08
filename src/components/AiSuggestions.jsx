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

## Goal
From the inputs, recommend EXACTLY ONE player who maximizes the user's chance to win their league.

## Hard rules (must follow)
1) Use ONLY the provided data fields. Do not add outside knowledge or your own rankings.
2) "Rank 1" is best. Lower numbers = better.
3) Do NOT draft a second K or DST. If the roster already has a K or DST, set that position's score to -∞.
4) Backup QB/TE are unimportant unless the player is an exceptional value (clearly falling past ADP).
5) Output MUST be valid JSON ONLY, with shape:
   {"longName": "<player name>", "overview": "<two sentence overview of why to pick this player>"}
   - Exactly two sentences in "overview".
   - No extra fields, no markdown, no commentary.

## Inputs
availablePlayers: ${JSON.stringify(availablePlayers)}
draftedPlayers: ${JSON.stringify(draftedPlayers)}
draftSettings: ${JSON.stringify(draftSettings)}
picksUntilNext: ${picksUntilNext}

## Field expectations
Each available player may include: 
- longName, position, team, adpRank (integer), customRank (integer), starred (boolean), thumbsDown (boolean), notes (string|optional), stackWith (array of teammate names or positions, e.g., ["Josh Allen","BUF QB","Mark Andrews"])
- Not all fields are guaranteed. Treat missing booleans as false, missing arrays as empty.

draftedPlayers includes the user's roster so far (use this to detect stacks and whether K/DST are already filled).

## Scoring recipe (compute a single score per player; pick the max)
Let lower ranks be better. Normalize ranks to z-ish scores against the *available* pool so the model compares like with like:

1) Rank components
   - adpComponent = percentile rank among available based on adpRank (invert so better ADP → higher number in [0,1])
   - customComponent = percentile rank among available based on customRank (invert so better custom → higher number in [0,1])

2) Base value
   - base = (0.55 * customComponent) + (0.35 * adpComponent)
   Rationale: respect the user's board while still hunting ADP value.

3) Exceptional value bump (for QB/TE backups only)
   - If position in {"QB","TE"} AND user already has that position filled:
       - exceptional = 0.15 if the player's adpRank is at least 12 spots better than the median adpRank of remaining players at that position; else 0
   - Otherwise exceptional = 0

4) Star / thumbs-down
   - starBonus = 0.10 if starred == true else 0
   - thumbPenalty = -0.07 if thumbsDown == true else 0

5) Stack bonus (light but real)
   - If player forms a meaningful stack with a *starting* teammate already on the user's roster:
       - stackBonus = 0.08 (e.g., your QB ↔ their WR/TE; or your elite WR/TE ↔ their QB)
   - Otherwise 0
   - Only award once per player.

6) Reach factor (picksUntilNext)
   - Let reachAllowance = 0.5 * picksUntilNext (how many ranks it's reasonable to reach).
   - If a player is starred AND their adpRank is within reachAllowance of the top available player's adpRank, add +0.05.
   - If a player’s adpRank is much better (≥ 10 spots) than their customRank, add +0.03 (pure ADP faller).
   - If a player’s customRank is much better (≥ 10 spots) than their adpRank and picksUntilNext ≥ 10, add +0.03 (get your guy before the long wait).

7) Positional sanity
   - If user lacks starters at RB/WR, add +0.05 to RB/WR candidates until both WR and RB starting slots are filled.
   - If position is K or DST and the roster slot is still empty, allow normal scoring; if filled, score = -∞ (skip).

8) Final score
   - score = base + exceptional + starBonus + thumbPenalty + stackBonus + reach adjustments + positional sanity
   - If any mandatory constraint is violated (e.g., second K/DST), set score = -∞.

## Tiebreakers (in order; apply until one player wins)
1) Higher customComponent
2) Higher adpComponent (more ADP value)
3) Player who creates/strengthens a stack
4) Starred over non-starred
5) Scarcer starting need (fill RB/WR starters first)
6) Lower adpRank (comes off the board sooner)

## Output construction
- Choose the single highest-scoring eligible player.
- DO NOT WRAP IN MARKDOWN CODE BLOCKS. GIVE PLAIN TEXT JSON
- Return ONLY:
  {"longName": "<player name>", "overview": "<two sentence overview of why to pick this player>"}
- The overview MUST reference value and at least one of: user preference (star/thumbsDown handled), stack, or picksUntilNext logic—WITHOUT inventing new stats.

## Safety checks
- If no eligible players exist (should be rare), pick the best non-K/DST by base and explain the constraint in the two sentences without breaking the format.
- Never include rankings, scores, or internal calculations in the JSON—only the two-sentence rationale.
    `;

    const handleGenerateAI = async () => {
      if (!player) return;
      
      setIsLoading(true);
      console.log('AI Prompt:', PROMPT);
      
      try {
        // Copy to clipboard first
        await navigator.clipboard.writeText(PROMPT);
        console.log('Prompt copied to clipboard!');
        
        // Call our secure API endpoint
        const response = await fetch('/api/ai-suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: PROMPT
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