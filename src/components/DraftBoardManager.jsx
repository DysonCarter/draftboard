import { useState, useEffect } from 'react';
import PreDraftPage from './PreDraftPage';
import adpData from '../data/adp_enriched.json';

function DraftBoardManager() {
  const [players, setPlayers] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

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

  // Initialize players data
  useEffect(() => {
    const savedRankings = loadRankings();
    const savedMarks = loadPlayerMarks();
    
    // Add a custom rank and marks that users can modify
    const playersWithCustomRank = adpData.map((player, index) => ({
      ...player,
      customRank: savedRankings[player.playerID] || (index + 1),
      starred: savedMarks[player.playerID]?.starred || false,
      thumbsDown: savedMarks[player.playerID]?.thumbsDown || false
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
    const playersWithOriginalRank = adpData.map((player, index) => ({
      ...player,
      customRank: index + 1,
      starred: false,
      thumbsDown: false
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
    <PreDraftPage
      players={players}
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
    />
  );
}

export default DraftBoardManager;