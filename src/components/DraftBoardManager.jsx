import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PreDraftPage from './PreDraftPage';
import DuringDraftPage from './DuringDraftPage';
import adpData from '../data/adp_enriched.json';

function DraftBoardManager({ mode }) {
  const [players, setPlayers] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [draftSettings, setDraftSettings] = useState({
    qbCount: 1,
    rbCount: 2,
    wrCount: 2,
    teCount: 1,
    flexCount: 1,
    kCount: 1,
    dstCount: 1,
    benchCount: 6,
    totalTeams: 12,
    yourDraftSpot: 1
  });
  const navigate = useNavigate();
  const isDuringDraft = mode === 'during-draft';

  // Available positions for filtering
  const positions = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DST'];

  // Load rankings from localStorage or initialize with default
  const loadRankings = () => {
    const savedRankings = localStorage.getItem('draftboard-rankings');
    if (savedRankings) {
      try {
        return JSON.parse(savedRankings);
      } catch (e) {
        console.error('Error parsing saved rankings:', e);
        return {};
      }
    }
    return {};
  };

  // Save rankings to localStorage
  const saveRankings = (players) => {
    const rankings = {};
    players.forEach(player => {
      rankings[player.playerID] = player.customRank;
    });
    localStorage.setItem('draftboard-rankings', JSON.stringify(rankings));
  };

  // Load player marks from localStorage
  const loadPlayerMarks = () => {
    const savedMarks = localStorage.getItem('draftboard-player-marks');
    if (savedMarks) {
      try {
        return JSON.parse(savedMarks);
      } catch (e) {
        console.error('Error parsing saved player marks:', e);
        return {};
      }
    }
    return {};
  };

  // Save player marks to localStorage
  const savePlayerMarks = (players) => {
    const marks = {};
    players.forEach(player => {
      if (player.starred || player.thumbsDown) {
        marks[player.playerID] = {
          starred: player.starred || false,
          thumbsDown: player.thumbsDown || false
        };
      }
    });
    localStorage.setItem('draftboard-player-marks', JSON.stringify(marks));
  };

  // Load player notes from localStorage
  const loadPlayerNotes = () => {
    const savedNotes = localStorage.getItem('draftboard-player-notes');
    if (savedNotes) {
      try {
        return JSON.parse(savedNotes);
      } catch (e) {
        console.error('Error parsing saved player notes:', e);
        return {};
      }
    }
    return {};
  };

  // Save player notes to localStorage
  const savePlayerNotes = (players) => {
    const notes = {};
    players.forEach(player => {
      if (player.notes && player.notes.trim()) {
        notes[player.playerID] = player.notes;
      }
    });
    localStorage.setItem('draftboard-player-notes', JSON.stringify(notes));
  };

  // Update player notes
  const updatePlayerNotes = (playerId, notes) => {
    const updatedPlayers = players.map(player => 
      player.playerID === playerId 
        ? { ...player, notes: notes }
        : player
    );
    setPlayers(updatedPlayers);
    savePlayerNotes(updatedPlayers);
  };

  // Update player AI suggestions
  const updatePlayerAiSuggestions = (playerId, aiSuggestions) => {
    const updatedPlayers = players.map(player => 
      player.playerID === playerId 
        ? { ...player, aiSuggestions: aiSuggestions }
        : player
    );
    setPlayers(updatedPlayers);
    // Note: AI suggestions are not persisted to localStorage as they're generated content
  };

  // Load draft status from localStorage
  const loadDraftStatus = () => {
    const savedDraftStatus = localStorage.getItem('draftboard-draft-status');
    if (savedDraftStatus) {
      try {
        return JSON.parse(savedDraftStatus);
      } catch (e) {
        console.error('Error parsing saved draft status:', e);
        return {};
      }
    }
    return {};
  };

  // Save draft status to localStorage
  const saveDraftStatus = (players) => {
    const draftStatus = {};
    players.forEach(player => {
      if (player.draftedByYou || player.draftedByOthers) {
        draftStatus[player.playerID] = {
          draftedByYou: player.draftedByYou || false,
          draftedByOthers: player.draftedByOthers || false
        };
      }
    });
    localStorage.setItem('draftboard-draft-status', JSON.stringify(draftStatus));
  };

  // Mark player as drafted by you
  const markPlayerDraftedByYou = (playerId) => {
    const updatedPlayers = players.map(player => 
      player.playerID === playerId 
        ? { ...player, draftedByYou: true, draftedByOthers: false }
        : player
    );
    setPlayers(updatedPlayers);
    saveDraftStatus(updatedPlayers);
  };

  // Mark player as drafted by others
  const markPlayerDraftedByOthers = (playerId) => {
    const updatedPlayers = players.map(player => 
      player.playerID === playerId 
        ? { ...player, draftedByOthers: true, draftedByYou: false }
        : player
    );
    setPlayers(updatedPlayers);
    saveDraftStatus(updatedPlayers);
  };

  // Load draft settings from localStorage
  const loadDraftSettings = () => {
    const savedSettings = localStorage.getItem('draftboard-draft-settings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error('Error parsing saved draft settings:', e);
        return null;
      }
    }
    return null;
  };

  // Save draft settings to localStorage
  const saveDraftSettings = (settings) => {
    localStorage.setItem('draftboard-draft-settings', JSON.stringify(settings));
  };

  // Update draft settings
  const updateDraftSettings = (newSettings) => {
    setDraftSettings(newSettings);
    saveDraftSettings(newSettings);
  };

  // Update position ranks for all players
  const updatePositionRanks = (updatedPlayers) => {
    // Group players by position and sort by custom rank
    const positionGroups = {};
    updatedPlayers.forEach(player => {
      if (!positionGroups[player.position]) {
        positionGroups[player.position] = [];
      }
      positionGroups[player.position].push(player);
    });

    // Sort each position group by custom rank and update posRank
    Object.keys(positionGroups).forEach(position => {
      positionGroups[position]
        .sort((a, b) => a.customRank - b.customRank)
        .forEach((player, index) => {
          player.posRank = index + 1;
        });
    });

    return updatedPlayers;
  };

  // Initialize players data and settings
  useEffect(() => {
    const savedRankings = loadRankings();
    const savedMarks = loadPlayerMarks();
    const savedNotes = loadPlayerNotes();
    const savedDraftStatus = loadDraftStatus();
    const savedSettings = loadDraftSettings();
    
    // Load saved settings if they exist
    if (savedSettings) {
      setDraftSettings(savedSettings);
    }
    
    // Add a custom rank and marks that users can modify
    const playersWithCustomRank = adpData.map((player, index) => ({
      ...player,
      customRank: savedRankings[player.playerID] || (index + 1),
      starred: savedMarks[player.playerID]?.starred || false,
      thumbsDown: savedMarks[player.playerID]?.thumbsDown || false,
      notes: savedNotes[player.playerID] || '',
      draftedByYou: savedDraftStatus[player.playerID]?.draftedByYou || false,
      draftedByOthers: savedDraftStatus[player.playerID]?.draftedByOthers || false
    }));
    
    // Update position ranks for initial data
    const playersWithUpdatedPosRanks = updatePositionRanks(playersWithCustomRank);
    
    setPlayers(playersWithUpdatedPosRanks);
    setSelectedPlayer(playersWithUpdatedPosRanks[0]); // Select first player by default
  }, []);

  // Move player up one position
  const movePlayerUp = (player, filteredPlayers, currentIndex) => {
    if (currentIndex === 0) return; // Already at top
    
    const updatedPlayers = [...players];
    const targetPlayer = filteredPlayers[currentIndex - 1];
    
    // Swap custom ranks
    const playerObj = updatedPlayers.find(p => p.playerID === player.playerID);
    const targetObj = updatedPlayers.find(p => p.playerID === targetPlayer.playerID);
    
    if (playerObj && targetObj) {
      const tempRank = playerObj.customRank;
      playerObj.customRank = targetObj.customRank;
      targetObj.customRank = tempRank;
      
      // Update position ranks for all players
      const playersWithUpdatedPosRanks = updatePositionRanks(updatedPlayers);
      
      setPlayers(playersWithUpdatedPosRanks);
      saveRankings(playersWithUpdatedPosRanks);
    }
  };

  // Move player down one position
  const movePlayerDown = (player, filteredPlayers, currentIndex) => {
    if (currentIndex === filteredPlayers.length - 1) return; // Already at bottom
    
    const updatedPlayers = [...players];
    const targetPlayer = filteredPlayers[currentIndex + 1];
    
    // Swap custom ranks
    const playerObj = updatedPlayers.find(p => p.playerID === player.playerID);
    const targetObj = updatedPlayers.find(p => p.playerID === targetPlayer.playerID);
    
    if (playerObj && targetObj) {
      const tempRank = playerObj.customRank;
      playerObj.customRank = targetObj.customRank;
      targetObj.customRank = tempRank;
      
      // Update position ranks for all players
      const playersWithUpdatedPosRanks = updatePositionRanks(updatedPlayers);
      
      setPlayers(playersWithUpdatedPosRanks);
      saveRankings(playersWithUpdatedPosRanks);
    }
  };

  // Reset rankings to original ADP
  const resetRankings = () => {
    localStorage.removeItem('draftboard-rankings');
    localStorage.removeItem('draftboard-player-marks');
    localStorage.removeItem('draftboard-player-notes');
    localStorage.removeItem('draftboard-draft-status');
    localStorage.removeItem('draftboard-draft-settings');
    
    // Reset settings to defaults
    const defaultSettings = {
      qbCount: 1,
      rbCount: 2,
      wrCount: 2,
      teCount: 1,
      flexCount: 1,
      kCount: 1,
      dstCount: 1,
      benchCount: 6,
      totalTeams: 12,
      yourDraftSpot: 1
    };
    setDraftSettings(defaultSettings);
    
    const playersWithOriginalRank = adpData.map((player, index) => ({
      ...player,
      customRank: index + 1,
      starred: false,
      thumbsDown: false,
      notes: '',
      draftedByYou: false,
      draftedByOthers: false
    }));
    // Update position ranks for the reset data
    const playersWithUpdatedPosRanks = updatePositionRanks(playersWithOriginalRank);
    setPlayers(playersWithUpdatedPosRanks);
  };

  // Toggle player star
  const togglePlayerStar = (playerId) => {
    const updatedPlayers = players.map(player => 
      player.playerID === playerId 
        ? { ...player, starred: !player.starred, thumbsDown: false } // Clear thumbs down if starring
        : player
    );
    setPlayers(updatedPlayers);
    savePlayerMarks(updatedPlayers);
  };

  // Toggle player thumbs down
  const togglePlayerThumbsDown = (playerId) => {
    const updatedPlayers = players.map(player => 
      player.playerID === playerId 
        ? { ...player, thumbsDown: !player.thumbsDown, starred: false } // Clear star if thumbs down
        : player
    );
    setPlayers(updatedPlayers);
    savePlayerMarks(updatedPlayers);
  };

  // Handle player selection
  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
  };

  // Update selected player when players array changes
  useEffect(() => {
    if (selectedPlayer && players.length > 0) {
      const updatedSelectedPlayer = players.find(p => p.playerID === selectedPlayer.playerID);
      if (updatedSelectedPlayer) {
        setSelectedPlayer(updatedSelectedPlayer);
      }
    }
  }, [players, selectedPlayer]);

  return (
    <div>
      {!isDuringDraft && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => {
              // Clear draft status when starting a new draft
              localStorage.removeItem('draftboard-draft-status');
              const clearedPlayers = players.map(player => ({
                ...player,
                draftedByYou: false,
                draftedByOthers: false
              }));
              setPlayers(clearedPlayers);
              navigate('/during-draft');
            }}
            className="px-4 py-2 bg-zinc-900 hover:bg-black text-white rounded-lg font-medium transition-colors"
          >
            Start Draft
          </button>
        </div>
      )}

      {isDuringDraft ? (
        <DuringDraftPage
          players={players}
          selectedPosition={selectedPosition}
          setSelectedPosition={setSelectedPosition}
          selectedPlayer={selectedPlayer}
          positions={positions}
          handlePlayerClick={handlePlayerClick}
          togglePlayerStar={togglePlayerStar}
          togglePlayerThumbsDown={togglePlayerThumbsDown}
          updatePlayerNotes={updatePlayerNotes}
          markPlayerDraftedByYou={markPlayerDraftedByYou}
          markPlayerDraftedByOthers={markPlayerDraftedByOthers}
          draftSettings={draftSettings}
          updatePlayerAiSuggestions={updatePlayerAiSuggestions}
        />
      ) : (
        <PreDraftPage
          players={players}
          setPlayers={setPlayers}
          selectedPosition={selectedPosition}
          setSelectedPosition={setSelectedPosition}
          selectedPlayer={selectedPlayer}
          positions={positions}
          movePlayerUp={movePlayerUp}
          movePlayerDown={movePlayerDown}
          resetRankings={resetRankings}
          handlePlayerClick={handlePlayerClick}
          togglePlayerStar={togglePlayerStar}
          togglePlayerThumbsDown={togglePlayerThumbsDown}
          updatePlayerNotes={updatePlayerNotes}
          draftSettings={draftSettings}
          updateDraftSettings={updateDraftSettings}
        />
      )}
    </div>
  );
}

export default DraftBoardManager;