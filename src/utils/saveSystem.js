// Save/Load system for player rankings

export const exportRankings = (players) => {
  try {
    // Extract only the relevant data for rankings
    const rankingsData = {
      exportDate: new Date().toISOString(),
      version: "1.0",
      players: players.map(player => ({
        playerID: player.playerID,
        longName: player.longName,
        position: player.position,
        team: player.team,
        customRank: player.customRank,
        starred: player.starred || false,
        thumbsDown: player.thumbsDown || false,
        notes: player.notes || "",
        adpRank: player.adpRank // Keep original ADP for reference
      }))
    };

    // Create downloadable file
    const dataStr = JSON.stringify(rankingsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `draftboard-rankings-${new Date().toISOString().split('T')[0]}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    return { success: true, message: 'Rankings exported successfully!' };
  } catch (error) {
    console.error('Error exporting rankings:', error);
    return { success: false, message: 'Failed to export rankings' };
  }
};

export const importRankings = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    if (file.type !== 'application/json') {
      reject(new Error('Please select a valid JSON file'));
      return;
    }

    // Security: Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      reject(new Error('File too large. Maximum size is 5MB.'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        
        // Validate file structure
        if (!importedData.players || !Array.isArray(importedData.players)) {
          reject(new Error('Invalid file format - missing players array'));
          return;
        }

        // Security: Limit array size
        if (importedData.players.length > 1000) {
          reject(new Error('File contains too many players. Maximum is 1000.'));
          return;
        }

        // Validate required fields
        const requiredFields = ['playerID', 'longName', 'position'];
        const invalidPlayers = importedData.players.filter(player => 
          !requiredFields.every(field => player.hasOwnProperty(field))
        );

        if (invalidPlayers.length > 0) {
          reject(new Error('Invalid file format - missing required player fields'));
          return;
        }

        resolve({
          success: true,
          data: importedData,
          message: `Successfully imported ${importedData.players.length} player rankings`
        });
      } catch (error) {
        reject(new Error('Invalid JSON file format'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

export const mergeImportedRankings = (currentPlayers, importedData) => {
  try {
    const importedPlayers = importedData.players;
    
    // Create a map of imported players by playerID for quick lookup
    const importedMap = new Map();
    importedPlayers.forEach(player => {
      importedMap.set(player.playerID, player);
    });

    // Merge imported data with current players
    const updatedPlayers = currentPlayers.map(currentPlayer => {
      const importedPlayer = importedMap.get(currentPlayer.playerID);
      
      if (importedPlayer) {
        // Merge imported rankings while preserving current draft status
        return {
          ...currentPlayer,
          customRank: importedPlayer.customRank !== undefined ? importedPlayer.customRank : currentPlayer.customRank,
          starred: importedPlayer.starred !== undefined ? importedPlayer.starred : currentPlayer.starred,
          thumbsDown: importedPlayer.thumbsDown !== undefined ? importedPlayer.thumbsDown : currentPlayer.thumbsDown,
          notes: importedPlayer.notes !== undefined ? importedPlayer.notes : currentPlayer.notes,
          // Keep current draft status - don't import this
          draftedByYou: currentPlayer.draftedByYou,
          draftedByOthers: currentPlayer.draftedByOthers
        };
      }
      
      return currentPlayer;
    });

    return {
      success: true,
      players: updatedPlayers,
      stats: {
        total: currentPlayers.length,
        updated: importedPlayers.length,
        matched: currentPlayers.filter(p => importedMap.has(p.playerID)).length
      }
    };
  } catch (error) {
    console.error('Error merging rankings:', error);
    return {
      success: false,
      message: 'Failed to merge imported rankings'
    };
  }
};