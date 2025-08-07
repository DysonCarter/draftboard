import { useState, useEffect } from 'react';
import { getPositionColorStyle } from '../utils/colors';

function FlipDisplay({ availablePlayers, draftedPlayers, draftSettings, picksUntilNext }) {
  const [currentDisplay, setCurrentDisplay] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  // Cycle through displays every 7 seconds
  useEffect(() => {
    console.log('FlipDisplay: Setting up 7-second interval');
    const interval = setInterval(() => {
      console.log('FlipDisplay: Flipping display');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentDisplay((prev) => (prev + 1) % 4);
        setIsFlipping(false);
      }, 250); // Half of the flip animation
    }, 7000);

    return () => {
      console.log('FlipDisplay: Cleaning up interval');
      clearInterval(interval);
    };
  }, []);

  // Calculate projected next 6 players
  const getProjectedPlayers = () => {
    if (!availablePlayers || picksUntilNext <= 0) return [];
    // Get 6 players starting from the projected position
    const startIndex = Math.min(picksUntilNext, availablePlayers.length) - 1;
    return availablePlayers.slice(startIndex, startIndex + 6);
  };

  // Calculate position needs
  const getPositionCounts = () => {
    if (!draftedPlayers || !draftSettings) return {};
    
    const counts = {
      QB: draftedPlayers.filter(p => p.position === 'QB').length,
      RB: draftedPlayers.filter(p => p.position === 'RB').length,
      WR: draftedPlayers.filter(p => p.position === 'WR').length,
      TE: draftedPlayers.filter(p => p.position === 'TE').length,
      K: draftedPlayers.filter(p => p.position === 'K').length,
      DST: draftedPlayers.filter(p => p.position === 'DST').length,
    };

    return counts;
  };

  const projectedPlayers = getProjectedPlayers();
  const positionCounts = getPositionCounts();

  const getDisplayContent = () => {
    switch (currentDisplay) {
      case 0:
        // Projected next players
        if (picksUntilNext === 0) {
          return {
            title: "YOUR TURN",
            content: "PICK NOW!"
          };
        } else if (projectedPlayers.length > 0) {
          return {
            title: "PROJECTED AVAILABLE",
            content: (
              <div className="grid grid-cols-3 gap-1 text-lg font-bold w-full">
                {projectedPlayers.map((player, index) => (
                  <div key={player.playerID} className="truncate">
                    {player.longName}
                  </div>
                ))}
              </div>
            )
          };
        } else {
          return {
            title: "PROJECTED",
            content: "N/A"
          };
        }

      case 1:
        // Draft wisdom quote
        return {
          title: "DRAFT WISDOM",
          content: "Your league isn't won on draft day, but it can be lost"
        };

      case 2:
        // Position needs
        return {
          title: "ROSTER COUNT",
          content: (
            <div className="grid grid-cols-3 gap-2 text-lg font-bold w-full">
              <div>
                <span style={getPositionColorStyle('QB')} className="px-1 rounded text-lg">QB</span>: {positionCounts.QB}
              </div>
              <div>
                <span style={getPositionColorStyle('RB')} className="px-1 rounded text-lg">RB</span>: {positionCounts.RB}
              </div>
              <div>
                <span style={getPositionColorStyle('WR')} className="px-1 rounded text-lg">WR</span>: {positionCounts.WR}
              </div>
              <div>
                <span style={getPositionColorStyle('TE')} className="px-1 rounded text-lg">TE</span>: {positionCounts.TE}
              </div>
              <div>
                <span style={getPositionColorStyle('K')} className="px-1 rounded text-lg">K</span>: {positionCounts.K}
              </div>
              <div>
                <span style={getPositionColorStyle('DST')} className="px-1 rounded text-lg">DST</span>: {positionCounts.DST}
              </div>
            </div>
          )
        };

      case 3:
        // Motivational message
        return {
          title: "MOTIVATION",
          content: "LET'S BE GREAT TODAY"
        };

      default:
        return { title: "", content: "" };
    }
  };

  const { title, content } = getDisplayContent();

  return (
    <div className="bg-zinc-900 rounded-lg p-3 text-center h-32 flex flex-col justify-between">
      <div className="text-xs text-gray-400 font-medium">{title}</div>
      <div 
        className={`${typeof content === 'string' ? 'text-xl' : 'text-lg'} font-bold text-white transition-transform duration-500 leading-tight px-1 ${
          isFlipping ? 'scale-y-0' : 'scale-y-100'
        }`}
        style={{ transformOrigin: 'center' }}
      >
        {typeof content === 'string' ? content : content}
      </div>
      <div></div> {/* Spacer for justify-between */}
    </div>
  );
}

export default FlipDisplay;