import { useState, useEffect, useRef } from 'react';
import PlayerCard from './PlayerCard';
import PlayerListCard from './PlayerListCard';
import { exportRankings, importRankings, mergeImportedRankings } from '../utils/saveSystem';

function PreDraftPage({
  players,
  setPlayers,
  selectedPosition,
  setSelectedPosition,
  selectedPlayer,
  positions,
  movePlayerUp,
  movePlayerDown,
  resetRankings,
  handlePlayerClick,
  togglePlayerStar,
  togglePlayerThumbsDown,
  updatePlayerNotes,
  draftSettings,
  updateDraftSettings
}) {
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [cardRotation, setCardRotation] = useState({ x: 0, y: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState(null);
  const cardRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Export rankings to file
  const handleExportRankings = () => {
    const result = exportRankings(players);
    showNotification(result.message, result.success ? 'success' : 'error');
  };

  // Import rankings from file
  const handleImportRankings = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const result = await importRankings(file);
      const mergeResult = mergeImportedRankings(players, result.data);
      
      if (mergeResult.success) {
        setPlayers(mergeResult.players);
        showNotification(
          `Successfully imported! Updated ${mergeResult.stats.matched} of ${mergeResult.stats.total} players.`,
          'success'
        );
      } else {
        showNotification(mergeResult.message, 'error');
      }
    } catch (error) {
      showNotification(error.message, 'error');
    }

    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="min-h-screen w-screen bg-zinc-950 text-white overflow-x-hidden relative">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelected}
        style={{ display: 'none' }}
      />

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-white text-sm font-medium ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {notification.message}
        </div>
      )}
      {/* Settings Button */}
      <div className="fixed top-4 right-36 z-50">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-4 py-2 bg-zinc-900 hover:bg-black text-white rounded-lg font-medium transition-colors"
        >
          Settings
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed top-16 right-4 z-50 w-80 bg-zinc-800 rounded-lg p-4 shadow-xl border border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-zinc-300 font-medium">DRAFT SETTINGS</div>
            <button
              onClick={() => setShowSettings(false)}
              className="text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Starting Lineup */}
            <div className="text-xs text-zinc-400 uppercase tracking-wide">Starting Lineup</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">QB</label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={draftSettings.qbCount}
                  onChange={(e) => updateDraftSettings({
                    ...draftSettings,
                    qbCount: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-2 py-1 bg-zinc-700 text-white rounded text-sm border border-zinc-600 focus:border-zinc-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">RB</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={draftSettings.rbCount}
                  onChange={(e) => updateDraftSettings({
                    ...draftSettings,
                    rbCount: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-2 py-1 bg-zinc-700 text-white rounded text-sm border border-zinc-600 focus:border-zinc-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">WR</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={draftSettings.wrCount}
                  onChange={(e) => updateDraftSettings({
                    ...draftSettings,
                    wrCount: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-2 py-1 bg-zinc-700 text-white rounded text-sm border border-zinc-600 focus:border-zinc-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">TE</label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={draftSettings.teCount}
                  onChange={(e) => updateDraftSettings({
                    ...draftSettings,
                    teCount: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-2 py-1 bg-zinc-700 text-white rounded text-sm border border-zinc-600 focus:border-zinc-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">FLEX</label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={draftSettings.flexCount}
                  onChange={(e) => updateDraftSettings({
                    ...draftSettings,
                    flexCount: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-2 py-1 bg-zinc-700 text-white rounded text-sm border border-zinc-600 focus:border-zinc-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">K</label>
                <input
                  type="number"
                  min="0"
                  max="2"
                  value={draftSettings.kCount}
                  onChange={(e) => updateDraftSettings({
                    ...draftSettings,
                    kCount: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-2 py-1 bg-zinc-700 text-white rounded text-sm border border-zinc-600 focus:border-zinc-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">DST</label>
                <input
                  type="number"
                  min="0"
                  max="2"
                  value={draftSettings.dstCount}
                  onChange={(e) => updateDraftSettings({
                    ...draftSettings,
                    dstCount: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-2 py-1 bg-zinc-700 text-white rounded text-sm border border-zinc-600 focus:border-zinc-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Bench and Draft Info */}
            <div className="text-xs text-zinc-400 uppercase tracking-wide">Draft Info</div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Bench Spots</label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={draftSettings.benchCount}
                  onChange={(e) => updateDraftSettings({
                    ...draftSettings,
                    benchCount: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-2 py-1 bg-zinc-700 text-white rounded text-sm border border-zinc-600 focus:border-zinc-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Total Teams</label>
                <input
                  type="number"
                  min="4"
                  max="20"
                  value={draftSettings.totalTeams}
                  onChange={(e) => updateDraftSettings({
                    ...draftSettings,
                    totalTeams: parseInt(e.target.value) || 10
                  })}
                  className="w-full px-2 py-1 bg-zinc-700 text-white rounded text-sm border border-zinc-600 focus:border-zinc-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Your Draft Position</label>
                <input
                  type="number"
                  min="1"
                  max={draftSettings.totalTeams}
                  value={draftSettings.yourDraftSpot}
                  onChange={(e) => updateDraftSettings({
                    ...draftSettings,
                    yourDraftSpot: Math.min(parseInt(e.target.value) || 1, draftSettings.totalTeams)
                  })}
                  className="w-full px-2 py-1 bg-zinc-700 text-white rounded text-sm border border-zinc-600 focus:border-zinc-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen w-full">
        {/* Left Side - Player List */}
        <div className="w-1/2 border-r border-zinc-800 flex flex-col">
          {/* Controls */}
          <div className="bg-zinc-900 p-3 border-b border-zinc-800">
            {/* Position Filter and Controls */}
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
              
              <div className="flex gap-2">
                <button
                  onClick={handleExportRankings}
                  className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded text-sm transition-colors"
                >
                  Export
                </button>
                <button
                  onClick={handleImportRankings}
                  className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded text-sm transition-colors"
                >
                  Import
                </button>
                <button
                  onClick={resetRankings}
                  className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-red-400 hover:text-red-300 rounded text-sm transition-colors"
                >
                  Reset
                </button>
              </div>
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

              {/* Notes Section */}
              <div className="w-full max-w-md">
                <div className="bg-zinc-900 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-3 font-medium">PLAYER NOTES</div>
                  <textarea
                    value={selectedPlayer.notes || ''}
                    onChange={(e) => updatePlayerNotes(selectedPlayer.playerID, e.target.value)}
                    placeholder="Add your notes about this player..."
                    className="w-full h-24 bg-zinc-800 text-white text-sm rounded p-3 resize-none border border-zinc-700 focus:border-blue-500 focus:outline-none transition-colors"
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
  );
}

export default PreDraftPage;