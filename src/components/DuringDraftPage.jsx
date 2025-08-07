import { useState, useEffect, useRef } from 'react';
import PlayerListCard from './PlayerListCard';
import PlayerCard from './PlayerCard';
import TeamCarousel from './TeamCarousel';
import AiSuggestions from './AiSuggestions';
import FlipDisplay from './FlipDisplay';

function DuringDraftPage({
  players,
  selectedPosition,
  setSelectedPosition,
  selectedPlayer,
  positions,
  handlePlayerClick,
  togglePlayerStar,
  togglePlayerThumbsDown,
  updatePlayerNotes,
  markPlayerDraftedByYou,
  markPlayerDraftedByOthers,
  draftSettings,
  updatePlayerAiSuggestions
}) {
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cardRotation, setCardRotation] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  // Filter players based on position, draft status, and search term
  useEffect(() => {
    let filtered = players;

    // Filter out drafted players
    filtered = filtered.filter(player => !player.draftedByYou && !player.draftedByOthers);

    // Filter by position
    if (selectedPosition !== 'ALL') {
      filtered = filtered.filter(player => player.position === selectedPosition);
    }

    // Filter by search term (name or team)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(player => 
        player.longName.toLowerCase().includes(searchLower) ||
        player.team.toLowerCase().includes(searchLower)
      );
    }

    // Sort by custom rank but preserve original rankings
    filtered = filtered.sort((a, b) => a.customRank - b.customRank);

    setFilteredPlayers(filtered);
  }, [players, selectedPosition, searchTerm]);

  // Calculate picks until next turn using snake draft logic
  const calculatePicksUntilNext = () => {
    if (!draftSettings) return 0;
    
    const totalTeams = draftSettings.totalTeams;
    const userDraftPosition = draftSettings.yourDraftSpot; // 1-indexed
    const totalDrafted = players.filter(p => p.draftedByYou || p.draftedByOthers).length;
    const currentRound = Math.floor(totalDrafted / totalTeams) + 1;
    const currentPick = (totalDrafted % totalTeams) + 1;
    
    // Snake draft logic: odd rounds go 1->N, even rounds go N->1
    let userPickInRound;
    if (currentRound % 2 === 1) {
      // Odd round: normal order
      userPickInRound = userDraftPosition;
    } else {
      // Even round: reverse order
      userPickInRound = totalTeams - userDraftPosition + 1;
    }
    
    // Calculate picks until user's next turn
    if (currentPick <= userPickInRound) {
      // User hasn't picked in this round yet
      return userPickInRound - currentPick;
    } else {
      // User already picked this round, calculate next round
      const picksLeftInRound = totalTeams - currentPick;
      const nextRound = currentRound + 1;
      let userPickInNextRound;
      
      if (nextRound % 2 === 1) {
        userPickInNextRound = userDraftPosition;
      } else {
        userPickInNextRound = totalTeams - userDraftPosition + 1;
      }
      
      return picksLeftInRound + userPickInNextRound;
    }
  };

  const picksUntilNext = calculatePicksUntilNext();

  // Handle mouse movement for card rotation
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate rotation with max 15 degrees, clamped to bounds
    const rotateX = Math.max(-15, Math.min(15, (mouseY / (rect.height / 2)) * -15));
    const rotateY = Math.max(-15, Math.min(15, (mouseX / (rect.width / 2)) * 15));
    
    setCardRotation({ x: rotateX, y: rotateY });
  };

  // Reset card rotation when mouse leaves
  const handleMouseLeave = () => {
    setCardRotation({ x: 0, y: 0 });
  };

  return (
    <div className="min-h-screen w-screen bg-zinc-950 text-white overflow-x-hidden">
      <div className="flex h-screen w-full">
        {/* Left Side - Player List */}
        <div className="w-1/2 border-r border-zinc-800 flex flex-col">
          {/* Controls */}
          <div className="bg-zinc-900 p-3 border-b border-zinc-800">
            {/* Position Filter and Search Bar */}
            <div className="flex items-center gap-4">
              <div className="flex gap-2 flex-wrap">
                {positions.map(position => (
                  <button
                    key={position}
                    onClick={() => setSelectedPosition(position)}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors text-sm ${
                      selectedPosition === position
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                    }`}
                  >
                    {position}
                  </button>
                ))}
              </div>
              
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-1 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Player List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {filteredPlayers.map((player, index) => (
                <div
                  key={player.playerID}
                  className="group relative transition-all duration-200"
                >
                  {/* Draft Status and Action buttons */}
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markPlayerDraftedByYou(player.playerID);
                      }}
                      className="w-6 h-6 bg-green-600 hover:bg-green-700 text-white rounded text-xs flex items-center justify-center transition-colors"
                      title="I drafted this player"
                    >
                      ✓
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markPlayerDraftedByOthers(player.playerID);
                      }}
                      className="w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded text-xs flex items-center justify-center transition-colors"
                      title="Someone else drafted this player"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Star and Thumbs Down buttons */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlayerStar(player.playerID);
                      }}
                      className={`w-6 h-6 rounded text-xs flex items-center justify-center transition-colors ${
                        player.starred 
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                          : 'bg-zinc-800 hover:bg-zinc-700 text-gray-300'
                      }`}
                    >
                      ⭐
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlayerThumbsDown(player.playerID);
                      }}
                      className={`w-6 h-6 rounded text-xs flex items-center justify-center transition-colors ${
                        player.thumbsDown 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-zinc-800 hover:bg-zinc-700 text-gray-300'
                      }`}
                    >
                      👎
                    </button>
                  </div>

                  <div
                    onClick={() => handlePlayerClick(player)}
                    className="cursor-pointer"
                  >
                    <PlayerListCard player={{...player, rank: player.customRank, originalAdpRank: player.adpRank}} />
                  </div>
                </div>
              ))}
            </div>

            {filteredPlayers.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No players found matching your criteria
              </div>
            )}
          </div>

        </div>

        {/* Right Side - Team Carousel and Player Card */}
        <div className="w-1/2 bg-zinc-800 flex flex-col">
          <TeamCarousel players={players} draftSettings={draftSettings} />
          
          {/* Player Card Section */}
          <div 
            className="flex-1 flex items-start justify-center pt-2 px-4 pb-4 overflow-y-hidden"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {selectedPlayer ? (
              <div className="flex flex-col gap-2 w-full">
                {/* Row 2: Player card, Notes and AI Suggestions */}
                <div className="flex gap-4 w-full max-w-4xl mx-auto">
                  {/* Player card with 3D rotation */}
                  <div className="flex-shrink-0">
                    <div 
                      ref={cardRef}
                      className="inline-block"
                      style={{
                        transform: `perspective(1000px) rotateX(${cardRotation.x}deg) rotateY(${cardRotation.y}deg)`,
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.1s ease-out',
                      }}
                    >
                      <div
                        style={{
                          transform: 'translateZ(20px)',
                          boxShadow: `
                            ${cardRotation.y * 2}px ${cardRotation.x * 2}px 40px rgba(0, 0, 0, 0.3),
                            ${cardRotation.y * 1}px ${cardRotation.x * 1}px 20px rgba(0, 0, 0, 0.2)
                          `,
                          transition: 'box-shadow 0.1s ease-out',
                        }}
                        className="rounded-lg [&>div]:!m-0"
                      >
                        <PlayerCard player={{...selectedPlayer, rank: selectedPlayer.customRank}} />
                      </div>
                    </div>
                  </div>

                  {/* Notes and AI Suggestions Section */}
                  <div className="flex-1 max-w-md space-y-4">
                    {/* Notes Section - always visible */}
                    <div className="bg-zinc-900 rounded-lg p-4 h-fit">
                      <div className="text-sm text-gray-400 mb-3 font-medium">PLAYER NOTES</div>
                      <textarea
                        value={selectedPlayer.notes || ''}
                        onChange={(e) => updatePlayerNotes(selectedPlayer.playerID, e.target.value)}
                        placeholder="Add your notes about this player..."
                        className="w-full h-32 bg-zinc-800 text-white text-sm rounded p-3 resize-none border border-zinc-700 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>

                    {/* AI Suggestions Section */}
                    <AiSuggestions 
                      player={selectedPlayer} 
                      updatePlayerAiSuggestions={updatePlayerAiSuggestions}
                      availablePlayers={filteredPlayers.slice(0, 20)}
                      draftedPlayers={players.filter(p => p.draftedByYou)}
                      draftSettings={draftSettings}
                      picksUntilNext={picksUntilNext}
                    />
                  </div>
                </div>

                {/* Row 3: Pick Countdown Box and future component */}
                <div className="flex gap-4 w-full max-w-4xl mx-auto">
                  <div className="w-32">
                    <div className="bg-zinc-900 rounded-lg p-3 text-center h-32 flex flex-col justify-center">
                      <div className="text-xs text-gray-400 mb-1 font-medium">NEXT PICK IN</div>
                      <div className="text-2xl font-bold text-white">
                        {picksUntilNext === 0 ? "NOW!" : picksUntilNext}
                      </div>
                    </div>
                  </div>
                  
                  {/* Flip Display Component */}
                  <div className="flex-1">
                    <FlipDisplay 
                      availablePlayers={filteredPlayers}
                      draftedPlayers={players.filter(p => p.draftedByYou)}
                      draftSettings={draftSettings}
                      picksUntilNext={picksUntilNext}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-4">🏈</div>
                <h3 className="text-xl font-semibold mb-2">Select a Player</h3>
                <p>Click on any player from the list to view their details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DuringDraftPage;