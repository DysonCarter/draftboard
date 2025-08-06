import { useState, useEffect, useRef } from 'react';
import PlayerCard from './PlayerCard';
import PlayerListCard from './PlayerListCard';

function PreDraftPage({
  players,
  selectedPosition,
  setSelectedPosition,
  selectedPlayer,
  positions,
  movePlayerUp,
  movePlayerDown,
  resetRankings,
  handlePlayerClick,
  togglePlayerStar,
  togglePlayerThumbsDown
}) {
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [cardRotation, setCardRotation] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  // Filter players based on position
  useEffect(() => {
    let filtered = players;

    // Filter by position
    if (selectedPosition !== 'ALL') {
      filtered = filtered.filter(player => player.position === selectedPosition);
    }

    // Sort by custom rank but preserve original rankings
    filtered = filtered.sort((a, b) => a.customRank - b.customRank);

    setFilteredPlayers(filtered);
  }, [players, selectedPosition]);





  // Handle mouse movement for card rotation
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const rotateX = (mouseY / (rect.height / 2)) * -15; // Max 15 degrees
    const rotateY = (mouseX / (rect.width / 2)) * 15;   // Max 15 degrees
    
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
            {/* Position Filter and Reset Button */}
            <div className="flex justify-between items-center">
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
              
              <button
                onClick={resetRankings}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
              >
                Reset Rankings
              </button>
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
                  {/* Move buttons */}
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => movePlayerUp(player, filteredPlayers, index)}
                      disabled={index === 0}
                      className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs flex items-center justify-center"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => movePlayerDown(player, filteredPlayers, index)}
                      disabled={index === filteredPlayers.length - 1}
                      className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs flex items-center justify-center"
                    >
                      ↓
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

        {/* Right Side - Player Card */}
        <div 
          className="w-1/2 bg-zinc-800 flex items-center justify-center p-8"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {selectedPlayer ? (
            <div className="flex flex-col items-center gap-6">
              {/* Star and Thumbs Down buttons - positioned above the card */}
              <div className="flex gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlayerStar(selectedPlayer.playerID);
                  }}
                  className={`w-10 h-10 rounded-full text-lg flex items-center justify-center transition-colors shadow-lg ${
                    selectedPlayer.starred 
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                      : 'bg-zinc-700 hover:bg-zinc-600 text-gray-300'
                  }`}
                >
                  ⭐
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlayerThumbsDown(selectedPlayer.playerID);
                  }}
                  className={`w-10 h-10 rounded-full text-lg flex items-center justify-center transition-colors shadow-lg ${
                    selectedPlayer.thumbsDown 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-zinc-700 hover:bg-zinc-600 text-gray-300'
                  }`}
                >
                  👎
                </button>
              </div>

              {/* Player card with 3D rotation */}
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
  );
}

export default PreDraftPage;